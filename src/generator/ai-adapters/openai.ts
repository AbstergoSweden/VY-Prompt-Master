/**
 * VY Prompt Master - OpenAI Adapter
 */

import OpenAI from 'openai';
import type { AIAdapter, AIAdapterConfig, AIMessage, AIResponse } from './base.js';

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

        const response = await this.client.chat.completions.create({
            model: this.model,
            messages: openaiMessages,
            max_tokens: this.maxTokens,
        });

        const content = response.choices[0]?.message?.content || '';

        return {
            content,
            model: response.model,
            usage: response.usage ? {
                inputTokens: response.usage.prompt_tokens,
                outputTokens: response.usage.completion_tokens,
            } : undefined,
        };
    }
}
