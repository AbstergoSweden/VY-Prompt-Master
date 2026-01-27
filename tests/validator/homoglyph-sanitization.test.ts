/**
 * Tests for homoglyph detection and sanitization
 * Tests Unicode normalization and homoglyph mapping
 */

import { describe, it, expect } from 'vitest';
import { classifyRequest, detectHomoglyphs } from '../../src/validator/safety-validator.js';

describe('Homoglyph Detection and Sanitization', () => {
    describe('detectHomoglyphs', () => {
        it('should detect and replace Cyrillic homoglyphs', () => {
            const input = 'rеvеrѕе engineer'; // Uses Cyrillic е, ѕ
            const result = detectHomoglyphs(input);
            expect(result).toBe('reverse engineer');
        });

        it('should detect and replace Greek homoglyphs', () => {
            const input = 'αdmin'; // Uses Greek α
            const result = detectHomoglyphs(input);
            expect(result).toBe('admin');
        });

        it('should detect and replace fullwidth characters', () => {
            const input = 'ａｂｃ'; // Fullwidth a, b, c
            const result = detectHomoglyphs(input);
            expect(result).toBe('abc');
        });

        it('should remove zero-width characters', () => {
            const input = 'r\u200beverse'; // Contains zero-width space
            const result = detectHomoglyphs(input);
            expect(result).toBe('reverse');
        });

        it('should handle mixed homoglyphs', () => {
            const input = 'сrοѕѕ'; // Cyrillic с, Greek ο
            const result = detectHomoglyphs(input);
            expect(result).toBe('cross');
        });

        it('should not modify legitimate ASCII text', () => {
            const input = 'reverse engineer';
            const result = detectHomoglyphs(input);
            expect(result).toBe('reverse engineer');
        });
    });

    describe('classifyRequest with homoglyphs', () => {
        it('should classify Cyrillic obfuscated disallowed content', () => {
            const result = classifyRequest('rеvеrѕе engineer'); // Cyrillic e, s
            expect(result.classification).toBe('disallowed');
        });

        it('should classify Greek obfuscated high-risk keyword', () => {
            const result = classifyRequest('dеlеtе file'); // Cyrillic е
            expect(result.classification).toBe('high_risk_irreversible');
        });

        it('should classify zero-width obfuscated content', () => {
            const result = classifyRequest('r\u200beverse engineer'); // zero-width space
            expect(result.classification).toBe('disallowed');
        });
    });
});
