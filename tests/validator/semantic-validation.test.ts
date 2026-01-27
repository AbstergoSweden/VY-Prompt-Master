/**
 * Tests for semantic validation rules
 * Tests step ID sequencing and uniqueness validation
 */

import { describe, it, expect } from 'vitest';
import { validateSpec, clearSchemaCache } from '../../src/validator/schema-validator.js';
import type { VYPromptSpec } from '../../src/types.js';

describe('Schema Validator - Semantic Rules', () => {
    beforeEach(() => {
        clearSchemaCache();
    });

    describe('Step ID Validation - Sequential and Uniqueness', () => {
        it('should accept valid sequential step IDs', () => {
            const spec: VYPromptSpec = {
                identity: 'VY Test Agent',
                purpose: 'Test purpose with sufficient length for validation to pass properly',
                context: {
                    platform: 'vy',
                    access_method: 'desktop',
                    auth_state: 'user_logged_in_as_needed',
                    environment: 'macOS test environment'
                },
                inputs: [{
                    name: 'test_input',
                    required: true,
                    description: 'Test input description'
                }],
                task: {
                    goal: 'Test goal with sufficient length for validation to pass',
                    steps: [{
                        step_id: 'step_001_test_action',
                        intent: 'First test step with sufficient description length',
                        locate: 'Test target element in the interface',
                        confirm_target: 'Confirm the target is visible and accessible',
                        act: 'Perform the test action on the target',
                        verify_outcome: 'Verify the test action completed successfully',
                        fallback_paths: [],
                        safety_gate: 'safe'
                    }, {
                        step_id: 'step_002_test_action',
                        intent: 'Second test step with sufficient description length',
                        locate: 'Test target element in the interface',
                        confirm_target: 'Confirm the target is visible and accessible',
                        act: 'Perform the test action on the target',
                        verify_outcome: 'Verify the test action completed successfully',
                        fallback_paths: [],
                        safety_gate: 'safe'
                    }]
                },
                constraints: ['For macOS only'],
                output_format: {
                    type: 'yaml',
                    structure: 'Test output'
                },
                self_check: ['verify_each_step_executes_successfully']
            };

            const result = validateSpec(spec);
            const semanticErrors = result.errors.filter(e => e.code.startsWith('SEMANTIC_'));
            expect(semanticErrors).toHaveLength(0);
        });

        it('should detect non-sequential step IDs with gaps', () => {
            const spec: VYPromptSpec = {
                identity: 'VY Test Agent',
                purpose: 'Test purpose with sufficient length for validation to pass properly',
                context: {
                    platform: 'vy',
                    access_method: 'desktop',
                    auth_state: 'user_logged_in_as_needed',
                    environment: 'macOS test environment'
                },
                inputs: [{
                    name: 'test_input',
                    required: true,
                    description: 'Test input description'
                }],
                task: {
                    goal: 'Test goal with sufficient length for validation to pass',
                    steps: [{
                        step_id: 'step_001_test_action',
                        intent: 'First test step with sufficient description length',
                        locate: 'Test target element in the interface',
                        confirm_target: 'Confirm the target is visible and accessible',
                        act: 'Perform the test action on the target',
                        verify_outcome: 'Verify the test action completed successfully',
                        fallback_paths: [],
                        safety_gate: 'safe'
                    }, {
                        step_id: 'step_003_test_action', // Gap: missing step_002
                        intent: 'Second test step with sufficient description length',
                        locate: 'Test target element in the interface',
                        confirm_target: 'Confirm the target is visible and accessible',
                        act: 'Perform the test action on the target',
                        verify_outcome: 'Verify the test action completed successfully',
                        fallback_paths: [],
                        safety_gate: 'safe'
                    }]
                },
                constraints: ['For macOS only'],
                output_format: {
                    type: 'yaml',
                    structure: 'Test output'
                },
                self_check: ['verify_each_step_executes_successfully']
            };

            const result = validateSpec(spec);
            const semanticErrors = result.errors.filter(e => e.code.startsWith('SEMANTIC_'));
            expect(semanticErrors.length).toBeGreaterThanOrEqual(1);
            expect(semanticErrors.some(e => e.code === 'SEMANTIC_STEP_ID_SEQUENCE_GAP')).toBe(true);
        });

        it('should detect duplicate step IDs', () => {
            const spec: VYPromptSpec = {
                identity: 'VY Test Agent',
                purpose: 'Test purpose with sufficient length for validation to pass properly',
                context: {
                    platform: 'vy',
                    access_method: 'desktop',
                    auth_state: 'user_logged_in_as_needed',
                    environment: 'macOS test environment'
                },
                inputs: [{
                    name: 'test_input',
                    required: true,
                    description: 'Test input description'
                }],
                task: {
                    goal: 'Test goal with sufficient length for validation to pass',
                    steps: [{
                        step_id: 'step_001_test_action',
                        intent: 'First test step with sufficient description length',
                        locate: 'Test target element in the interface',
                        confirm_target: 'Confirm the target is visible and accessible',
                        act: 'Perform the test action on the target',
                        verify_outcome: 'Verify the test action completed successfully',
                        fallback_paths: [],
                        safety_gate: 'safe'
                    }, {
                        step_id: 'step_001_test_action', // Duplicate!
                        intent: 'Second test step with sufficient description length',
                        locate: 'Test target element in the interface',
                        confirm_target: 'Confirm the target is visible and accessible',
                        act: 'Perform the test action on the target',
                        verify_outcome: 'Verify the test action completed successfully',
                        fallback_paths: [],
                        safety_gate: 'safe'
                    }]
                },
                constraints: ['For macOS only'],
                output_format: {
                    type: 'yaml',
                    structure: 'Test output'
                },
                self_check: ['verify_each_step_executes_successfully']
            };

            const result = validateSpec(spec);
            const semanticErrors = result.errors.filter(e => e.code.startsWith('SEMANTIC_'));
            expect(semanticErrors.length).toBeGreaterThanOrEqual(1);
            expect(semanticErrors.some(e => e.code === 'SEMANTIC_DUPLICATE_STEP_ID')).toBe(true);
        });
    });
});
