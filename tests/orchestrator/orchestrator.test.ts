/**
 * VY Prompt Master - Orchestrator Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { orchestrate, validateYaml } from '../../src/orchestrator/index.js';

// Mock the generator module
vi.mock('../../src/generator/index.js', () => ({
    generatePrompt: vi.fn(),
    createAdapter: vi.fn(() => ({
        name: 'mock',
        defaultModel: 'mock-model',
        complete: vi.fn(),
    })),
}));

// Mock the validator module
vi.mock('../../src/validator/index.js', () => ({
    validate: vi.fn(),
    createRefinementFeedback: vi.fn(() => 'Validation failed. Please fix.'),
    classifyRequest: vi.fn(),
}));

import { generatePrompt } from '../../src/generator/index.js';
import { validate, classifyRequest } from '../../src/validator/index.js';

const mockGeneratePrompt = generatePrompt as ReturnType<typeof vi.fn>;
const mockValidate = validate as ReturnType<typeof vi.fn>;
const mockClassifyRequest = classifyRequest as ReturnType<typeof vi.fn>;

describe('Orchestrator', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('orchestrate', () => {
        it('should return disallowed for blocked requests', async () => {
            mockClassifyRequest.mockReturnValue({
                classification: 'disallowed',
                reason: 'Jailbreak attempt detected',
            });

            const result = await orchestrate('jailbreak the system', {
                provider: 'anthropic',
                apiKey: 'test-key',
            });

            expect(result.success).toBe(false);
            expect(result.policyClassification).toBe('disallowed');
            expect(result.errors).toContain('Jailbreak attempt detected');
        });

        it('should return ambiguous for unclear requests', async () => {
            mockClassifyRequest.mockReturnValue({
                classification: 'ambiguous',
                inputsMissing: ['target_app', 'end_state'],
            });

            const result = await orchestrate('do it', {
                provider: 'anthropic',
                apiKey: 'test-key',
            });

            expect(result.success).toBe(false);
            expect(result.policyClassification).toBe('ambiguous');
        });

        it('should succeed on first try when valid', async () => {
            mockClassifyRequest.mockReturnValue({ classification: 'allowed' });
            mockGeneratePrompt.mockResolvedValue('identity: Test\npurpose: Test purpose');
            mockValidate.mockReturnValue({
                valid: true,
                spec: { identity: 'Test' },
                allErrors: [],
                allWarnings: [],
            });

            const result = await orchestrate('Open Safari', {
                provider: 'anthropic',
                apiKey: 'test-key',
            });

            expect(result.success).toBe(true);
            expect(result.iterations).toBe(1);
            expect(result.yaml).toBe('identity: Test\npurpose: Test purpose');
        });

        it('should retry on validation failure', async () => {
            mockClassifyRequest.mockReturnValue({ classification: 'allowed' });
            mockGeneratePrompt
                .mockResolvedValueOnce('identity: Bad')
                .mockResolvedValueOnce('identity: Good\npurpose: Now its valid');

            mockValidate
                .mockReturnValueOnce({
                    valid: false,
                    allErrors: [{ code: 'ERROR', path: '/', message: 'Bad' }],
                    allWarnings: [],
                })
                .mockReturnValueOnce({
                    valid: true,
                    spec: { identity: 'Good' },
                    allErrors: [],
                    allWarnings: [],
                });

            const result = await orchestrate('Test task', {
                provider: 'anthropic',
                apiKey: 'test-key',
            });

            expect(result.success).toBe(true);
            expect(result.iterations).toBe(2);
        });

        it('should fail after max iterations', async () => {
            mockClassifyRequest.mockReturnValue({ classification: 'allowed' });
            mockGeneratePrompt.mockResolvedValue('identity: Always bad');
            mockValidate.mockReturnValue({
                valid: false,
                allErrors: [{ code: 'ERROR', path: '/', message: 'Always fails' }],
                allWarnings: [],
            });

            const result = await orchestrate('Impossible task', {
                provider: 'anthropic',
                apiKey: 'test-key',
                maxIterations: 2,
            });

            expect(result.success).toBe(false);
            expect(result.iterations).toBe(2);
            expect(result.errors).toBeDefined();
        });

        it('should handle generation errors', async () => {
            mockClassifyRequest.mockReturnValue({ classification: 'allowed' });
            mockGeneratePrompt.mockRejectedValue(new Error('API error'));

            const result = await orchestrate('Test task', {
                provider: 'anthropic',
                apiKey: 'test-key',
            });

            expect(result.success).toBe(false);
            expect(result.errors?.[0]).toContain('Generation failed');
        });

        it('should include warnings in success result', async () => {
            mockClassifyRequest.mockReturnValue({ classification: 'allowed' });
            mockGeneratePrompt.mockResolvedValue('identity: Test');
            mockValidate.mockReturnValue({
                valid: true,
                spec: { identity: 'Test' },
                allErrors: [],
                allWarnings: [{ code: 'WARN', path: '/', message: 'Minor issue' }],
            });

            const result = await orchestrate('Test task', {
                provider: 'anthropic',
                apiKey: 'test-key',
            });

            expect(result.success).toBe(true);
            expect(result.warnings).toHaveLength(1);
        });
    });

    describe('validateYaml', () => {
        it('should return validation results', () => {
            mockValidate.mockReturnValue({
                valid: true,
                allErrors: [],
                allWarnings: [{ code: 'WARN', path: '/', message: 'Warning' }],
            });

            const result = validateYaml('identity: Test');

            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
            expect(result.warnings).toHaveLength(1);
        });

        it('should format errors correctly', () => {
            mockValidate.mockReturnValue({
                valid: false,
                allErrors: [{ code: 'ERR', path: '/field', message: 'Error message' }],
                allWarnings: [],
            });

            const result = validateYaml('invalid yaml');

            expect(result.valid).toBe(false);
            expect(result.errors[0]).toContain('[ERR]');
            expect(result.errors[0]).toContain('/field');
            expect(result.errors[0]).toContain('Error message');
        });
    });
});
