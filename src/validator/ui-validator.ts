/**
 * VY Prompt Master - UI Validator
 * Validates UI action primitives and the locate→confirm→act→verify pattern
 */

import type { VYPromptSpec, VYStep, ValidationResult, ValidationError, ValidationWarning } from '../types.js';

/** Step ID pattern: step_NNN_descriptive_name */
const STEP_ID_PATTERN = /^step_\d{3}_[a-z][a-z0-9_]*$/;

/** Minimum length requirements per the schema */
const MIN_LENGTHS = {
    intent: 10,
    locate: 10,
    act: 5,
    verify_outcome: 10,
    fallback_path: 10,
};

/** Required 8 fields per step */
const REQUIRED_STEP_FIELDS = [
    'step_id',
    'intent',
    'locate',
    'confirm_target',
    'act',
    'verify_outcome',
    'fallback_paths',
    'safety_gate',
] as const;

/**
 * Validates a single UI action step
 * @param step - The step to validate
 * @param index - Step index for error reporting
 * @returns Array of validation errors
 */
function validateStep(step: VYStep, index: number): { errors: ValidationError[]; warnings: ValidationWarning[] } {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const stepPath = `/task/steps/${index}`;

    // Validate step_id format
    if (!STEP_ID_PATTERN.test(step.step_id)) {
        errors.push({
            path: `${stepPath}/step_id`,
            message: `Invalid step_id format: "${step.step_id}". Expected format: step_NNN_descriptive_name (e.g., step_001_launch_safari)`,
            code: 'UI_INVALID_STEP_ID',
            severity: 'error',
        });
    }

    // Validate minimum lengths
    if (step.intent.length < MIN_LENGTHS.intent) {
        errors.push({
            path: `${stepPath}/intent`,
            message: `Intent too short (${step.intent.length} chars). Minimum ${MIN_LENGTHS.intent} required. Intent should clearly describe what this step accomplishes.`,
            code: 'UI_INTENT_TOO_SHORT',
            severity: 'error',
        });
    }

    if (step.locate.length < MIN_LENGTHS.locate) {
        errors.push({
            path: `${stepPath}/locate`,
            message: `Locate description too short (${step.locate.length} chars). Minimum ${MIN_LENGTHS.locate} required. Locate should provide unambiguous UI element description with unique identifiers.`,
            code: 'UI_LOCATE_TOO_SHORT',
            severity: 'error',
        });
    }

    if (step.act.length < MIN_LENGTHS.act) {
        errors.push({
            path: `${stepPath}/act`,
            message: `Act description too short (${step.act.length} chars). Minimum ${MIN_LENGTHS.act} required. Act should specify specific action with exact parameters.`,
            code: 'UI_ACT_TOO_SHORT',
            severity: 'error',
        });
    }

    if (step.verify_outcome.length < MIN_LENGTHS.verify_outcome) {
        errors.push({
            path: `${stepPath}/verify_outcome`,
            message: `Verify outcome too short (${step.verify_outcome.length} chars). Minimum ${MIN_LENGTHS.verify_outcome} required. Verify outcome should describe observable evidence of success.`,
            code: 'UI_VERIFY_TOO_SHORT',
            severity: 'error',
        });
    }

    // Validate fallback_paths
    if (!step.fallback_paths || step.fallback_paths.length === 0) {
        // Only warn for non-safe steps
        if (step.safety_gate !== 'safe') {
            warnings.push({
                path: `${stepPath}/fallback_paths`,
                message: `Step "${step.step_id}" has no fallback paths. Critical steps should have at least one fallback.`,
                code: 'UI_MISSING_FALLBACK',
                severity: 'warning',
            });
        }
    } else {
        // Validate each fallback path length
        step.fallback_paths.forEach((fb, fbIndex) => {
            if (fb.length < MIN_LENGTHS.fallback_path) {
                errors.push({
                    path: `${stepPath}/fallback_paths/${fbIndex}`,
                    message: `Fallback path too short (${fb.length} chars). Minimum ${MIN_LENGTHS.fallback_path} required.`,
                    code: 'UI_FALLBACK_TOO_SHORT',
                    severity: 'error',
                });
            }
        });
    }

    // Check for vague UI references
    const vaguePatterns = [
        { pattern: /^the button$/i, field: 'locate' },
        { pattern: /^the field$/i, field: 'locate' },
        { pattern: /^the link$/i, field: 'locate' },
        { pattern: /^click it$/i, field: 'act' },
        { pattern: /^do it$/i, field: 'act' },
    ];

    for (const { pattern, field } of vaguePatterns) {
        const value = step[field as keyof VYStep] as string;
        if (pattern.test(value)) {
            errors.push({
                path: `${stepPath}/${field}`,
                message: `Vague UI reference detected: "${value}". Use unique, descriptive identifiers.`,
                code: 'UI_VAGUE_REFERENCE',
                severity: 'error',
            });
        }
    }

    // Check for past tense in act (should be imperative)
    if (/\b(clicked|typed|selected|scrolled|pressed)\b/i.test(step.act)) {
        errors.push({
            path: `${stepPath}/act`,
            message: `Act uses past tense. Use imperative present tense (e.g., "Click" not "Clicked").`,
            code: 'UI_PAST_TENSE',
            severity: 'error',
        });
    }

    // Check for Control key usage (should be Command on macOS)
    if (/\bcontrol\+|\bctrl\+/i.test(step.act)) {
        warnings.push({
            path: `${stepPath}/act`,
            message: `Step uses Control key. On macOS, use Command (⌘) instead of Control.`,
            code: 'UI_WRONG_MODIFIER_KEY',
            severity: 'warning',
        });
    }

    // Check for common Windows-specific shortcuts that should be macOS equivalents
    const windowsShortcuts = [
        { pattern: /\balt\+/i, replacement: 'Option (⌥)' },
        { pattern: /\bwindows|win\+/i, replacement: 'Command (⌘)' },
        { pattern: /\bshift\+del\b/i, replacement: 'Cmd+Backspace' },
    ];

    for (const { pattern, replacement } of windowsShortcuts) {
        if (pattern.test(step.act)) {
            warnings.push({
                path: `${stepPath}/act`,
                message: `Step uses Windows-specific shortcut. On macOS, consider using ${replacement} instead.`,
                code: 'UI_WINDOWS_SHORTCUT_USED',
                severity: 'warning',
            });
        }
    }

    return { errors, warnings };
}

/**
 * Validates all UI action steps in a VY prompt specification
 * @param spec - The VY prompt specification to validate
 * @returns ValidationResult with UI-related errors and warnings
 */
export function validateUI(spec: VYPromptSpec): ValidationResult {
    const allErrors: ValidationError[] = [];
    const allWarnings: ValidationWarning[] = [];

    const seenIds = new Set<string>();
    const duplicates = new Set<string>();
    let previousStepNumber = -1;

    // Validate each step in a single pass
    spec.task.steps.forEach((step, index) => {
        // 1. Validate Step Content
        const { errors, warnings } = validateStep(step, index);
        allErrors.push(...errors);
        allWarnings.push(...warnings);

        // 2. Check for unique step IDs
        if (seenIds.has(step.step_id)) {
            duplicates.add(step.step_id);
        } else {
            seenIds.add(step.step_id);
        }

        // 3. Check step numbering sequence
        const match = step.step_id.match(/^step_(\d{3})_/);
        if (match) {
            const currentStepNumber = parseInt(match[1], 10);
            // Check if the step number is valid (non-negative)
            if (isNaN(currentStepNumber) || currentStepNumber < 0) {
                allErrors.push({
                    path: `/task/steps/${index}/step_id`,
                    message: `Invalid step number in step_id: "${step.step_id}". Step numbers must be non-negative integers.`,
                    code: 'UI_INVALID_STEP_NUMBER',
                    severity: 'error',
                });
            } else {
                // Check if the step number is in strict ascending order (incrementing by 1)
                if (previousStepNumber !== -1 && currentStepNumber !== previousStepNumber + 1) {
                    allErrors.push({
                        path: `/task/steps/${index}/step_id`,
                        message: `Step numbers must be in strict ascending sequence. Expected ${previousStepNumber + 1}, got ${currentStepNumber}.`,
                        code: 'UI_STEP_SEQUENCE_INVALID',
                        severity: 'error',
                    });
                }
                // Update previous number if current is valid
                previousStepNumber = currentStepNumber;
            }
        }
    });

    if (duplicates.size > 0) {
        allErrors.push({
            path: '/task/steps',
            message: `Duplicate step_id(s) found: ${Array.from(duplicates).join(', ')}`,
            code: 'UI_DUPLICATE_STEP_ID',
            severity: 'error',
        });
    }

    return {
        valid: allErrors.length === 0,
        errors: allErrors,
        warnings: allWarnings,
    };
}

/**
 * Checks that all 8 required fields are present and non-empty in each step
 * @param spec - The VY prompt specification
 * @returns ValidationResult
 */
export function validateRequiredFields(spec: VYPromptSpec): ValidationResult {
    const errors: ValidationError[] = [];

    spec.task.steps.forEach((step, index) => {
        const stepPath = `/task/steps/${index}`;

        for (const field of REQUIRED_STEP_FIELDS) {
            const value = step[field as keyof VYStep];
            if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
                errors.push({
                    path: `${stepPath}/${field}`,
                    message: `Missing required field: ${field}`,
                    code: 'UI_MISSING_FIELD',
                    severity: 'error',
                });
            }
        }
    });

    return {
        valid: errors.length === 0,
        errors,
        warnings: [],
    };
}
