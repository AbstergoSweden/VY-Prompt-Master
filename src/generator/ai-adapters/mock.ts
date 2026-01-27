/**
 * VY Prompt Master - Mock AI Adapter
 * Used for testing and offline development
 */

import type { AIAdapter, AIAdapterConfig, AIMessage, AIResponse } from './base.js';

export class MockAdapter implements AIAdapter {
    readonly name = 'mock';
    readonly defaultModel = 'mock-model';

    private model: string;

    constructor(config: AIAdapterConfig) {
        this.model = config.model || this.defaultModel;
    }

    async complete(_messages: AIMessage[]): Promise<AIResponse> {
        // Create a mock response that follows the expected format
        const mockResponse = `---
identity: VY Mock Agent
purpose: This is a mock prompt specification for testing purposes
context:
  platform: VY (Vercept) automation agent on macOS
  access_method: desktop
  auth_state: logged_in
  environment: macOS Sonoma
inputs:
  - name: test_input
    required: true
    description: A test input parameter
task:
  goal: Complete the automated test successfully
  steps:
    - step_id: step_001_test_action
      intent: Perform a test action for validation
      locate: The test button in the top-right corner
      confirm_target: Button is visible and enabled
      act: Click the test button
      verify_outcome: Button click produces expected result
      fallback_paths:
        - Use keyboard shortcut Command+T instead
      safety_gate: safe
constraints:
  - Do not modify any user data during testing
output_format:
  type: yaml
self_check:
  - Did the test action complete successfully?
`;

        return {
            content: mockResponse,
            model: this.model,
            usage: {
                inputTokens: 100,
                outputTokens: 200,
            },
        };
    }
}