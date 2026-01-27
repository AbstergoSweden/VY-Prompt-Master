/**
 * VY Prompt Master - AI Adapters Index
 */

export type { AIAdapter, AIAdapterConfig, AIMessage, AIResponse } from './base.js';
export { AnthropicAdapter } from './anthropic.js';
export { OpenAIAdapter } from './openai.js';
export { MockAdapter } from './mock.js';

import type { AIAdapter, AIAdapterConfig } from './base.js';
import { AnthropicAdapter } from './anthropic.js';
import { OpenAIAdapter } from './openai.js';
import { MockAdapter } from './mock.js';

export type ProviderName = 'anthropic' | 'openai' | 'mock';

/**
 * Creates an AI adapter based on provider name
 * @param provider - Name of the AI provider
 * @param config - Configuration for the adapter
 * @returns Configured AI adapter
 */
export function createAdapter(provider: ProviderName, config: AIAdapterConfig): AIAdapter {
    switch (provider) {
        case 'anthropic':
            return new AnthropicAdapter(config);
        case 'openai':
            return new OpenAIAdapter(config);
        case 'mock':
            return new MockAdapter(config);
        default:
            throw new Error(`Unknown AI provider: ${provider}`);
    }
}
