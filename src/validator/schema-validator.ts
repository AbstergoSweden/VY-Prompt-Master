/**
 * VY Prompt Master - Schema Validator
 * Validates VY prompt YAML against the JSON schema using ajv
 */

import AjvModule from 'ajv';
import addFormatsModule from 'ajv-formats';
import { parse as parseYaml } from 'yaml';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import type { ValidationResult, ValidationError, VYPromptSpec } from '../types.js';

// Handle ESM/CJS interop
const Ajv = AjvModule.default || AjvModule;
const addFormats = addFormatsModule.default || addFormatsModule;

import type { ValidateFunction } from 'ajv';

type AjvInstance = InstanceType<typeof Ajv>;
type AjvErrorObject = { instancePath?: string; message?: string; keyword?: string };

const DEFAULT_MAX_YAML_BYTES = 1024 * 100; // 100KB
const DEFAULT_MAX_ALIAS_COUNT = 100;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** Loads the VY prompt schema from the framework directory */
function loadSchema(): object {
    const candidates = [
        // Most common in development/CLI usage (repo root).
        join(process.cwd(), 'framework/vy-prompt-schema.json'),
        // Source layout (src/validator -> ../../framework).
        join(__dirname, '../../framework/vy-prompt-schema.json'),
        // Built layout (dist/src/validator -> ../../../../framework).
        join(__dirname, '../../../../framework/vy-prompt-schema.json'),
    ];

    for (const schemaPath of candidates) {
        try {
            const schemaContent = readFileSync(schemaPath, 'utf-8');
            return JSON.parse(schemaContent);
        } catch {
            // Try the next candidate (ENOENT or JSON parse errors for the wrong file path).
            continue;
        }
    }

    throw new Error('Could not locate framework/vy-prompt-schema.json (schema file not found)');
}

/** Converts ajv errors to ValidationError format */
function formatAjvErrors(errors: AjvErrorObject[] | null | undefined): ValidationError[] {
    if (!errors) return [];

    return errors.map((err) => ({
        path: err.instancePath || '/',
        message: err.message || 'Unknown validation error',
        code: `SCHEMA_${err.keyword?.toUpperCase() || 'ERROR'}`,
        severity: 'error' as const,
    }));
}

function parseYamlWithLimits(yamlContent: string): { parsed: unknown | null; errors: ValidationError[] } {
    // Check for potential YAML bombs or excessively large content
    if (yamlContent.length > DEFAULT_MAX_YAML_BYTES) {
        return {
            parsed: null,
            errors: [{
                path: '/',
                message: `YAML content exceeds maximum allowed size (${DEFAULT_MAX_YAML_BYTES} bytes)`,
                code: 'YAML_SIZE_LIMIT_EXCEEDED',
                severity: 'error',
            }],
        };
    }

    try {
        return {
            parsed: parseYaml(yamlContent, {
                // Disable dangerous features that could lead to injection
                schema: 'core', // Use only safe schema
                maxAliasCount: DEFAULT_MAX_ALIAS_COUNT, // Prevent alias amplification
            }),
            errors: [],
        };
    } catch (err) {
        const yamlError = err as Error;
        return {
            parsed: null,
            errors: [{
                path: '/',
                message: `YAML parse error: ${yamlError.message}`,
                code: 'YAML_PARSE_ERROR',
                severity: 'error',
            }],
        };
    }
}

/** Cached AJV instance and validator function */
let cachedAjv: AjvInstance | null = null;
let cachedValidate: ValidateFunction<unknown> | null = null;

/** Creates and configures the ajv validator */
function createValidator(): AjvInstance {
    const ajv = new Ajv({
        allErrors: true,
        verbose: true,
        strict: false,
    });
    addFormats(ajv);
    return ajv;
}

/** Gets or creates the cached validator */
function getValidator(): ValidateFunction<unknown> {
    if (cachedValidate) {
        return cachedValidate;
    }

    // Initialize AJV instance if not already cached
    if (!cachedAjv) {
        cachedAjv = createValidator();
        const schema = loadSchema();
        cachedValidate = cachedAjv.compile(schema);
    } else {
        // If AJV is cached but validator isn't, compile the schema
        const schema = loadSchema();
        cachedValidate = cachedAjv.compile(schema);
    }

    return cachedValidate;
}

/** Clears the schema cache (useful for testing or when schema updates) */
export function clearSchemaCache(): void {
    cachedValidate = null;
    cachedAjv = null;
}

/**
 * Validates a VY prompt specification against the JSON schema
 * @param yamlContent - YAML string to validate
 * @returns ValidationResult with errors and warnings
 */
export function validateSchema(yamlContent: string): ValidationResult {
    const { parsed, errors } = parseYamlWithLimits(yamlContent);
    if (!parsed) {
        return { valid: false, errors, warnings: [] };
    }

    // Additional check to prevent prototype pollution and other injection attacks
    if (!isSafeObject(parsed)) {
        return {
            valid: false,
            errors: [{
                path: '/',
                message: 'YAML contains unsafe constructs that could lead to injection',
                code: 'YAML_INJECTION_DETECTED',
                severity: 'error',
            }],
            warnings: [],
        };
    }

    // Use cached validator
    const validate = getValidator();
    const valid = validate(parsed);

    if (!valid) {
        errors.push(...formatAjvErrors(validate.errors));
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings: [],
    };
}

/**
 * Recursively checks if an object is safe from injection attacks
 * @param obj - Object to check
 * @returns True if object is safe, false otherwise
 */
function isSafeObject(obj: unknown): boolean {
    if (obj === null || typeof obj !== 'object') {
        return true;
    }

    // Check for prototype pollution vectors
    if (Object.prototype.hasOwnProperty.call(obj, '__proto__') ||
        Object.prototype.hasOwnProperty.call(obj, 'constructor')) {
        return false;
    }

    // Recursively check all properties
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            if (key === '__proto__' || key === 'constructor') {
                return false;
            }

            if (!isSafeObject((obj as Record<string, unknown>)[key])) {
                return false;
            }
        }
    }

    return true;
}

/**
 * Parses YAML content and returns typed VYPromptSpec if valid
 * @param yamlContent - YAML string to parse and validate
 * @returns Parsed VYPromptSpec or null if invalid
 */
export function parseAndValidate(yamlContent: string): { spec: VYPromptSpec | null; result: ValidationResult } {
    const { parsed, errors } = parseYamlWithLimits(yamlContent);
    if (!parsed) {
        return { spec: null, result: { valid: false, errors, warnings: [] } };
    }

    if (!isSafeObject(parsed)) {
        return {
            spec: null,
            result: {
                valid: false,
                errors: [{
                    path: '/',
                    message: 'YAML contains unsafe constructs that could lead to injection',
                    code: 'YAML_INJECTION_DETECTED',
                    severity: 'error',
                }],
                warnings: [],
            },
        };
    }

    const validate = getValidator();
    const valid = validate(parsed);
    const schemaErrors = valid ? [] : formatAjvErrors(validate.errors);

    const result: ValidationResult = {
        valid: schemaErrors.length === 0,
        errors: schemaErrors,
        warnings: [],
    };

    return { spec: result.valid ? (parsed as VYPromptSpec) : null, result };
}

/**
 * Validates a VY prompt specification object directly
 * @param spec - VYPromptSpec object to validate
 * @returns ValidationResult
 */
export function validateSpec(spec: VYPromptSpec): ValidationResult {
    const validate = getValidator();
    validate(spec);

    // Get schema validation errors
    const errors = formatAjvErrors(validate.errors);

    // Add additional semantic validation
    const semanticErrors = validateSemanticRules(spec);
    errors.push(...semanticErrors);

    return {
        valid: errors.length === 0,
        errors,
        warnings: [],
    };
}

/**
 * Performs additional semantic validation beyond the JSON schema
 * @param spec - VYPromptSpec object to validate
 * @returns Array of semantic validation errors
 */
function validateSemanticRules(spec: VYPromptSpec): ValidationError[] {
    const errors: ValidationError[] = [];

    // Validate URL and path inputs
    spec.inputs.forEach((input, index) => {
        const inputPath = `/inputs/${index}`;

        if (input.type === 'url' && input.default) {
            const urlStr = String(input.default);
            try {
                new URL(urlStr); // Will throw if invalid
            } catch {
                errors.push({
                    path: `${inputPath}/default`,
                    message: `Default value "${urlStr}" is not a valid URL`,
                    code: 'SEMANTIC_INVALID_URL',
                    severity: 'error',
                });
            }
        }

        if (input.type === 'path' && input.default) {
            const pathStr = String(input.default);
            // Basic path validation - check for invalid characters on macOS
            if (/[<>:"|?*]/.test(pathStr)) {
                errors.push({
                    path: `${inputPath}/default`,
                    message: `Default value "${pathStr}" contains invalid characters for a path`,
                    code: 'SEMANTIC_INVALID_PATH',
                    severity: 'error',
                });
            }
        }
    });

    // Validate step IDs: sequential numbering and uniqueness
    if (spec.task?.steps && Array.isArray(spec.task.steps)) {
        const stepIds = spec.task.steps.map((step, index) => ({
            id: step.step_id || '',
            index,
        }));

        // Check for empty step IDs
        stepIds.forEach(({ id, index }) => {
            if (!id) {
                errors.push({
                    path: `/task/steps/${index}/step_id`,
                    message: `Step ${index} is missing a step_id`,
                    code: 'SEMANTIC_MISSING_STEP_ID',
                    severity: 'error',
                });
            }
        });

        // Validate step ID format (should be step_001_action_name, step_002_action, etc.)
        // Extract just the numeric part for sequence validation
        const stepIdRegex = /^step_(\d{3})_[a-z][a-z0-9_]*$/;
        const validStepIds = stepIds.filter(({ id }) => stepIdRegex.test(id));

        // Check for invalid format
        stepIds.forEach(({ id, index }) => {
            if (id && !stepIdRegex.test(id)) {
                errors.push({
                    path: `/task/steps/${index}/step_id`,
                    message: `Step ID "${id}" must follow format "step_NNN" (e.g., step_001)`,
                    code: 'SEMANTIC_INVALID_STEP_ID_FORMAT',
                    severity: 'error',
                });
            }
        });

        // Check for duplicates
        const idCounts = new Map<string, number>();
        validStepIds.forEach(({ id }) => {
            idCounts.set(id, (idCounts.get(id) || 0) + 1);
        });

        idCounts.forEach((count, id) => {
            if (count > 1) {
                const indices = stepIds
                    .map((s, i) => ({ id: s.id, index: i }))
                    .filter(s => s.id === id)
                    .map(s => s.index);

                errors.push({
                    path: `/task/steps`,
                    message: `Duplicate step ID "${id}" found at indices ${indices.join(', ')}`,
                    code: 'SEMANTIC_DUPLICATE_STEP_ID',
                    severity: 'error',
                });
            }
        });

        // Check for sequential numbering (no gaps)
        if (validStepIds.length > 0) {
            const numbers = validStepIds
                .map(({ id }) => {
                    // Extract numeric part from step_NNN_action_name format
                    const match = id.match(/^step_(\d{3})_/);
                    return match ? parseInt(match[1], 10) : NaN;
                })
                .filter(n => !isNaN(n))
                .sort((a, b) => a - b);

            // Should start at 1
            if (numbers[0] !== 1) {
                errors.push({
                    path: `/task/steps`,
                    message: `Step IDs must start at step_001, but found step_${numbers[0].toString().padStart(3, '0')}`,
                    code: 'SEMANTIC_STEP_ID_SEQUENCE_START',
                    severity: 'error',
                });
            }

            // Check for gaps
            for (let i = 1; i < numbers.length; i++) {
                if (numbers[i] !== numbers[i - 1] + 1) {
                    const expected = numbers[i - 1] + 1;
                    const found = numbers[i];
                    errors.push({
                        path: `/task/steps`,
                        message: `Non-sequential step IDs: missing step_${expected.toString().padStart(3, '0')} before step_${found.toString().padStart(3, '0')}`,
                        code: 'SEMANTIC_STEP_ID_SEQUENCE_GAP',
                        severity: 'error',
                    });
                }
            }
        }
    }

    return errors;
}
