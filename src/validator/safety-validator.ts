/**
 * VY Prompt Master - Safety Validator
 * Implements policy router checks from the VY Unified Framework
 */

import type { VYPromptSpec, ValidationResult, ValidationError, ValidationWarning, PolicyClassification } from '../types.js';

/** Disallowed content patterns per the VY Unified Framework */
const DISALLOWED_PATTERNS = [
    { pattern: /reverse\s*engineer/i, reason: 'Reverse engineering instructions are not permitted' },
    { pattern: /competitor\s*build/i, reason: 'Competitor-building guidance is not permitted' },
    { pattern: /jailbreak/i, reason: 'Jailbreak instructions are not permitted' },
    { pattern: /bypass\s*(security|auth|filter|restriction)/i, reason: 'Bypass/evasion content is not permitted' },
    { pattern: /credential\s*harvest/i, reason: 'Credential harvesting is not permitted' },
    { pattern: /system\s*prompt/i, reason: 'System prompt disclosure is not permitted' },
    { pattern: /password|secret|api[_\s]?key/i, reason: 'Credential handling should be manual, not automated' },
];

/** High-risk action keywords that require confirmation */
const HIGH_RISK_KEYWORDS = [
    'delete', 'remove', 'clear', 'erase', 'format', 'wipe',
    'send', 'submit', 'post', 'publish', 'share',
    'pay', 'purchase', 'buy', 'transfer', 'transaction',
    'uninstall', 'terminate', 'shutdown', 'disable',
];

/**
 * Classifies a task description according to the policy router
 * @param taskDescription - The user's task description
 * @returns Policy classification result
 */
export function classifyRequest(taskDescription: string): {
    classification: PolicyClassification;
    reason?: string;
    inputsMissing?: string[];
} {
    const lowerDesc = taskDescription.toLowerCase();

    // Check for disallowed content
    for (const { pattern, reason } of DISALLOWED_PATTERNS) {
        if (pattern.test(taskDescription)) {
            return { classification: 'disallowed', reason };
        }
    }

    // Check for high-risk irreversible actions
    const hasHighRiskKeyword = HIGH_RISK_KEYWORDS.some(keyword => lowerDesc.includes(keyword));
    if (hasHighRiskKeyword) {
        return { classification: 'high_risk_irreversible' };
    }

    // Check for ambiguous/incomplete requests
    if (taskDescription.trim().length < 10) {
        return {
            classification: 'ambiguous',
            inputsMissing: ['target_application', 'desired_end_state'],
        };
    }

    return { classification: 'allowed' };
}

/**
 * Checks a VY prompt specification for safety issues
 * @param spec - The VY prompt specification to validate
 * @returns ValidationResult with safety-related errors and warnings
 */
export function validateSafety(spec: VYPromptSpec): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Check purpose for disallowed content
    for (const { pattern, reason } of DISALLOWED_PATTERNS) {
        if (pattern.test(spec.purpose)) {
            errors.push({
                path: '/purpose',
                message: reason,
                code: 'SAFETY_DISALLOWED_CONTENT',
                severity: 'error',
            });
        }
    }

    // Check each step for safety issues
    spec.task.steps.forEach((step, index) => {
        const stepPath = `/task/steps/${index}`;

        // Check if irreversible actions are properly gated
        const actLower = step.act.toLowerCase();
        const hasIrreversibleAction = HIGH_RISK_KEYWORDS.some(k => actLower.includes(k));

        if (hasIrreversibleAction && step.safety_gate !== 'irreversible_requires_confirmation') {
            errors.push({
                path: `${stepPath}/safety_gate`,
                message: `Step "${step.step_id}" contains irreversible action but safety_gate is "${step.safety_gate}". Should be "irreversible_requires_confirmation".`,
                code: 'SAFETY_GATE_MISMATCH',
                severity: 'error',
            });
        }

        // Check for credential-related actions
        if (/password|credential|secret|login.*auto/i.test(step.act)) {
            errors.push({
                path: `${stepPath}/act`,
                message: `Step "${step.step_id}" appears to automate credential handling. Credentials must be entered manually by the user.`,
                code: 'SAFETY_CREDENTIAL_AUTOMATION',
                severity: 'error',
            });
        }

        // Check for confirmation prompt on irreversible actions
        if (step.safety_gate === 'irreversible_requires_confirmation' && !step.user_confirmation_required) {
            warnings.push({
                path: `${stepPath}`,
                message: `Step "${step.step_id}" has irreversible_requires_confirmation gate but user_confirmation_required is not set to true.`,
                code: 'SAFETY_MISSING_CONFIRMATION_FLAG',
                severity: 'warning',
            });
        }
    });

    // Check constraints for safety requirements
    const hasConfirmationConstraint = spec.constraints.some(c =>
        /confirm|user.*approval|explicit.*consent/i.test(c)
    );

    const hasIrreversibleStep = spec.task.steps.some(s =>
        s.safety_gate === 'irreversible_requires_confirmation'
    );

    if (hasIrreversibleStep && !hasConfirmationConstraint) {
        warnings.push({
            path: '/constraints',
            message: 'Prompt contains irreversible steps but no constraint requires user confirmation.',
            code: 'SAFETY_MISSING_CONFIRMATION_CONSTRAINT',
            severity: 'warning',
        });
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings,
    };
}

/**
 * Validates that the prompt does not attempt to disclose internal instructions
 * @param spec - The VY prompt specification
 * @returns ValidationResult
 */
export function validateNoDisclosure(spec: VYPromptSpec): ValidationResult {
    const errors: ValidationError[] = [];

    // Check for attempts to extract system prompt
    const allText = [
        spec.purpose,
        spec.task.goal,
        ...spec.task.steps.map(s => `${s.intent} ${s.act}`),
    ].join(' ');

    if (/print|show|reveal|display.*system.*prompt|instruction/i.test(allText)) {
        errors.push({
            path: '/',
            message: 'Prompt appears to attempt system prompt or instruction disclosure.',
            code: 'SAFETY_DISCLOSURE_ATTEMPT',
            severity: 'error',
        });
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings: [],
    };
}
