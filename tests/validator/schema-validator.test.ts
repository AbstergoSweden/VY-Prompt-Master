/**
 * VY Prompt Master - Schema Validator Tests
 */

import { describe, it, expect, vi } from 'vitest';

// Use vi.hoisted to create mock that can be accessed in vi.mock
const mockSchema = vi.hoisted(() => JSON.stringify({
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  required: ['identity', 'purpose', 'context', 'inputs', 'task', 'constraints', 'output_format', 'self_check'],
  properties: {
    identity: { type: 'string', minLength: 1 },
    purpose: { type: 'string', minLength: 10 },
    context: {
      type: 'object',
      required: ['platform', 'access_method', 'auth_state', 'environment'],
      properties: {
        platform: { type: 'string' },
        access_method: { type: 'string', enum: ['desktop', 'web', 'mobile', 'hybrid'] },
        auth_state: { type: 'string' },
        environment: { type: 'string' },
      },
    },
    inputs: { type: 'array', minItems: 1 },
    task: {
      type: 'object',
      required: ['goal', 'steps'],
      properties: {
        goal: { type: 'string', minLength: 10 },
        steps: { type: 'array', minItems: 1 },
      },
    },
    constraints: { type: 'array', minItems: 1 },
    output_format: { type: 'object', required: ['type'] },
    self_check: { type: 'array', minItems: 1 },
  },
}));

// Mock fs module with hoisted value
vi.mock('fs', () => ({
  readFileSync: vi.fn(() => mockSchema),
}));

import { validateSchema, parseAndValidate } from '../../src/validator/schema-validator.js';

describe('Schema Validator', () => {
  describe('validateSchema', () => {
    it('should return valid for correct YAML', () => {
      const validYaml = `
identity: VY Test Agent
purpose: This is a test purpose for validation
context:
  platform: macOS
  access_method: desktop
  auth_state: logged_in
  environment: macOS Sonoma
inputs:
  - name: test_input
    required: true
    description: A test input
task:
  goal: Complete the test successfully
  steps:
    - step_id: step_001_test
      intent: Test step intent
      locate: Test location
      confirm_target: Test confirm
      act: Click test
      verify_outcome: Test verified
      fallback_paths: []
      safety_gate: safe
constraints:
  - Test constraint
output_format:
  type: yaml
self_check:
  - Did the test pass correctly?
`;
      const result = validateSchema(validYaml);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return errors for missing required fields', () => {
      const invalidYaml = `
identity: VY Test Agent
purpose: Short
`;
      const result = validateSchema(invalidYaml);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should return YAML parse error for invalid YAML', () => {
      const invalidYaml = `
identity: VY Test Agent
  invalid: indentation
`;
      const result = validateSchema(invalidYaml);
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('YAML_PARSE_ERROR');
    });
  });

  describe('parseAndValidate', () => {
    it('should return parsed spec on valid YAML', () => {
      const validYaml = `
identity: VY Test Agent
purpose: This is a test purpose for validation
context:
  platform: macOS
  access_method: desktop
  auth_state: logged_in
  environment: macOS Sonoma
inputs:
  - name: test_input
    required: true
    description: A test input
task:
  goal: Complete the test successfully
  steps:
    - step_id: step_001_test
      intent: Test step intent
      locate: Test location
      confirm_target: Test confirm
      act: Click test
      verify_outcome: Test verified
      fallback_paths: []
      safety_gate: safe
constraints:
  - Test constraint
output_format:
  type: yaml
self_check:
  - Did the test pass correctly?
`;
      const { spec, result } = parseAndValidate(validYaml);
      expect(result.valid).toBe(true);
      expect(spec).not.toBeNull();
      expect(spec?.identity).toBe('VY Test Agent');
    });

    it('should return null spec on invalid YAML', () => {
      const invalidYaml = `identity: short`;
      const { spec, result } = parseAndValidate(invalidYaml);
      expect(result.valid).toBe(false);
      expect(spec).toBeNull();
    });
  });
});
