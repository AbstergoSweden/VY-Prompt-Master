#!/usr/bin/env node
/**
 * VY Prompt Master - CLI
 * Command-line interface for VY prompt generation and validation
 */

import { Command } from 'commander';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import chalk from 'chalk';
import { config } from 'dotenv';
import { parse as parseYaml } from 'yaml';
import { orchestrate, validateYaml } from '../orchestrator/index.js';
import { loadConfiguration } from '../config.js';
import { logger } from '../logger.js';
import { classifyRequest } from '../validator/safety-validator.js';
import { validatePath, redactSecrets } from '../utils/security-utils.js';
import type { ProviderName } from '../generator/index.js';


// Load configuration
config();
const appConfig = loadConfiguration();

const program = new Command();

program
    .name('vy-prompt')
    .description('VY Prompt Master - AI-powered prompt generation and validation')
    .version('1.0.0');

// Generate command
program
    .command('generate')
    .description('Generate a VY prompt specification from a task description')
    .argument('<task>', 'Task description (e.g., "Clear Safari cookies")')
    .option('-p, --provider <provider>', 'AI provider (anthropic, openai, or mock)', appConfig.defaultProvider)
    .option('-m, --model <model>', 'Model to use', appConfig.defaultModel)
    .option('-o, --output <file>', 'Output file path')
    .option('-i, --iterations <number>', 'Max refinement iterations', appConfig.maxIterations.toString())
    .option('-s, --strict', 'Strict mode - fail on warnings', appConfig.strictMode)
    .option('-v, --verbose', 'Verbose output', appConfig.verbose)
    .option('-d, --dry-run', 'Dry run mode - validate inputs without calling AI APIs')
    .action(async (task: string, options: {
        provider: string;
        model?: string;
        output?: string;
        iterations: string;
        strict?: boolean;
        verbose?: boolean;
        dryRun?: boolean;
    }) => {
        // Determine API key
        const provider = options.provider as ProviderName;
        const apiKeyEnvVar = provider === 'anthropic' ? 'ANTHROPIC_API_KEY' : provider === 'openai' ? 'OPENAI_API_KEY' : null;
        const apiKey = apiKeyEnvVar ? process.env[apiKeyEnvVar] : undefined;

        if (!apiKey && provider !== 'mock' && !options.dryRun) {
            console.error(chalk.red(`Error: ${apiKeyEnvVar} environment variable not set.`));
            console.error(chalk.yellow(`Set it in .env or export ${apiKeyEnvVar}=your_actual_api_key_here`));
            process.exit(1);
        }

        if (options.dryRun) {
            console.log(chalk.blue('🧪 Dry run mode - validating inputs without calling AI APIs...'));
            console.log(chalk.gray(`Task: ${task}`));
            console.log(chalk.gray(`Provider: ${provider}`));

            // Just run policy classification in dry run mode
            const classification = classifyRequest(task);
            console.log(chalk.green(`Policy classification: ${classification.classification}`));

            if (classification.classification === 'disallowed') {
                console.error(chalk.red(`Request not allowed: ${classification.reason}`));
                process.exit(1);
            } else if (classification.classification === 'ambiguous') {
                console.log(chalk.yellow('Request is ambiguous. Missing inputs:'));
                classification.inputsMissing?.forEach(input => console.log(chalk.yellow(`  - ${input}`)));
                process.exit(1);
            } else {
                console.log(chalk.green('✅ Request would be allowed'));
            }
            return; // Exit early in dry run mode
        }

        console.log(chalk.blue('🚀 Generating VY prompt...'));
        console.log(chalk.gray(`Task: ${task}`));
        console.log(chalk.gray(`Provider: ${provider}`));

        try {
            const result = await orchestrate(task, {
                provider,
                apiKey: provider === 'mock' ? 'mock-key' : apiKey,
                model: options.model,
                maxIterations: parseInt(options.iterations, 10),
                strict: options.strict,
                verbose: options.verbose,
                onProgress: (stage, message, details) => {
                    if (options.verbose) {
                        logger.info(`Progress [${stage}]: ${message}`);
                        if (details) {
                            logger.debug(`Details: ${JSON.stringify(details)}`);
                        }
                    }
                }
            });

            if (!result.success) {
                console.error(chalk.red('\n❌ Generation failed'));
                console.error(chalk.red(`Policy: ${result.policyClassification}`));
                if (result.errors) {
                    console.error(chalk.red('\nErrors:'));
                    result.errors.forEach(e => console.error(chalk.red(`  • ${e}`)));
                }
                process.exit(1);
            }

            console.log(chalk.green(`\n✅ Success! (${result.iterations} iteration(s))`));

            if (result.warnings && result.warnings.length > 0) {
                console.log(chalk.yellow('\nWarnings:'));
                result.warnings.forEach(w => console.log(chalk.yellow(`  ⚠ ${w}`)));
            }

            // Output
            if (options.output) {
                try {
                    // Use secure path validation to prevent path traversal
                    const resolvedOutputPath = validatePath(options.output);
                    writeFileSync(resolvedOutputPath, result.yaml ?? '', 'utf-8');
                    console.log(chalk.green(`\nWritten to: ${resolvedOutputPath}`));
                } catch (error) {
                    const err = error as Error;
                    console.error(chalk.red(`\n❌ Security Error: ${err.message}`));
                    process.exit(1);
                }
            } else {
                console.log(chalk.cyan('\n--- Generated YAML ---\n'));
                console.log(result.yaml);
                console.log(chalk.cyan('\n--- End YAML ---'));
            }
        } catch (error) {
            const err = error as Error;
            const safeMessage = redactSecrets(err.message);
            const safeStack = options.verbose ? redactSecrets(err.stack || '') : '';
            console.error(chalk.red(`\n❌ Error: ${safeMessage}`));
            if (options.verbose && safeStack) {
                console.error(safeStack);
            }
            process.exit(1);
        }
    });

// Validate command
program
    .command('validate')
    .description('Validate an existing VY prompt YAML file')
    .argument('<file>', 'Path to YAML file to validate')
    .option('-v, --verbose', 'Verbose output')
    .action((file: string, options: { verbose?: boolean }) => {
        let filePath: string;
        try {
            // Use secure path validation to prevent path traversal
            filePath = validatePath(file);
        } catch (error) {
            const err = error as Error;
            logger.error(`Security Error: ${err.message}`);
            process.exit(1);
        }

        if (!existsSync(filePath)) {
            logger.error(`Error: File not found: ${filePath}`);
            process.exit(1);
        }

        console.log(chalk.blue(`🔍 Validating: ${file}`));

        const yamlContent = readFileSync(filePath, 'utf-8');
        const result = validateYaml(yamlContent, options.verbose);

        if (result.valid) {
            console.log(chalk.green('\n✅ Valid VY prompt specification'));

            if (result.warnings.length > 0) {
                console.log(chalk.yellow(`\n⚠ ${result.warnings.length} warning(s):`));
                result.warnings.forEach(w => console.log(chalk.yellow(`  ${w}`)));
            }
        } else {
            console.error(chalk.red('\n❌ Validation failed'));
            console.error(chalk.red(`\n${result.errors.length} error(s):`));
            result.errors.forEach(e => console.error(chalk.red(`  ${redactSecrets(String(e))}`)));

            if (result.warnings.length > 0) {
                console.log(chalk.yellow(`\n${result.warnings.length} warning(s):`));
                result.warnings.forEach(w => console.log(chalk.yellow(`  ${w}`)));
            }

            process.exit(1);
        }
    });

// Check command (quick schema check)
program
    .command('check')
    .description('Quick schema check without full validation')
    .argument('<file>', 'Path to YAML file')
    .action((file: string) => {
        let filePath: string;
        try {
            // Use secure path validation to prevent path traversal
            filePath = validatePath(file);
        } catch (error) {
            const err = error as Error;
            logger.error(`Security Error: ${err.message}`);
            process.exit(1);
        }

        if (!existsSync(filePath)) {
            logger.error(`Error: File not found: ${filePath}`);
            process.exit(1);
        }

        const yamlContent = readFileSync(filePath, 'utf-8');

        // Try to parse as YAML
        try {
            if (yamlContent.length > appConfig.yamlSizeLimit) {
                console.error(chalk.red(`❌ YAML too large (>${appConfig.yamlSizeLimit} bytes)`));
                process.exit(1);
            }

            const parsedUnknown = parseYaml(yamlContent, {
                schema: 'core',
                maxAliasCount: 100,
            });

            if (!parsedUnknown || typeof parsedUnknown !== 'object') {
                console.error(chalk.red('❌ YAML root must be an object'));
                process.exit(1);
            }

            const parsed = parsedUnknown as Record<string, unknown>;

            // Check for required top-level keys
            const requiredKeys = ['identity', 'purpose', 'context', 'inputs', 'task', 'constraints', 'output_format', 'self_check'];
            const missingKeys = requiredKeys.filter(k => !(k in parsed));

            if (missingKeys.length === 0) {
                console.log(chalk.green('✅ Basic structure OK'));
                const task = parsed['task'];
                const stepCount =
                    task && typeof task === 'object' && Array.isArray((task as Record<string, unknown>)['steps'])
                        ? ((task as Record<string, unknown>)['steps'] as unknown[]).length
                        : 0;
                console.log(chalk.gray(`   Steps: ${stepCount}`));
            } else {
                console.error(chalk.red('❌ Missing required keys:'));
                missingKeys.forEach(k => console.error(chalk.red(`   - ${k}`)));
                process.exit(1);
            }
        } catch (err) {
            const error = err as Error;
            const safeMessage = redactSecrets(error.message);
            console.error(chalk.red(`❌ YAML parse error: ${safeMessage}`));
            process.exit(1);
        }
    });

await program.parseAsync(process.argv);
