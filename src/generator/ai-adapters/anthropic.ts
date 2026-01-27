/**
 * VY Prompt Master - Anthropic Claude Adapter
 */

import Anthropic from '@anthropic-ai/sdk';
import type { AIAdapter, AIAdapterConfig, AIMessage, AIResponse } from './base.js';
import { withRetry, classifyNetworkError } from '../../utils/network-utils.js';

export class AnthropicAdapter implements AIAdapter {
    readonly name = 'anthropic';
    readonly defaultModel = 'claude-3-5-sonnet-20241022';

    private client: Anthropic;
    private model: string;
    private maxTokens: number;

    constructor(config: AIAdapterConfig) {
        this.client = new Anthropic({ apiKey: config.apiKey });
        this.model = config.model || this.defaultModel;
        this.maxTokens = config.maxTokens || 8192;
    }

    async complete(messages: AIMessage[]): Promise<AIResponse> {
        // Separate system message from conversation
        const systemMessage = messages.find(m => m.role === 'system');
        const conversationMessages = messages
            .filter(m => m.role !== 'system')
            .map(m => ({
                role: m.role as 'user' | 'assistant',
                content: m.content,
            }));

        try {
            // Wrap API call with retry logic for transient network errors
            const response = await withRetry(
                () => this.client.messages.create({
                    model: this.model,
                    max_tokens: this.maxTokens,
                    system: systemMessage?.content || '',
                    messages: conversationMessages,
                }),
                `Anthropic ${this.model} completion`,
                {
                    maxRetries: 3,
                    initialDelayMs: 1000,
                    retryableStatusCodes: [408, 429, 500, 502, 503, 504],
                }
            );

            // Extract text content from response
            const textContent = response.content
                .filter(block => block.type === 'text')
                .map(block => (block as { type: 'text'; text: string }).text)
                .join('');

            return {
                content: textContent,
                model: response.model,
                usage: {
                    inputTokens: response.usage.input_tokens,
                    outputTokens: response.usage.output_tokens,
                },
            };
        } catch (error) {
            // Use the network error classifier for better error messages
            const classifiedError = classifyNetworkError(error);
            
            // Handle specific Anthropic API errors
            if (error instanceof Anthropic.APIError) {
                // Handle rate limiting
                if (error.status === 429) {
                    throw new Error('Rate limit exceeded. Please try again later.');
                }

                // Handle authentication errors
                if (error.status === 401) {
                    throw new Error('Authentication failed. Please check your API key.');
                }

                // Handle other API errors
                // Don't expose raw error details that might contain API keys
                throw new Error(`Anthropic API request failed after ${classifiedError.isRetryable ? 'retries' : 'attempt'}: ${classifiedError.type}`);
            }

            // Handle generic errors with classification
            if (error instanceof Error) {
                // Don't expose the raw error which might contain API key info
                throw new Error(`AI service request failed: ${classifiedError.type} - ${classifiedError.message}`);
            } else {
                throw new Error('AI service request failed due to an unknown error');
            }
        }
    }
}
