/**
 * VY Prompt Master - Safety Validator
 * Implements policy router checks from the VY Unified Framework
 */

import { sanitizeInput } from '../utils/security-utils.js';
import type { VYPromptSpec, ValidationResult, ValidationError, ValidationWarning, PolicyClassification } from '../types.js';

/**
 * Enhanced normalization for text analysis with Unicode support
 * Prevents homoglyph attacks and obfuscation
 */
export function normalizeText(text: string): string {
    if (!text || typeof text !== 'string') {
        return '';
    }

    // First apply comprehensive sanitization
    const sanitized = sanitizeInput(text.toLowerCase());

    // Then apply normalization for pattern matching
    return sanitized
        .replace(/\s+/g, '') // Remove all whitespace
        .replace(/_/g, '') // Remove underscores
        .replace(/[^\w\s]/g, '') // Remove punctuation
        .replace(/0/g, 'o') // Replace zeros with o's
        .replace(/1/g, 'i') // Replace ones with i's
        .replace(/2/g, 'z') // Replace twos with z's
        .replace(/3/g, 'e') // Replace threes with e's
        .replace(/4/g, 'a') // Replace fours with a's
        .replace(/5/g, 's') // Replace fives with s's
        .replace(/6/g, 'g') // Replace sixes with g's
        .replace(/7/g, 't') // Replace sevens with t's
        .replace(/8/g, 'b') // Replace eights with b's
        .replace(/9/g, 'g'); // Replace nines with g's
}

/**
 * Detects and prevents homoglyph attacks
 * Replaces visually similar Unicode characters with ASCII equivalents
 * Comprehensive mapping for Cyrillic, Greek, and other homoglyphs
 */
export function detectHomoglyphs(text: string): string {
    if (!text || typeof text !== 'string') {
        return '';
    }

    // Apply NFKC normalization first to standardize character representations
    // This converts compatibility characters to their canonical form
    const normalized = text.normalize('NFKC').toLowerCase();

    // Comprehensive homoglyph mapping
    // Sources: Cyrillic, Greek, Latin look-alikes, fullwidth characters
    const homoglyphMap: Record<string, string> = {
        // Cyrillic letters that look like Latin
        'а': 'a', 'о': 'o', 'е': 'e', 'с': 'c', 'р': 'p', 'у': 'y',
        'и': 'i', 'м': 'm', 'н': 'n', 'к': 'k', 'в': 'b', 'з': 'z',
        'д': 'd', 'ѕ': 's', 'ѵ': 'v',
        // Cyrillic uppercase
        'А': 'a', 'В': 'b', 'С': 'c', 'Е': 'e', 'Н': 'h', 'І': 'i',
        'Ј': 'j', 'К': 'k', 'М': 'm', 'О': 'o', 'Р': 'p', 'Т': 't',
        'Х': 'x', 'У': 'y',
        // Greek letters
        'α': 'a', 'β': 'b', 'ε': 'e', 'ο': 'o', 'ρ': 'p', 'σ': 's',
        'υ': 'u', 'ν': 'v', 'γ': 'y', 'η': 'n', 'κ': 'k', 'μ': 'm',
        'ω': 'w', 'τ': 't', 'χ': 'x',
        // Greek uppercase
        'Α': 'a', 'Β': 'b', 'Γ': 'g', 'Δ': 'd', 'Ε': 'e', 'Ζ': 'z',
        'Η': 'h', 'Ι': 'i', 'Κ': 'k', 'Μ': 'm', 'Ν': 'n', 'Ο': 'o',
        'Ρ': 'p', 'Τ': 't', 'Υ': 'y', 'Χ': 'x', 'Ω': 'o', // omega looks like o
        // Latin look-alikes (already lowercased)
        'ꜵ': 'a', '𝚊': 'a', // Mathematical alphanumeric symbols
        // Fullwidth Latin letters
        'ａ': 'a', 'ｂ': 'b', 'ｃ': 'c', 'ｄ': 'd', 'ｅ': 'e', 'ｆ': 'f',
        'ｇ': 'g', 'ｈ': 'h', 'ｉ': 'i', 'ｊ': 'j', 'ｋ': 'k', 'ｌ': 'l',
        'ｍ': 'm', 'ｎ': 'n', 'ｏ': 'o', 'ｐ': 'p', 'ｑ': 'q', 'ｒ': 'r',
        'ｓ': 's', 'ｔ': 't', 'ｕ': 'u', 'ｖ': 'v', 'ｗ': 'w', 'ｘ': 'x',
        'ｙ': 'y', 'ｚ': 'z',
        // Zero-width and invisible characters (remove them)
        '\u200b': '', // zero-width space
        '\u200c': '', // zero-width non-joiner
        '\u200d': '', // zero-width joiner
        '\u2060': '', // word joiner
        '\ufeff': '', // BOM
    };

    // Use manual character-by-character replacement for better Unicode handling
    let result = '';
    for (const char of normalized) {
        result += char in homoglyphMap ? homoglyphMap[char] : char;
    }

    return result;
}

/** Disallowed content patterns per the VY Unified Framework */
const DISALLOWED_PATTERNS = [
    { pattern: /reverseengineer/i, reason: 'Reverse engineering instructions are not permitted' },
    { pattern: /competitorbuild/i, reason: 'Competitor-building guidance is not permitted' },
    { pattern: /jailbreak/i, reason: 'Jailbreak instructions are not permitted' },
    { pattern: /bypass(security|auth|filter|restriction)/i, reason: 'Bypass/evasion content is not permitted' },
    { pattern: /credentialharvest/i, reason: 'Credential harvesting is not permitted' },
    { pattern: /systemprompt/i, reason: 'System prompt disclosure is not permitted' },
    { pattern: /password|secret|apikey/i, reason: 'Credential handling should be manual, not automated' },
];

/** High-risk action keywords that require confirmation */
const HIGH_RISK_KEYWORDS = [
    'delete', 'remove', 'clear', 'erase', 'format', 'wipe',
    'send', 'submit', 'post', 'publish', 'share',
    'pay', 'purchase', 'buy', 'transfer', 'transaction',
    'uninstall', 'terminate', 'shutdown', 'disable',
];

/** Normalized high-risk action keywords for obfuscation detection */
const NORMALIZED_HIGH_RISK_KEYWORDS = HIGH_RISK_KEYWORDS.map(kw => normalizeText(kw));

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
    if (!taskDescription || typeof taskDescription !== 'string') {
        return {
            classification: 'ambiguous',
            reason: 'Invalid or empty task description',
            inputsMissing: ['valid_task_description'],
        };
    }

    // Apply comprehensive sanitization first
    const sanitizedDesc = sanitizeInput(taskDescription);

    // Apply homoglyph detection (combats visual spoofing)
    const homoglyphSafeDesc = detectHomoglyphs(sanitizedDesc);

    // Normalize the input to detect obfuscated content
    const normalizedDesc = normalizeText(homoglyphSafeDesc);

    // Check for disallowed content using normalized text
    for (const { pattern, reason } of DISALLOWED_PATTERNS) {
        // Test against both original normalized and homoglyph-safe text
        if (pattern.test(normalizedDesc) || pattern.test(homoglyphSafeDesc)) {
            return { classification: 'disallowed', reason };
        }
    }

    // Also check the original text for high-risk keywords
    const lowerDesc = sanitizedDesc.toLowerCase();
    const hasHighRiskKeyword = HIGH_RISK_KEYWORDS.some(keyword =>
        lowerDesc.includes(keyword)
    ) || NORMALIZED_HIGH_RISK_KEYWORDS.some(normalizedKeyword =>
        normalizedDesc.includes(normalizedKeyword)
    );
    if (hasHighRiskKeyword) {
        return { classification: 'high_risk_irreversible' };
    }

    // Check for ambiguous/incomplete requests
    if (sanitizedDesc.trim().length < 10) {
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
