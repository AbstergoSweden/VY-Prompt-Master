/**
 * Security utility functions for path validation and sanitization.
 *
 * This module is used by the CLI to prevent path traversal and reduce the risk
 * of local file read/write escaping the working directory.
 */

import { resolve, normalize, isAbsolute, relative, sep, dirname } from 'path';
import { realpathSync, existsSync } from 'fs';

/**
 * Validates that a file path is within the allowed directory to prevent path traversal
 * @param filePath The file path to validate
 * @param allowedBaseDir The base directory that paths must be within (defaults to process.cwd())
 * @returns The sanitized, resolved absolute path if valid
 * @throws Error if path traversal is detected or path is invalid
 */
export function validatePath(filePath: string, allowedBaseDir: string = process.cwd()): string {
    // Prevent null/undefined paths
    if (!filePath || typeof filePath !== 'string') {
        throw new Error('Invalid file path: path must be a non-empty string');
    }

    // Block null bytes
    if (filePath.includes('\0')) {
        throw new Error(`Path traversal detected: null bytes not allowed`);
    }

    // Block Windows special files (CON, PRN, AUX, NUL, COM1-9, LPT1-9)
    const windowsSpecialFiles = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(\.|$)/i;
    const filename = filePath.split(/[/\\]/).pop() || '';
    if (windowsSpecialFiles.test(filename)) {
        throw new Error(`Path traversal detected: Windows special file not allowed`);
    }

    // Block NTFS alternate data streams
    if (filePath.includes('::$')) {
        throw new Error(`Path traversal detected: NTFS alternate data streams not allowed`);
    }

    // Block UNC paths (\\server\share or //server/share)
    if (/^\\\\[^\\/]|^\/\/[^/]/.test(filePath)) {
        throw new Error(`Path traversal detected: UNC paths not allowed`);
    }

    // Block Windows device paths (\\.\ or \\?\)
    if (/^\\\\[.?]\\/.test(filePath)) {
        throw new Error(`Path traversal detected: device paths not allowed`);
    }

    // Note: We do NOT block based on pattern matching alone here because
    // paths like "./config/../test.yaml" are legitimate and normalize safely.
    // The definitive check is the relative path validation after resolution.

    // Resolve to absolute path and normalize
    let resolvedPath: string;
    try {
        resolvedPath = resolve(allowedBaseDir, filePath);
    } catch {
        throw new Error(`Path traversal detected: invalid path resolution`);
    }

    // Normalize path to remove redundant separators and relative components
    const normalizedPath = normalize(resolvedPath);

    // Resolve the allowed base directory to canonical form
    let canonicalBaseDir: string;
    try {
        canonicalBaseDir = realpathSync(allowedBaseDir);
    } catch {
        throw new Error(`Invalid base directory: ${allowedBaseDir}`);
    }

    // Resolve symlinks on the target path.
    // If the target doesn't exist yet, canonicalize the nearest existing ancestor
    // to prevent directory-symlink escape (TOCTOU) while still allowing new files
    // under a real directory tree.
    let canonicalPath: string;
    if (existsSync(normalizedPath)) {
        canonicalPath = realpathSync(normalizedPath);
    } else {
        let ancestor = dirname(normalizedPath);
        let suffix = relative(ancestor, normalizedPath); // initially just the basename

        // Walk up until we find an existing directory.
        while (ancestor !== dirname(ancestor) && !existsSync(ancestor)) {
            const parent = dirname(ancestor);
            suffix = relative(parent, normalizedPath);
            ancestor = parent;
        }

        const canonicalAncestor = realpathSync(ancestor);
        canonicalPath = resolve(canonicalAncestor, suffix);
    }

    // Check if the path is within the allowed base directory
    // Using relative path check - if the path is outside, relative() will start with "../"
    const relativePath = relative(canonicalBaseDir, canonicalPath);
    
    // Verify the path is actually within the base directory
    // relativePath will start with '..' if outside, or be absolute on different drives
    if (relativePath === '' || relativePath.startsWith('..') || isAbsolute(relativePath)) {
        throw new Error(`Path traversal detected: ${filePath}. Access denied.`);
    }

    // Additional validation: ensure the path doesn't escape after symlink resolution
    // This is a defense-in-depth check
    if (!canonicalPath.startsWith(canonicalBaseDir + sep) && 
        !canonicalPath.startsWith(canonicalBaseDir + '/') &&
        canonicalPath !== canonicalBaseDir) {
        throw new Error(`Path traversal detected: ${filePath}. Symlink escape detected.`);
    }

    return canonicalPath;
}

/**
 * Sanitizes input strings to prevent various injection attacks
 * @param input The input string to sanitize
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
    if (typeof input !== 'string') {
        return '';
    }

    // Normalize Unicode to prevent homoglyph attacks
    // Convert to NFKC (Normalization Form KC) to standardize character representations
    let normalized = input.normalize('NFKC');

    // Remove or replace dangerous characters that could be used for injection
    normalized = normalized
        // Remove null bytes
        .replaceAll('\0', '')
        // Remove backticks (can be used to visually imply command execution)
        .replaceAll('`', '')
        // Neutralize potential script tags
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '[REMOVED]')
        // Remove potential HTML tags
        .replace(/<[^>]*>/g, '');

    // Trim whitespace
    normalized = normalized.trim();

    return normalized;
}

/**
 * Validates that all required top-level keys are present in the YAML object
 * @param obj The parsed YAML object
 * @returns Array of missing keys (empty if all present)
 */
export function validateRequiredKeys(obj: Record<string, unknown>, requiredKeys: string[]): string[] {
    const missingKeys: string[] = [];

    for (const key of requiredKeys) {
        if (!(key in obj) || obj[key] === undefined || obj[key] === null) {
            missingKeys.push(key);
        }
    }

    return missingKeys;
}

/**
 * Redacts sensitive information from error messages
 * @param errorMessage The error message to sanitize
 * @returns Sanitized error message with secrets redacted
 */
export function redactSecrets(errorMessage: string): string {
    if (typeof errorMessage !== 'string') {
        return String(errorMessage);
    }

    // Patterns to redact (ordered: most specific first)
    const secretPatterns = [
        {
            pattern: /(sk-[a-zA-Z0-9._-]{20,})/g,
            replacement: '[REDACTED_API_KEY]'
        },
        {
            pattern: /AIza[0-9A-Za-z\-_]{35}/g,
            replacement: '[REDACTED_GOOGLE_KEY]'
        },
        {
            pattern: /github_pat_[a-zA-Z0-9]{20,}/g,
            replacement: '[REDACTED_GITHUB_PAT]'
        },
        {
            pattern: /(anthropic|openai|kimi|gemini|ai)[-_\s]?(key|token)?\s*[:=]\s*['"]?[a-zA-Z0-9._-]{20,}['"]?/gi,
            replacement: '$1$2: [REDACTED]'
        }
    ];

    let sanitized = errorMessage;
    for (const { pattern, replacement } of secretPatterns) {
        sanitized = sanitized.replace(pattern, replacement);
    }

    return sanitized;
}
