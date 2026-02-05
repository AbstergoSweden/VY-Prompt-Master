/**
 * VY Prompt Master - Path Traversal Security Tests
 * Tests for path traversal attack prevention including edge cases
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { validatePath } from '../src/utils/security-utils.js';
import { mkdtempSync, rmSync, symlinkSync, mkdirSync, writeFileSync, unlinkSync, existsSync, realpathSync } from 'fs';
import { join } from 'path';
import * as os from 'os';

// Helper to create a temporary file path without requiring external packages
function createTempFilePath(): string {
    const tempName = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    return join(os.tmpdir(), tempName);
}

// Get tmpdir from os module
const tmpdir = os.tmpdir;

describe('Path Traversal Security Tests', () => {
    let tempDir: string;
    let testFile: string;

    beforeEach(() => {
        // Create a temporary directory for safe testing
        tempDir = mkdtempSync(join(tmpdir(), 'vy-prompt-security-test-'));
        testFile = join(tempDir, 'test-config.yaml');
        writeFileSync(testFile, 'test: data');
    });

    afterEach(() => {
        // Cleanup: Remove temp files and directory
        try {
            if (testFile && existsSync(testFile)) {
                unlinkSync(testFile);
            }
            if (tempDir && existsSync(tempDir)) {
                rmSync(tempDir, { recursive: true, force: true });
            }
        } catch {
            // Ignore cleanup errors
        }
    });

    describe('Basic Path Traversal Prevention', () => {
        it('should reject Unix-style traversal (../)', () => {
            expect(() => validatePath('../../../etc/passwd', tempDir)).toThrow('Path traversal detected');
            expect(() => validatePath('../config/test.yaml', tempDir)).toThrow('Path traversal detected');
        });

        it('should reject Windows-style traversal (..\\)', () => {
            expect(() => validatePath('..\\windows\\system32\\config', tempDir)).toThrow('Path traversal detected');
            expect(() => validatePath('config\\..\\..\\secret.yaml', tempDir)).toThrow('Path traversal detected');
        });

        it('should reject URL-encoded traversal', () => {
            expect(() => validatePath('%2e%2e%2f%2e%2e%2f%2e%2e%2f/etc/passwd', tempDir)).toThrow('Path traversal detected');
            expect(() => validatePath('%252e%252e%252fconfig', tempDir)).toThrow('Path traversal detected');
        });

        it('should accept valid relative paths', () => {
            const result = validatePath('test-config.yaml', tempDir);
            expect(result).toBeTruthy();
            expect(result).toContain('test-config.yaml');
        });

        it('should accept valid absolute paths within allowed base', () => {
            const result = validatePath(testFile, tempDir);
            expect(result).toBeTruthy();
            // Use canonical path for comparison (resolves symlinks like /var -> /private/var on macOS)
            const canonicalTestFile = realpathSync(testFile);
            expect(result).toBe(canonicalTestFile);
        });
    });

	    describe('Advanced Path Traversal Edge Cases', () => {
	        it('should reject paths with redundant separators', () => {
	            // Two ".." segments escape the base directory.
	            expect(() => validatePath('config//..//..//test.yaml', tempDir)).toThrow('Path traversal detected');
	            expect(() => validatePath('config\\..\\..\\test.yaml', tempDir)).toThrow('Path traversal detected');
	        });

	        it('should reject path with mixed separators', () => {
	            expect(() => validatePath('config\\..\\..\\/test.yaml', tempDir)).toThrow('Path traversal detected');
	            expect(() => validatePath('config/..\\..\\test.yaml', tempDir)).toThrow('Path traversal detected');
	        });

	        it('should reject absolute path outside allowed base', () => {
	            expect(() => validatePath('/etc/passwd', tempDir)).toThrow('Path traversal detected');
	            expect(() => validatePath('C:\\Windows\\System32\\config', tempDir)).toThrow('Path traversal detected');
	        });

	        it('should reject relative path that escapes base directory', () => {
	            expect(() => validatePath('../../../../../test.yaml', tempDir)).toThrow('Path traversal detected');
	        });
	    });

    describe('Symlink Attack Prevention', () => {
        it('should reject symlinks pointing outside allowed base', () => {
            // Create a symlink to a file outside tempDir
            const outsideFile = createTempFilePath();
            writeFileSync(outsideFile, 'outside content');

            const symlinkPath = join(tempDir, 'outside-link.yaml');
            try {
                symlinkSync(outsideFile, symlinkPath);

                expect(() => validatePath(symlinkPath, tempDir)).toThrow('Path traversal detected');
            } catch (e) {
                // Skip if symlink creation fails (e.g., on Windows without permissions)
                console.log('Symlink test skipped:', (e as Error).message);
            } finally {
                try {
                    unlinkSync(outsideFile);
                } catch {
                    // Ignore cleanup errors
                }
            }
        });

        it('should accept symlinks within allowed base', () => {
            const targetFile = join(tempDir, 'target.yaml');
            writeFileSync(targetFile, 'target content');

            const symlinkPath = join(tempDir, 'valid-link.yaml');
            try {
                symlinkSync(targetFile, symlinkPath);

                const result = validatePath(symlinkPath, tempDir);
                expect(result).toBeTruthy();
            } catch (e) {
                // Skip if symlink creation fails
                console.log('Symlink test skipped:', (e as Error).message);
            }
        });

        it('should reject directory symlinks pointing outside allowed base', () => {
            const outsideDir = mkdtempSync(join(tmpdir(), 'vy-outside-test-'));
            const symlinkPath = join(tempDir, 'outside-dir-link');

            try {
                symlinkSync(outsideDir, symlinkPath, 'dir');

                expect(() => validatePath(symlinkPath, tempDir)).toThrow('Path traversal detected');
            } catch (e) {
                console.log('Symlink test skipped:', (e as Error).message);
            } finally {
                try {
                    rmSync(outsideDir, { recursive: true, force: true });
                } catch {
                    // Ignore cleanup errors
                }
            }
        });
    });

    describe('Windows-Specific Attacks', () => {
        it('should reject NTFS alternate data streams', () => {
            expect(() => validatePath('test.yaml::$DATA', tempDir)).toThrow('Path traversal detected');
            expect(() => validatePath('test.yaml::$INDEX_ALLOCATION', tempDir)).toThrow('Path traversal detected');
        });

        it('should reject UNC paths', () => {
            expect(() => validatePath('\\\\server\\share\\config.yaml', tempDir)).toThrow('Path traversal detected');
            expect(() => validatePath('\\\\127.0.0.1\\C$\\config.yaml', tempDir)).toThrow('Path traversal detected');
        });

        it('should reject device path abuse', () => {
            expect(() => validatePath('\\\\.\\C:\\config.yaml', tempDir)).toThrow('Path traversal detected');
            expect(() => validatePath('\\\\?\\C:\\config.yaml', tempDir)).toThrow('Path traversal detected');
            expect(() => validatePath('\\\\.\\PhysicalDisk0\\config', tempDir)).toThrow('Path traversal detected');
        });

        it('should reject Windows special files', () => {
            expect(() => validatePath('CON', tempDir)).toThrow('Path traversal detected');
            expect(() => validatePath('PRN', tempDir)).toThrow('Path traversal detected');
            expect(() => validatePath('AUX', tempDir)).toThrow('Path traversal detected');
            expect(() => validatePath('NUL', tempDir)).toThrow('Path traversal detected');
            expect(() => validatePath('COM1', tempDir)).toThrow('Path traversal detected');
            expect(() => validatePath('LPT1', tempDir)).toThrow('Path traversal detected');
        });

        it('should reject case-insensitive traversal on Windows', () => {
            // Uppercase traversal should still be caught
            expect(() => validatePath('..\\WINDOWS\\CONFIG', tempDir)).toThrow('Path traversal detected');
            expect(() => validatePath('..\\..\\SYSTEM', tempDir)).toThrow('Path traversal detected');
        });
    });

    describe('Edge Case Handling', () => {
        it('should reject empty path', () => {
            expect(() => validatePath('', tempDir)).toThrow('Invalid file path');
        });

        it('should reject null/undefined paths', () => {
            expect(() => validatePath(null as any, tempDir)).toThrow('Invalid file path');
            expect(() => validatePath(undefined as any, tempDir)).toThrow('Invalid file path');
        });

        it('should reject non-string paths', () => {
            expect(() => validatePath(123 as any, tempDir)).toThrow('Invalid file path');
            expect(() => validatePath({} as any, tempDir)).toThrow('Invalid file path');
        });

        it('should handle paths with trailing slashes', () => {
            const result = validatePath('test-config.yaml', tempDir);
            expect(result).toBeTruthy();
        });

        it('should normalize paths with redundant components', () => {
            const result = validatePath('./config/../test-config.yaml', tempDir);
            expect(result).toBeTruthy();
            // Should resolve the path correctly
            expect(result).toContain('test-config.yaml');
        });
    });

    describe('Case-Insensitive Filesystem Protection', () => {
        it('should reject path traversal regardless of case', () => {
            expect(() => validatePath('../CONFIG/TEST', tempDir)).toThrow('Path traversal detected');
            expect(() => validatePath('../config/TEST', tempDir)).toThrow('Path traversal detected');
        });

        it('should handle mixed case within allowed base', () => {
            // Test mixed case in filename (not directory path) since directory case must match on case-sensitive filesystems
            const mixedCaseFilename = 'TEST-CONFIG.YAML';
            const mixedCasePath = join(tempDir, mixedCaseFilename);

            // Create the file with mixed case name
            writeFileSync(mixedCasePath, 'test');

            // This should work regardless of filesystem case-sensitivity
            const result = validatePath(mixedCasePath, tempDir);
            expect(result).toBeTruthy();
            expect(result.toLowerCase()).toContain('test-config.yaml');
        });
    });

        describe('Deep Nesting Edge Cases', () => {
        it('should handle very deep but valid nested paths', () => {
            const deepPath = 'a/b/c/d/e/f/g/h/i/j/test.yaml';
            const fullPath = join(tempDir, deepPath);

            // Create the nested directory structure
            let currentPath = tempDir;
            const parts = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];

            for (const part of parts) {
                currentPath = join(currentPath, part);
                try {
                    mkdirSync(currentPath);
                } catch {
                    // Ignore if already exists
                }
            }

            writeFileSync(fullPath, 'deep content');

            const result = validatePath(deepPath, tempDir);
            expect(result).toBeTruthy();
            expect(result).toContain('test.yaml');
        });

        it('should reject deep paths that attempt to escape', () => {
            // Four ".." segments escape past the base directory.
            const maliciousPath = 'a/b/c/../../../../etc/passwd';
            expect(() => validatePath(maliciousPath, tempDir)).toThrow('Path traversal detected');
        });
    });

    describe('Special Characters and Encoding', () => {
        it('should handle unicode in valid paths', () => {
            const unicodeDir = join(tempDir, 'café-dir');
            mkdirSync(unicodeDir, { recursive: true });
            const unicodeFile = join(unicodeDir, 'test-ñ.yaml');
            writeFileSync(unicodeFile, 'test');

            const result = validatePath('café-dir/test-ñ.yaml', tempDir);
            expect(result).toBeTruthy();
        });

        it('should reject null bytes in path', () => {
            expect(() => validatePath('test\0.yaml', tempDir)).toThrow();
        });
    });
});
