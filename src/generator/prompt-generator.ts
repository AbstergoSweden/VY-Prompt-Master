/**
 * VY Prompt Master - Prompt Generator
 * Uses VY-Meta-Prompt.yaml as system prompt template to generate VY prompts
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import type { AIAdapter, AIMessage } from './ai-adapters/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** Loads the VY Meta-Prompt template */
function loadMetaPrompt(): string {
    const metaPromptPath = join(__dirname, '../../framework/VY-Meta-Prompt.yaml');
    return readFileSync(metaPromptPath, 'utf-8');
}

/** Builds the system prompt from the meta-prompt template */
function buildSystemPrompt(): string {
    const metaPrompt = loadMetaPrompt();

    return `You are the VY Prompt Engineering Persona. Your role is to generate safe, deterministic, and robust UI automation prompts for VY (Vercept) agent on macOS.

## Core Framework
${metaPrompt}

## Output Requirements

1. Output ONLY valid YAML - no markdown code fences, no explanatory text, no preamble
2. Every step MUST follow the pattern: locate → confirm_target → act → verify_outcome
3. Every step MUST have all 8 required fields:
   - step_id (format: step_NNN_descriptive_name)
   - intent
   - locate
   - confirm_target
   - act
   - verify_outcome
   - fallback_paths (array)
   - safety_gate (safe | caution | checkpoint | irreversible_requires_confirmation)
4. Use macOS conventions: Command (⌘) not Control, use open_application tool
5. Irreversible actions MUST have safety_gate: irreversible_requires_confirmation
6. Never automate credential entry - request manual user login

If the request is ambiguous or missing required information, output ONLY an inputs_missing YAML section and nothing else.`;
}

/** Options for prompt generation */
export interface GenerateOptions {
    /** Enable verbose logging */
    verbose?: boolean;
    /** Previous validation errors for refinement */
    validationErrors?: string;
}

/**
 * Generates a VY prompt specification using an AI adapter
 * @param adapter - The AI adapter to use
 * @param taskDescription - User's task description
 * @param options - Generation options
 * @returns Generated YAML content
 */
export async function generatePrompt(
    adapter: AIAdapter,
    taskDescription: string,
    options: GenerateOptions = {}
): Promise<string> {
    const systemPrompt = buildSystemPrompt();

    const messages: AIMessage[] = [
        { role: 'system', content: systemPrompt },
    ];

    // If we have validation errors, include them for refinement
    if (options.validationErrors) {
        messages.push({
            role: 'user',
            content: `Generate a VY prompt specification for this task: ${taskDescription}`,
        });
        messages.push({
            role: 'assistant',
            content: '(Previous attempt with validation errors)',
        });
        messages.push({
            role: 'user',
            content: options.validationErrors,
        });
    } else {
        messages.push({
            role: 'user',
            content: `Generate a VY prompt specification for this task: ${taskDescription}`,
        });
    }

    if (options.verbose) {
        console.log(`[Generator] Using ${adapter.name} adapter`);
        console.log(`[Generator] Task: ${taskDescription}`);
    }

    const response = await adapter.complete(messages);

    if (options.verbose) {
        console.log(`[Generator] Model: ${response.model}`);
        if (response.usage) {
            console.log(`[Generator] Tokens: ${response.usage.inputTokens} in, ${response.usage.outputTokens} out`);
        }
    }

    // Clean up the response - remove any markdown code fences if present
    let yaml = response.content.trim();

    // Remove markdown code fences if present
    if (yaml.startsWith('```yaml')) {
        yaml = yaml.slice(7);
    } else if (yaml.startsWith('```')) {
        yaml = yaml.slice(3);
    }

    if (yaml.endsWith('```')) {
        yaml = yaml.slice(0, -3);
    }

    return yaml.trim();
}

/**
 * Extracts YAML from a potentially mixed response
 * @param content - Raw AI response content
 * @returns Extracted YAML content
 */
export function extractYaml(content: string): string {
    // Try to find YAML block
    const yamlMatch = content.match(/```ya?ml\n([\s\S]*?)```/);
    if (yamlMatch) {
        return yamlMatch[1].trim();
    }

    // Check if content starts with --- (YAML document marker)
    if (content.trim().startsWith('---') || content.trim().startsWith('identity:')) {
        return content.trim();
    }

    // Return as-is and hope for the best
    return content.trim();
}
