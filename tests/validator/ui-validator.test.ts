/**
 * VY Prompt Master - UI Validator Tests
 */

import { describe, it, expect } from 'vitest';
import { validateUI, validateRequiredFields } from '../../src/validator/ui-validator.js';
import type { VYPromptSpec, VYStep } from '../../src/types.js';

function createStep(overrides: Partial<VYStep> = {}): VYStep {
    return {
        step_id: 'step_001_test_action',
        intent: 'Test intent for this step',
        locate: 'Test UI element location description',
        confirm_target: 'Verify the element is correct',
        act: 'Click the button',
        verify_outcome: 'Button click was successful',
        fallback_paths: ['Use keyboard shortcut instead'],
        safety_gate: 'safe',
        ...overrides,
    };
}

function createSpec(steps: VYStep[]): VYPromptSpec {
    return {
        identity: 'VY Test Agent',
        purpose: 'Test purpose for validation testing',
        context: {
            platform: 'macOS',
            access_method: 'desktop',
            auth_state: 'logged_in',
            environment: 'macOS Sonoma',
        },
        inputs: [{ name: 'test_input', required: true, description: 'Test input' }],
        task: {
            goal: 'Complete the test successfully',
            steps,
        },
        constraints: ['Test constraint here'],
        output_format: { type: 'yaml' },
        self_check: ['Did the test pass correctly?'],
    };
}

describe('UI Validator', () => {
    describe('validateUI', () => {
        it('should pass for valid steps', () => {
            const spec = createSpec([createStep()]);
            const result = validateUI(spec);
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should error for invalid step_id format', () => {
            const spec = createSpec([createStep({ step_id: 'invalid_step' })]);
            const result = validateUI(spec);
            expect(result.valid).toBe(false);
            expect(result.errors.some(e => e.code === 'UI_INVALID_STEP_ID')).toBe(true);
        });

        it('should error for step_id with uppercase', () => {
            const spec = createSpec([createStep({ step_id: 'step_001_Test' })]);
            const result = validateUI(spec);
            expect(result.valid).toBe(false);
            expect(result.errors.some(e => e.code === 'UI_INVALID_STEP_ID')).toBe(true);
        });

        it('should error for short intent', () => {
            const spec = createSpec([createStep({ intent: 'Short' })]);
            const result = validateUI(spec);
            expect(result.valid).toBe(false);
            expect(result.errors.some(e => e.code === 'UI_INTENT_TOO_SHORT')).toBe(true);
        });

        it('should error for short locate', () => {
            const spec = createSpec([createStep({ locate: 'Button' })]);
            const result = validateUI(spec);
            expect(result.valid).toBe(false);
            expect(result.errors.some(e => e.code === 'UI_LOCATE_TOO_SHORT')).toBe(true);
        });

        it('should error for vague UI references', () => {
            const spec = createSpec([createStep({ locate: 'the button' })]);
            const result = validateUI(spec);
            expect(result.valid).toBe(false);
            expect(result.errors.some(e => e.code === 'UI_VAGUE_REFERENCE')).toBe(true);
        });

        it('should error for past tense in act', () => {
            const spec = createSpec([createStep({ act: 'Clicked the button' })]);
            const result = validateUI(spec);
            expect(result.valid).toBe(false);
            expect(result.errors.some(e => e.code === 'UI_PAST_TENSE')).toBe(true);
        });

        it('should warn for Control key usage (should be Command)', () => {
            const spec = createSpec([createStep({ act: 'Press Control+C to copy' })]);
            const result = validateUI(spec);
            expect(result.warnings.some(w => w.code === 'UI_WRONG_MODIFIER_KEY')).toBe(true);
        });

        it('should warn for missing fallback paths on non-safe steps', () => {
            const spec = createSpec([createStep({
                safety_gate: 'caution',
                fallback_paths: [],
            })]);
            const result = validateUI(spec);
            expect(result.warnings.some(w => w.code === 'UI_MISSING_FALLBACK')).toBe(true);
        });

        it('should error for duplicate step IDs', () => {
            const spec = createSpec([
                createStep({ step_id: 'step_001_first' }),
                createStep({ step_id: 'step_001_first' }), // duplicate
            ]);
            const result = validateUI(spec);
            expect(result.valid).toBe(false);
            expect(result.errors.some(e => e.code === 'UI_DUPLICATE_STEP_ID')).toBe(true);
        });

        it('should warn for non-ascending step numbers', () => {
            const spec = createSpec([
                createStep({ step_id: 'step_002_second' }),
                createStep({ step_id: 'step_001_first' }), // out of order
            ]);
            const result = validateUI(spec);
            expect(result.errors.some(e => e.code === 'UI_STEP_SEQUENCE_INVALID')).toBe(true);
        });
    });

    describe('validateRequiredFields', () => {
        it('should pass when all fields present', () => {
            const spec = createSpec([createStep()]);
            const result = validateRequiredFields(spec);
            expect(result.valid).toBe(true);
        });

        it('should error for missing field', () => {
            const incompleteStep = createStep();
            // @ts-expect-error - Intentionally removing required field for test
            delete incompleteStep.verify_outcome;

            const spec = createSpec([incompleteStep]);
            const result = validateRequiredFields(spec);
            expect(result.valid).toBe(false);
            expect(result.errors.some(e => e.code === 'UI_MISSING_FIELD')).toBe(true);
        });
    });
});
