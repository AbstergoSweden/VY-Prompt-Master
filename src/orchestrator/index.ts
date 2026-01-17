/**
 * VY Prompt Master - Orchestrator
 * Main pipeline coordinating generation, validation, and refinement
 */

import { generatePrompt, createAdapter } from '../generator/index.js';
import type { ProviderName, AIAdapterConfig } from '../generator/index.js';
import { validate, createRefinementFeedback, classifyRequest } from '../validator/index.js';
import type { VYPromptSpec, PolicyClassification } from '../types.js';

/** Options for orchestration */
export interface OrchestrateOptions {
    /** AI provider to use */
    provider: ProviderName;
    /** API key for the provider */
    apiKey: string;
    /** Model to use (optional) */
    model?: string;
    /** Maximum refinement iterations */
    maxIterations?: number;
    /** Enable verbose logging */
    verbose?: boolean;
    /** Strict mode - fail on warnings */
    strict?: boolean;
}

/** Orchestration result */
export interface OrchestrateResult {
    success: boolean;
    yaml?: string;
    spec?: VYPromptSpec;
    policyClassification: PolicyClassification;
    iterations: number;
    totalTokens?: { input: number; output: number };
    errors?: string[];
    warnings?: string[];
}

/**
 * Orchestrates the VY prompt generation pipeline
 * @param taskDescription - User's task description
 * @param options - Orchestration options
 * @returns Orchestration result
 */
export async function orchestrate(
    taskDescription: string,
    options: OrchestrateOptions
): Promise<OrchestrateResult> {
    const maxIterations = options.maxIterations ?? 3;
    let iterations = 0;

    // Step 1: Policy Classification
    const classification = classifyRequest(taskDescription);

    if (options.verbose) {
        console.log(`[Orchestrator] Policy classification: ${classification.classification}`);
    }

    if (classification.classification === 'disallowed') {
        return {
            success: false,
            policyClassification: 'disallowed',
            iterations: 0,
            errors: [classification.reason || 'Request not permitted by policy router'],
        };
    }

    if (classification.classification === 'ambiguous') {
        return {
            success: false,
            policyClassification: 'ambiguous',
            iterations: 0,
            errors: ['Request is ambiguous. Please provide more details.'],
            warnings: classification.inputsMissing?.map(i => `Missing: ${i}`),
        };
    }

    // Step 2: Create AI adapter
    const adapterConfig: AIAdapterConfig = {
        apiKey: options.apiKey,
        model: options.model,
    };
    const adapter = createAdapter(options.provider, adapterConfig);

    // Step 3: Generation loop with refinement
    let yaml: string | undefined;
    let validationErrors: string | undefined;
    let lastErrors: string[] = [];
    let lastWarnings: string[] = [];

    while (iterations < maxIterations) {
        iterations++;

        if (options.verbose) {
            console.log(`[Orchestrator] Generation attempt ${iterations}/${maxIterations}`);
        }

        // Generate prompt
        try {
            yaml = await generatePrompt(adapter, taskDescription, {
                verbose: options.verbose,
                validationErrors,
            });
        } catch (error) {
            const err = error as Error;
            return {
                success: false,
                policyClassification: classification.classification,
                iterations,
                errors: [`Generation failed: ${err.message}`],
            };
        }

        // Validate
        const validationResult = validate(yaml, taskDescription);

        lastErrors = validationResult.allErrors.map(e => `[${e.code}] ${e.path}: ${e.message}`);
        lastWarnings = validationResult.allWarnings.map(w => `[${w.code}] ${w.path}: ${w.message}`);

        if (options.verbose) {
            console.log(`[Orchestrator] Validation: ${validationResult.valid ? 'PASSED' : 'FAILED'}`);
            console.log(`[Orchestrator] Errors: ${lastErrors.length}, Warnings: ${lastWarnings.length}`);
        }

        // Check if valid
        if (validationResult.valid) {
            // In strict mode, also check warnings
            if (options.strict && validationResult.allWarnings.length > 0) {
                validationErrors = createRefinementFeedback(validationResult);
                continue;
            }

            return {
                success: true,
                yaml,
                spec: validationResult.spec,
                policyClassification: classification.classification,
                iterations,
                warnings: lastWarnings.length > 0 ? lastWarnings : undefined,
            };
        }

        // Prepare feedback for next iteration
        validationErrors = createRefinementFeedback(validationResult);
    }

    // Max iterations reached without success
    return {
        success: false,
        yaml,
        policyClassification: classification.classification,
        iterations,
        errors: lastErrors,
        warnings: lastWarnings,
    };
}

/**
 * Validates an existing YAML file
 * @param yamlContent - YAML content to validate
 * @param verbose - Enable verbose output
 * @returns Validation result summary
 */
export function validateYaml(yamlContent: string, verbose = false): {
    valid: boolean;
    errors: string[];
    warnings: string[];
} {
    const result = validate(yamlContent);

    if (verbose) {
        console.log(`[Validator] Valid: ${result.valid}`);
        console.log(`[Validator] Errors: ${result.allErrors.length}`);
        console.log(`[Validator] Warnings: ${result.allWarnings.length}`);
    }

    return {
        valid: result.valid,
        errors: result.allErrors.map(e => `[${e.code}] ${e.path}: ${e.message}`),
        warnings: result.allWarnings.map(w => `[${w.code}] ${w.path}: ${w.message}`),
    };
}
