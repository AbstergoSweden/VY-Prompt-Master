/**
 * VY Prompt Master - Base AI Adapter Interface
 */

/** Message structure for AI conversation */
export interface AIMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

/** Response from AI provider */
export interface AIResponse {
    content: string;
    model: string;
    usage?: {
        inputTokens: number;
        outputTokens: number;
    };
}

/** Configuration for AI adapter */
export interface AIAdapterConfig {
    apiKey: string;
    model?: string;
    maxTokens?: number;
    temperature?: number;
}

/**
 * Base interface for AI provider adapters
 */
export interface AIAdapter {
    /** Provider name */
    readonly name: string;

    /** Default model for this provider */
    readonly defaultModel: string;

    /**
     * Sends a message to the AI and returns the response
     * @param messages - Conversation messages
     * @returns AI response
     */
    complete(messages: AIMessage[]): Promise<AIResponse>;
}
