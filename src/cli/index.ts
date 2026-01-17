#!/usr/bin/env node
/**
 * VY Prompt Master - CLI
 * Command-line interface for VY prompt generation and validation
 */

import { Command } from 'commander';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import chalk from 'chalk';
import { config } from 'dotenv';
import { parse as parseYaml } from 'yaml';
import { orchestrate, validateYaml } from '../orchestrator/index.js';
import type { ProviderName } from '../generator/index.js';


// Load environment variables
config();

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
    .option('-p, --provider <provider>', 'AI provider (anthropic or openai)', 'anthropic')
    .option('-m, --model <model>', 'Model to use')
    .option('-o, --output <file>', 'Output file path')
    .option('-i, --iterations <number>', 'Max refinement iterations', '3')
    .option('-s, --strict', 'Strict mode - fail on warnings')
    .option('-v, --verbose', 'Verbose output')
    .action(async (task: string, options: {
        provider: string;
        model?: string;
        output?: string;
        iterations: string;
        strict?: boolean;
        verbose?: boolean;
    }) => {
        // Determine API key
        const provider = options.provider as ProviderName;
        const apiKeyEnvVar = provider === 'anthropic' ? 'ANTHROPIC_API_KEY' : 'OPENAI_API_KEY';
        const apiKey = process.env[apiKeyEnvVar];

        if (!apiKey) {
            console.error(chalk.red(`Error: ${apiKeyEnvVar} environment variable not set.`));
            console.error(chalk.yellow(`Set it in .env or export ${apiKeyEnvVar}=your-key`));
            process.exit(1);
        }

        console.log(chalk.blue('🚀 Generating VY prompt...'));
        console.log(chalk.gray(`Task: ${task}`));
        console.log(chalk.gray(`Provider: ${provider}`));

        try {
            const result = await orchestrate(task, {
                provider,
                apiKey,
                model: options.model,
                maxIterations: parseInt(options.iterations, 10),
                strict: options.strict,
                verbose: options.verbose,
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
                const outputPath = resolve(process.cwd(), options.output);
                writeFileSync(outputPath, result.yaml ?? '', 'utf-8');
                console.log(chalk.green(`\nWritten to: ${outputPath}`));
            } else {
                console.log(chalk.cyan('\n--- Generated YAML ---\n'));
                console.log(result.yaml);
                console.log(chalk.cyan('\n--- End YAML ---'));
            }
        } catch (error) {
            const err = error as Error;
            console.error(chalk.red(`\n❌ Error: ${err.message}`));
            if (options.verbose) {
                console.error(err.stack);
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
        const filePath = resolve(process.cwd(), file);

        if (!existsSync(filePath)) {
            console.error(chalk.red(`Error: File not found: ${filePath}`));
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
            result.errors.forEach(e => console.error(chalk.red(`  ${e}`)));

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
        const filePath = resolve(process.cwd(), file);

        if (!existsSync(filePath)) {
            console.error(chalk.red(`Error: File not found: ${filePath}`));
            process.exit(1);
        }

        const yamlContent = readFileSync(filePath, 'utf-8');

        // Try to parse as YAML
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const parsed = parseYaml(yamlContent) as Record<string, any>;

            // Check for required top-level keys
            const requiredKeys = ['identity', 'purpose', 'context', 'inputs', 'task', 'constraints', 'output_format', 'self_check'];
            const missingKeys = requiredKeys.filter(k => !(k in parsed));

            if (missingKeys.length === 0) {
                console.log(chalk.green('✅ Basic structure OK'));
                const stepCount = parsed.task?.steps?.length ?? 0;
                console.log(chalk.gray(`   Steps: ${stepCount}`));
            } else {
                console.error(chalk.red('❌ Missing required keys:'));
                missingKeys.forEach(k => console.error(chalk.red(`   - ${k}`)));
                process.exit(1);
            }
        } catch (err) {
            const error = err as Error;
            console.error(chalk.red(`❌ YAML parse error: ${error.message}`));
            process.exit(1);
        }
    });

program.parse();
