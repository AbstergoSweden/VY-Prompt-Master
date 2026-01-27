/**
 * VY Prompt Master - CLI Integration Tests
 * Tests for CLI commands end-to-end with various inputs
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import { join } from 'path';

describe('CLI Integration Tests', () => {
  const testDir = join(process.cwd(), 'tmp-test-dir');
  const testPromptFile = join(testDir, 'test-prompt.yaml');

  beforeEach(() => {
    // Create a temporary directory for test files
    execSync(`mkdir -p ${testDir}`);
  });

  afterEach(() => {
    // Clean up test files
    try {
      execSync(`rm -rf ${testDir}`);
    } catch {
      // Ignore cleanup errors
    }
  });

  it('should run dry-run mode successfully', () => {
    // Test dry-run mode without calling AI APIs
    const command = `cd ${process.cwd()} && npx tsx src/cli/index.ts generate --dry-run "Test task for dry run"`;
    const result = execSync(command, { encoding: 'utf-8' });
    
    expect(result).toContain('Dry run mode');
    expect(result).toContain('Policy classification');
  });

  it('should validate a valid YAML file', () => {
    // Create a minimal valid prompt file
    const validPrompt = `---
identity: Test Agent
purpose: Test purpose
context:
  platform: VY (Vercept) automation agent on macOS
  access_method: desktop
  auth_state: logged_in
  environment: macOS
inputs:
  - name: test_input
    required: true
    description: A test input
task:
  goal: Complete the test
  steps:
    - step_id: step_001_test
      intent: This is a test step with sufficient length
      locate: Test element with sufficient description
      confirm_target: Element is visible and ready
      act: Click the test element to proceed
      verify_outcome: Element was clicked and action completed
      fallback_paths:
        - Alternative approach as fallback
      safety_gate: safe
constraints:
  - Test constraint
output_format:
  type: yaml
self_check:
  - Test check
`;

    writeFileSync(testPromptFile, validPrompt);

    // Run validation command
    const command = `cd ${process.cwd()} && npx tsx src/cli/index.ts validate ${testPromptFile}`;
    const result = execSync(command, { encoding: 'utf-8' });

    expect(result).toContain('Valid VY prompt specification');
  });

  it('should fail validation for non-existent file', () => {
    const nonExistentFile = join(testDir, 'non-existent-file.yaml');

    // Run validation command - should fail
    try {
      const command = `cd ${process.cwd()} && npx tsx src/cli/index.ts validate ${nonExistentFile}`;
      execSync(command, { encoding: 'utf-8' });
      // If we reach here, the command didn't fail as expected
      expect.fail('Validation should have failed for non-existent file');
    } catch (error: any) {
      // The error object from execSync has different properties
      expect(error.stdout || error.stderr).toContain('File not found');
    }
  });

  it('should run quick schema check', () => {
    // Create a valid prompt file
    const validPrompt = `---
identity: Test Agent
purpose: Test purpose
context:
  platform: VY (Vercept) automation agent on macOS
  access_method: desktop
  auth_state: logged_in
  environment: macOS
inputs:
  - name: test_input
    required: true
    description: A test input
task:
  goal: Complete the test
  steps:
    - step_id: step_001_test
      intent: Test step
      locate: Test element
      confirm_target: Element is visible
      act: Click the element
      verify_outcome: Element was clicked
      fallback_paths:
        - Alternative approach
      safety_gate: safe
constraints:
  - Test constraint
output_format:
  type: yaml
self_check:
  - Test check
`;

    writeFileSync(testPromptFile, validPrompt);

    // Run check command
    const command = `cd ${process.cwd()} && npx tsx src/cli/index.ts check ${testPromptFile}`;
    const result = execSync(command, { encoding: 'utf-8' });
    
    expect(result).toContain('Basic structure OK');
  });

  it('should prevent path traversal in validation', () => {
    // Attempt to access a file outside the allowed directory
    const maliciousPath = '../../../etc/passwd'; // This should be blocked

    try {
      const command = `cd ${process.cwd()} && npx tsx src/cli/index.ts validate ${maliciousPath}`;
      execSync(command, { encoding: 'utf-8' });
      // If we reach here, path traversal wasn't prevented
      expect.fail('Path traversal should have been prevented');
    } catch (error: any) {
      // Check both stdout and stderr for the expected message
      const output = error.stdout || error.stderr || error.message;
      expect(output).toContain('Path traversal');
    }
  });
});