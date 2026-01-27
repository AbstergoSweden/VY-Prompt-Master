/**
 * VY Prompt Master - OpenAI Adapter
 */

import OpenAI from 'openai';
import type { AIAdapter, AIAdapterConfig, AIMessage, AIResponse } from './base.js';
import { withRetry, classifyNetworkError } from '../../utils/network-utils.js';

export class OpenAIAdapter implements AIAdapter {
    readonly name = 'openai';
    readonly defaultModel = 'gpt-4o';

    private client: OpenAI;
    private model: string;
    private maxTokens: number;

    constructor(config: AIAdapterConfig) {
        this.client = new OpenAI({ apiKey: config.apiKey });
        this.model = config.model || this.defaultModel;
        this.maxTokens = config.maxTokens || 8192;
    }

    async complete(messages: AIMessage[]): Promise<AIResponse> {
        const openaiMessages = messages.map(m => ({
            role: m.role,
            content: m.content,
        }));

        try {
            // Wrap API call with retry logic for transient network errors
            const response = await withRetry(
                () => this.client.chat.completions.create({
                    model: this.model,
                    messages: openaiMessages,
                    max_tokens: this.maxTokens,
                }),
                `OpenAI ${this.model} completion`,
                {
                    maxRetries: 3,
                    initialDelayMs: 1000,
                    retryableStatusCodes: [408, 429, 500, 502, 503, 504],
                }
            );

            const content = response.choices[0]?.message?.content || '';

            return {
                content,
                model: response.model,
                usage: response.usage ? {
                    inputTokens: response.usage.prompt_tokens,
                    outputTokens: response.usage.completion_tokens,
                } : undefined,
            };
        } catch (error) {
            // Use the network error classifier for better error messages
            const classifiedError = classifyNetworkError(error);
            
            // Handle specific OpenAI API errors
            if (error instanceof OpenAI.APIError) {
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
                throw new Error(`OpenAI API request failed after ${classifiedError.isRetryable ? 'retries' : 'attempt'}: ${classifiedError.type}`);
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
