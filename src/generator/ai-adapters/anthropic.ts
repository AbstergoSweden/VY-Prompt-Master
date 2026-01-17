/**
 * VY Prompt Master - Anthropic Claude Adapter
 */

import Anthropic from '@anthropic-ai/sdk';
import type { AIAdapter, AIAdapterConfig, AIMessage, AIResponse } from './base.js';

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

        const response = await this.client.messages.create({
            model: this.model,
            max_tokens: this.maxTokens,
            system: systemMessage?.content || '',
            messages: conversationMessages,
        });

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
    }
}
