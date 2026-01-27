/**
 * VY Prompt Master - Orchestrator
 * Main pipeline coordinating generation, validation, and refinement
 */

import { generatePrompt, createAdapter } from '../generator/index.js';
import type { ProviderName, AIAdapterConfig } from '../generator/index.js';
import { validate, createRefinementFeedback, classifyRequest } from '../validator/index.js';
import type { VYPromptSpec, PolicyClassification } from '../types.js';
import { logger } from '../logger.js';

/** Progress callback function */
export type ProgressCallback = (stage: string, message: string, details?: Record<string, unknown>) => void;

/** Options for orchestration */
export interface OrchestrateOptions {
    /** AI provider to use */
    provider: ProviderName;
    /** API key for the provider (not required for mock provider) */
    apiKey?: string;
    /** Model to use (optional) */
    model?: string;
    /** Maximum refinement iterations */
    maxIterations?: number;
    /** Enable verbose logging */
    verbose?: boolean;
    /** Strict mode - fail on warnings */
    strict?: boolean;
    /** Progress callback for long-running operations */
    onProgress?: ProgressCallback;
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
 * Performs policy classification for the task
 * @param taskDescription - User's task description
 * @param options - Orchestration options
 * @returns Classification result or early termination result
 */
async function performPolicyClassification(
    taskDescription: string,
    options: OrchestrateOptions
): Promise<{ classification: any; earlyReturn?: OrchestrateResult }> {
    // Notify about policy classification stage
    options.onProgress?.('policy-classification', 'Starting policy classification');

    const classification = classifyRequest(taskDescription);

    if (options.verbose) {
        logger.info(`Policy classification: ${classification.classification}`);
    }

    if (classification.classification === 'disallowed') {
        return {
            classification,
            earlyReturn: {
                success: false,
                policyClassification: 'disallowed',
                iterations: 0,
                errors: [classification.reason || 'Request not permitted by policy router'],
            }
        };
    }

    if (classification.classification === 'ambiguous') {
        return {
            classification,
            earlyReturn: {
                success: false,
                policyClassification: 'ambiguous',
                iterations: 0,
                errors: ['Request is ambiguous. Please provide more details.'],
                warnings: classification.inputsMissing?.map(i => `Missing: ${i}`),
            }
        };
    }

    return { classification };
}

/**
 * Creates the AI adapter for the specified provider
 * @param options - Orchestration options
 * @returns Created AI adapter
 */
function createAIAdapter(options: OrchestrateOptions) {
    // Notify about adapter creation stage
    options.onProgress?.('adapter-creation', `Creating adapter for provider: ${options.provider}`);

    const adapterConfig: AIAdapterConfig = {
        apiKey: options.apiKey || 'mock-key', // Use mock key if not provided (for mock provider)
        model: options.model,
    };
    return createAdapter(options.provider, adapterConfig);
}

/**
 * Performs a single generation and validation cycle
 * @param adapter - The AI adapter to use
 * @param taskDescription - User's task description
 * @param validationErrors - Previous validation errors for refinement
 * @param iteration - Current iteration number
 * @param maxIterations - Maximum number of iterations
 * @param options - Orchestration options
 * @returns Generation result
 */
async function performGenerationCycle(
    adapter: any,
    taskDescription: string,
    validationErrors: string | undefined,
    iteration: number,
    maxIterations: number,
    options: OrchestrateOptions
): Promise<{
    yaml?: string;
    validationResult?: any;
    error?: string;
}> {
    // Notify about generation attempt
    options.onProgress?.('generation', `Generation attempt ${iteration}/${maxIterations}`, {
        attempt: iteration,
        maxAttempts: maxIterations
    });

    if (options.verbose) {
        logger.info(`Generation attempt ${iteration}/${maxIterations}`);
    }

    let yaml: string;
    try {
        yaml = await retryWithBackoff(() => generatePrompt(adapter, taskDescription, {
            verbose: options.verbose,
            validationErrors,
        }), 3, [429]); // Retry 3 times on rate limit errors (429)
    } catch (error) {
        const err = error as Error;
        return {
            error: `Generation failed: ${err.message}`
        };
    }

    // Notify about validation stage
    options.onProgress?.('validation', `Validating generated prompt (attempt ${iteration})`, {
        attempt: iteration
    });

    // Validate
    const validationResult = validate(yaml, taskDescription);

    if (options.verbose) {
        logger.info(`Validation: ${validationResult.valid ? 'PASSED' : 'FAILED'}`);
        logger.info(`Errors: ${validationResult.allErrors.length}, Warnings: ${validationResult.allWarnings.length}`);
    }

    return { yaml, validationResult };
}

/**
 * Processes validation results and determines if another iteration is needed
 * @param validationResult - The validation result
 * @param options - Orchestration options
 * @returns Processing result indicating success, continuation, or errors
 */
function processValidationResult(
    validationResult: any,
    options: OrchestrateOptions
): {
    success: boolean;
    yaml?: string;
    spec?: any;
    warnings?: string[];
    validationErrors?: string;
    continueIteration?: boolean;
} {
    // Check if valid
    if (validationResult.valid) {
        // In strict mode, also check warnings
        if (options.strict && validationResult.allWarnings.length > 0) {
            return {
                success: false,
                continueIteration: true,
                validationErrors: createRefinementFeedback(validationResult)
            };
        }

        // Map warnings only when needed
        const warnings = validationResult.allWarnings.map((w: any) => `[${w.code}] ${w.path}: ${w.message}`);
        return {
            success: true,
            warnings: warnings.length > 0 ? warnings : undefined
        };
    }

    // Prepare feedback for next iteration
    return {
        success: false,
        continueIteration: true,
        validationErrors: createRefinementFeedback(validationResult)
    };
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

    // Step 1: Policy Classification
    const { classification, earlyReturn } = await performPolicyClassification(taskDescription, options);

    if (earlyReturn) {
        return earlyReturn;
    }

    // Step 2: Create AI adapter
    const adapter = createAIAdapter(options);

    // Step 3: Generation loop with refinement
    let validationErrors: string | undefined;
    let lastErrors: string[] = [];
    let lastWarnings: string[] = [];

    for (let iteration = 1; iteration <= maxIterations; iteration++) {
        // Perform generation and validation cycle
        const cycleResult = await performGenerationCycle(
            adapter,
            taskDescription,
            validationErrors,
            iteration,
            maxIterations,
            options
        );

        if (cycleResult.error) {
            return {
                success: false,
                policyClassification: classification.classification,
                iterations: iteration,
                errors: [cycleResult.error],
            };
        }

        // Process validation results
        const processResult = processValidationResult(cycleResult.validationResult!, options);

        if (processResult.success) {
            options.onProgress?.('completion', 'Generation completed successfully', {
                iterations: iteration
            });

            return {
                success: true,
                yaml: cycleResult.yaml,
                spec: cycleResult.validationResult?.spec,
                policyClassification: classification.classification,
                iterations: iteration,
                warnings: processResult.warnings,
            };
        }

        // Store errors and warnings for final result if needed
        lastErrors = cycleResult.validationResult!.allErrors.map((e: any) => `[${e.code}] ${e.path}: ${e.message}`);
        lastWarnings = cycleResult.validationResult!.allWarnings.map((w: any) => `[${w.code}] ${w.path}: ${w.message}`);

        // Check if we should continue iterating
        if (!processResult.continueIteration) {
            break;
        }

        validationErrors = processResult.validationErrors;
    }

    // Max iterations reached without success
    const iterations = maxIterations;
    options.onProgress?.('completion', 'Max iterations reached without success', {
        iterations: iterations,
        errors: lastErrors.length,
        warnings: lastWarnings.length
    });

    return {
        success: false,
        yaml: undefined, // We don't have a valid YAML at this point
        policyClassification: classification.classification,
        iterations,
        errors: lastErrors,
        warnings: lastWarnings,
    };
}

/**
 * Retries an async function with exponential backoff
 * @param fn - The function to retry
 * @param maxRetries - Maximum number of retry attempts
 * @param retryOnStatusCodes - HTTP status codes that should trigger a retry
 * @returns Result of the function call
 */
async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number,
    retryOnStatusCodes: number[]
): Promise<T> {
    let lastError: Error | null = null;

    for (let i = 0; i <= maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error as Error;

            // Check if this is an API error with a status code we should retry on
            if (i < maxRetries &&
                lastError.message.includes('AI service request failed') &&
                retryOnStatusCodes.some(code => lastError?.message.includes(code.toString()))) {

                // Calculate delay with exponential backoff (1000ms * 2^attempt)
                const delay = Math.pow(2, i) * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }

            // If not a retryable error or max retries reached, rethrow
            throw lastError;
        }
    }

    // This shouldn't be reached, but TypeScript requires a return
    throw lastError || new Error('Unknown error in retryWithBackoff');
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
        logger.info(`Valid: ${result.valid}`);
        logger.info(`Errors: ${result.allErrors.length}`);
        logger.info(`Warnings: ${result.allWarnings.length}`);
    }

    return {
        valid: result.valid,
        errors: result.allErrors.map(e => `[${e.code}] ${e.path}: ${e.message}`),
        warnings: result.allWarnings.map(w => `[${w.code}] ${w.path}: ${w.message}`),
    };
}
