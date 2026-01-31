/**
 * Tests for API key redaction in error messages
 * Verifies that secrets are not leaked in error output
 */

import { describe, it, expect } from 'vitest';
import { redactSecrets } from '../src/utils/security-utils.js';

describe('API Key Redaction', () => {
    describe('redactSecrets', () => {
        it('should redact OpenAI API keys', () => {
            const input = 'Error: Invalid key sk-1234567890abcdefghijklmnopqrstuvwxyz';
            const result = redactSecrets(input);
            expect(result).toBe('Error: Invalid key [REDACTED_API_KEY]');
        });

        it('should redact Anthropic API keys', () => {
            const input = 'ANTHROPIC_API_KEY=sk-ant-api01-ABC123xyz456def789ghi123jkl456mno';
            const result = redactSecrets(input);
            expect(result).toContain('REDACTED');
            expect(result).not.toContain('ABC123xyz456');
        });

        it('should redact Google API keys', () => {
            const input = 'AIzaSyABCDEFGHIJKLMNOPQRSTUVWXYZabcdefg';
            const result = redactSecrets(input);
            expect(result).toBe('[REDACTED_GOOGLE_KEY]');
        });

        it('should redact GitHub PATs', () => {
            const input = 'github_pat_11ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcd';
            const result = redactSecrets(input);
            expect(result).toBe('[REDACTED_GITHUB_PAT]');
        });

        it('should handle multiple secrets in one message', () => {
            const input = 'Error: Keys sk-abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrs and AIzaSyABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFG are invalid';
            const result = redactSecrets(input);
            expect(result).toContain('[REDACTED_API_KEY]');
            expect(result).toContain('[REDACTED_GOOGLE_KEY]');
        });

        it('should not modify legitimate error messages without secrets', () => {
            const input = 'Error: File not found';
            const result = redactSecrets(input);
            expect(result).toBe('Error: File not found');
        });

        it('should handle null input', () => {
            const result = redactSecrets(null as any);
            expect(result).toBe('null');
        });

        it('should handle empty strings', () => {
            const result = redactSecrets('');
            expect(result).toBe('');
        });
    });
});
