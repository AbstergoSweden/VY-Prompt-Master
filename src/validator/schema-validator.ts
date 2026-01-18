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

type AjvInstance = InstanceType<typeof Ajv>;
type AjvErrorObject = { instancePath?: string; message?: string; keyword?: string };

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** Loads the VY prompt schema from the framework directory */
function loadSchema(): object {
    const schemaPath = join(__dirname, '../../framework/vy-prompt-schema.json');
    const schemaContent = readFileSync(schemaPath, 'utf-8');
    return JSON.parse(schemaContent);
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

/** Cached validator instance */
let cachedValidate: any = null;

/** Gets or creates the cached validator */
function getValidator(): any {
    if (cachedValidate) {
        return cachedValidate;
    }

    const schema = loadSchema();
    const ajv = createValidator();
    cachedValidate = ajv.compile(schema);
    return cachedValidate;
}

/**
 * Validates a VY prompt specification against the JSON schema
 * @param yamlContent - YAML string to validate
 * @returns ValidationResult with errors and warnings
 */
export function validateSchema(yamlContent: string): ValidationResult {
    const errors: ValidationError[] = [];

    // Parse YAML
    let parsed: unknown;
    try {
        parsed = parseYaml(yamlContent);
    } catch (err) {
        const yamlError = err as Error;
        return {
            valid: false,
            errors: [{
                path: '/',
                message: `YAML parse error: ${yamlError.message}`,
                code: 'YAML_PARSE_ERROR',
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
 * Parses YAML content and returns typed VYPromptSpec if valid
 * @param yamlContent - YAML string to parse and validate
 * @returns Parsed VYPromptSpec or null if invalid
 */
export function parseAndValidate(yamlContent: string): { spec: VYPromptSpec | null; result: ValidationResult } {
    const result = validateSchema(yamlContent);

    if (!result.valid) {
        return { spec: null, result };
    }

    const spec = parseYaml(yamlContent) as VYPromptSpec;
    return { spec, result };
}

/**
 * Validates a VY prompt specification object directly
 * @param spec - VYPromptSpec object to validate
 * @returns ValidationResult
 */
export function validateSpec(spec: VYPromptSpec): ValidationResult {
    const validate = getValidator();
    const valid = validate(spec);

    return {
        valid,
        errors: formatAjvErrors(validate.errors),
        warnings: [],
    };
}
