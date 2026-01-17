/**
 * VY Prompt Master - Prompt Generator Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generatePrompt, extractYaml } from '../../src/generator/prompt-generator.js';
import type { AIAdapter, AIResponse } from '../../src/generator/ai-adapters/base.js';

// Mock fs for framework loading
vi.mock('fs', async (importOriginal) => {
    const actual = await importOriginal<typeof import('fs')>();
    return {
        ...actual,
        readFileSync: vi.fn((path: string) => {
            if (path.includes('VY-Unified-Framework-v3.yaml')) {
                return `
identity: VY Prompt Engineering Framework
purpose: Generate safe, deterministic VY prompts
version: '3.0'
core_philosophy: 'If VY cannot verify it, VY should not execute it'
`;
            }
            return actual.readFileSync(path, 'utf-8');
        }),
    };
});

function createMockAdapter(response: string): AIAdapter {
    return {
        name: 'mock',
        defaultModel: 'mock-model',
        complete: vi.fn().mockResolvedValue({
            content: response,
            model: 'mock-model',
            usage: { inputTokens: 100, outputTokens: 200 },
        } as AIResponse),
    };
}

describe('Prompt Generator', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('generatePrompt', () => {
        it('should generate prompt from task description', async () => {
            const mockYaml = `---
identity: VY Safari Agent
purpose: Clear Safari cookies
context:
  platform: macOS
  access_method: desktop
`;
            const adapter = createMockAdapter(mockYaml);

            const result = await generatePrompt(adapter, 'Clear Safari cookies');

            expect(adapter.complete).toHaveBeenCalledTimes(1);
            expect(result).toContain('identity: VY Safari Agent');
        });

        it('should strip markdown code fences from response', async () => {
            const mockYaml = '```yaml\nidentity: Test\npurpose: Test purpose\n```';
            const adapter = createMockAdapter(mockYaml);

            const result = await generatePrompt(adapter, 'Test task');

            expect(result).not.toContain('```');
            expect(result).toContain('identity: Test');
        });

        it('should include validation errors in refinement request', async () => {
            const mockYaml = 'identity: Refined\npurpose: Refined test purpose';
            const adapter = createMockAdapter(mockYaml);

            await generatePrompt(adapter, 'Test task', {
                validationErrors: 'Error: Missing required field',
            });

            const callArgs = (adapter.complete as ReturnType<typeof vi.fn>).mock.calls[0][0];
            expect(callArgs.length).toBeGreaterThan(2);
            expect(callArgs.some((m: { content: string }) => m.content.includes('Error'))).toBe(true);
        });

        it('should log when verbose mode enabled', async () => {
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { });
            const adapter = createMockAdapter('identity: Test');

            await generatePrompt(adapter, 'Test', { verbose: true });

            expect(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });
    });

    describe('extractYaml', () => {
        it('should extract YAML from code block', () => {
            const content = 'Here is the YAML:\n```yaml\nidentity: Test\n```\nDone.';
            const result = extractYaml(content);
            expect(result).toBe('identity: Test');
        });

        it('should handle content starting with ---', () => {
            const content = '---\nidentity: Test\npurpose: Test';
            const result = extractYaml(content);
            expect(result).toBe('---\nidentity: Test\npurpose: Test');
        });

        it('should handle content starting with identity:', () => {
            const content = 'identity: Test\npurpose: Test';
            const result = extractYaml(content);
            expect(result).toBe('identity: Test\npurpose: Test');
        });

        it('should return trimmed content as fallback', () => {
            const content = '  some content  ';
            const result = extractYaml(content);
            expect(result).toBe('some content');
        });
    });
});
