/**
 * VY Prompt Master - Security Tests
 * Tests for security vulnerabilities and protections
 */

import { describe, it, expect } from 'vitest';
import { classifyRequest } from '../src/validator/safety-validator.js';
import { validateSchema } from '../src/validator/schema-validator.js';
import { normalizeText } from '../src/validator/safety-validator.js';

describe('Security Tests', () => {
    describe('Input Sanitization', () => {
        it('should detect obfuscated disallowed content', () => {
            // Test various obfuscation techniques
            const obfuscatedInputs = [
                'reverse   engineer', // Extra spaces
                'reverse-engineer',   // Hyphen
                'reverse_engineer',   // Underscore
                'rev3rs3 3ngin33r',  // Number substitutions
                'r3v3rs3 3ng1n33r', // More number substitutions
            ];

            obfuscatedInputs.forEach(input => {
                const result = classifyRequest(input);
                console.log(`Input: "${input}", Classification: ${result.classification}`); // Debug log
                expect(result.classification).toBe('disallowed');
            });

            // The first case 'reverse engineer' is already caught by the original pattern
            // without needing normalization, so we'll test it separately
            const result = classifyRequest('reverse engineer');
            expect(result.classification).toBe('disallowed');
        });

        it('should detect obfuscated high-risk keywords', () => {
            const obfuscatedInputs = [
                'delete all files',
                'd3l3t3 all files',  // Number substitutions
                'del ete all files',  // Space insertion
                'del-e-te all files', // Hyphen insertion
            ];

            obfuscatedInputs.forEach(input => {
                const result = classifyRequest(input);
                expect(result.classification).toBe('high_risk_irreversible');
            });
        });

        it('should normalize text correctly', () => {
            expect(normalizeText('reverse engineer')).toBe('reverseengineer');
            expect(normalizeText('rev3rs3 3ngin33r')).toBe('reverseengineer'); // Number substitution
            expect(normalizeText('rev erse eng ineer')).toBe('reverseengineer'); // Spaces
            expect(normalizeText('rev!erse@eng#ineer')).toBe('reverseengineer'); // Punctuation
        });
    });

    describe('YAML Injection Prevention', () => {
        it('should reject oversized YAML content', () => {
            const oversizedYaml = 'a: '.repeat(1024 * 150); // 150KB of content
            const result = validateSchema(oversizedYaml);
            expect(result.valid).toBe(false);
            expect(result.errors).toContainEqual(
                expect.objectContaining({ code: 'YAML_SIZE_LIMIT_EXCEEDED' })
            );
        });

        it('should reject YAML with prototype pollution attempts', () => {
            const maliciousYaml = `
identity: Test
purpose: Test
__proto__:
  polluted: true
context:
  platform: Test
  access_method: desktop
  auth_state: logged_in
  environment: Test
inputs: []
task:
  goal: Test
  steps: []
constraints: []
output_format:
  type: yaml
self_check: []
`;
            const result = validateSchema(maliciousYaml);
            expect(result.valid).toBe(false);
            expect(result.errors).toContainEqual(
                expect.objectContaining({ code: 'YAML_INJECTION_DETECTED' })
            );
        });

        it('should reject YAML with constructor pollution attempts', () => {
            const maliciousYaml = `
identity: Test
purpose: Test
constructor:
  polluted: true
context:
  platform: Test
  access_method: desktop
  auth_state: logged_in
  environment: Test
inputs: []
task:
  goal: Test
  steps: []
constraints: []
output_format:
  type: yaml
self_check: []
`;
            const result = validateSchema(maliciousYaml);
            expect(result.valid).toBe(false);
            expect(result.errors).toContainEqual(
                expect.objectContaining({ code: 'YAML_INJECTION_DETECTED' })
            );
        });
    });
});