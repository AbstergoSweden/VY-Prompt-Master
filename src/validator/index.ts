/**
 * VY Prompt Master - Unified Validation Pipeline
 * Runs all validators in sequence and aggregates results
 */

import { parseAndValidate } from './schema-validator.js';
import { validateSafety, validateNoDisclosure, classifyRequest } from './safety-validator.js';
import { validateUI, validateRequiredFields } from './ui-validator.js';
import type { ValidationResult, ValidationError, ValidationWarning, VYPromptSpec, PolicyClassification } from '../types.js';

export { validateSchema, parseAndValidate } from './schema-validator.js';
export { validateSafety, validateNoDisclosure, classifyRequest } from './safety-validator.js';
export { validateUI, validateRequiredFields } from './ui-validator.js';

/**
 * Result of the full validation pipeline
 */
export interface FullValidationResult {
    valid: boolean;
    policyClassification?: PolicyClassification;
    spec?: VYPromptSpec;
    schemaResult: ValidationResult;
    safetyResult?: ValidationResult;
    uiResult?: ValidationResult;
    allErrors: ValidationError[];
    allWarnings: ValidationWarning[];
}

/**
 * Runs the complete validation pipeline on a YAML string
 * @param yamlContent - The YAML content to validate
 * @param taskDescription - Optional original task description for policy classification
 * @returns FullValidationResult with aggregated results
 */
export function validate(yamlContent: string, taskDescription?: string): FullValidationResult {
    const allErrors: ValidationError[] = [];
    const allWarnings: ValidationWarning[] = [];

    // Step 1: Schema validation
    const { spec, result: schemaResult } = parseAndValidate(yamlContent);
    allErrors.push(...schemaResult.errors);
    allWarnings.push(...schemaResult.warnings);

    // If schema validation fails, we can't proceed
    if (!spec) {
        return {
            valid: false,
            schemaResult,
            allErrors,
            allWarnings,
        };
    }

    // Step 2: Policy classification (if task description provided)
    let policyClassification: PolicyClassification | undefined;
    if (taskDescription) {
        const classification = classifyRequest(taskDescription);
        policyClassification = classification.classification;

        if (classification.classification === 'disallowed') {
            allErrors.push({
                path: '/',
                message: classification.reason || 'Request classified as disallowed by policy router',
                code: 'POLICY_DISALLOWED',
                severity: 'error',
            });
        }
    }

    // Step 3: Safety validation
    const safetyResult = validateSafety(spec);
    allErrors.push(...safetyResult.errors);
    allWarnings.push(...safetyResult.warnings);

    const disclosureResult = validateNoDisclosure(spec);
    allErrors.push(...disclosureResult.errors);
    allWarnings.push(...disclosureResult.warnings);

    // Step 4: UI validation
    const requiredFieldsResult = validateRequiredFields(spec);
    allErrors.push(...requiredFieldsResult.errors);

    const uiResult = validateUI(spec);
    allErrors.push(...uiResult.errors);
    allWarnings.push(...uiResult.warnings);

    return {
        valid: allErrors.length === 0,
        policyClassification,
        spec,
        schemaResult,
        safetyResult: {
            valid: safetyResult.valid && disclosureResult.valid,
            errors: [...safetyResult.errors, ...disclosureResult.errors],
            warnings: [...safetyResult.warnings, ...disclosureResult.warnings],
        },
        uiResult: {
            valid: uiResult.valid && requiredFieldsResult.valid,
            errors: [...uiResult.errors, ...requiredFieldsResult.errors],
            warnings: uiResult.warnings,
        },
        allErrors,
        allWarnings,
    };
}

/**
 * Formats validation errors for display or AI feedback
 * @param errors - Array of validation errors
 * @returns Formatted string for display
 */
export function formatErrors(errors: ValidationError[]): string {
    if (errors.length === 0) return 'No errors found.';

    return errors.map((err, i) =>
        `${i + 1}. [${err.code}] ${err.path}: ${err.message}`
    ).join('\n');
}

/**
 * Formats validation warnings for display
 * @param warnings - Array of validation warnings
 * @returns Formatted string for display
 */
export function formatWarnings(warnings: ValidationWarning[]): string {
    if (warnings.length === 0) return 'No warnings.';

    return warnings.map((warn, i) =>
        `${i + 1}. [${warn.code}] ${warn.path}: ${warn.message}`
    ).join('\n');
}

/**
 * Creates a structured feedback message for AI refinement
 * @param result - The validation result
 * @returns Structured feedback for the AI to correct errors
 */
export function createRefinementFeedback(result: FullValidationResult): string {
    if (result.valid) {
        return 'Validation passed. No corrections needed.';
    }

    const parts: string[] = [
        'The generated YAML failed validation. Please correct the following issues:\n',
    ];

    if (result.allErrors.length > 0) {
        parts.push('## Errors (must fix):\n');
        parts.push(formatErrors(result.allErrors));
        parts.push('\n');
    }

    if (result.allWarnings.length > 0) {
        parts.push('## Warnings (should fix):\n');
        parts.push(formatWarnings(result.allWarnings));
        parts.push('\n');
    }

    parts.push('\nPlease regenerate the YAML with these issues corrected.');

    return parts.join('');
}
