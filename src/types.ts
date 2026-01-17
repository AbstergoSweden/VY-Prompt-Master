/**
 * VY Prompt Master - Shared Type Definitions
 */

/** Safety gate classification for action steps */
export type SafetyGate = 'safe' | 'caution' | 'checkpoint' | 'irreversible_requires_confirmation';

/** Confidence level for assumptions */
export type ConfidenceLevel = 'low' | 'medium' | 'high';

/** Access method for VY automation */
export type AccessMethod = 'desktop' | 'web' | 'mobile' | 'hybrid';

/** Authentication state */
export type AuthState = 'logged_in' | 'requires_login' | 'public' | 'user_logged_in_as_needed';

/** Output format types */
export type OutputFormatType = 'yaml' | 'markdown' | 'plaintext' | 'structured_data' | 'json';

/** Policy classification result */
export type PolicyClassification = 'allowed' | 'disallowed' | 'ambiguous' | 'high_risk_irreversible';

/** Input parameter definition */
export interface VYInput {
    name: string;
    required: boolean;
    description: string;
    example?: string;
    default?: unknown;
    type?: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'url' | 'path' | 'date';
    validation?: {
        pattern?: string;
        min_length?: number;
        max_length?: number;
        enum?: unknown[];
    };
}

/** Single UI action step following locate→confirm→act→verify pattern */
export interface VYStep {
    step_id: string;
    intent: string;
    locate: string;
    confirm_target: string;
    act: string;
    verify_outcome: string;
    fallback_paths: string[];
    safety_gate: SafetyGate;
    wait_before?: number;
    wait_after?: number;
    screenshot_before?: boolean;
    screenshot_after?: boolean;
    user_confirmation_required?: boolean;
    confirmation_prompt?: string;
    max_retries?: number;
    timeout?: number;
    notes?: string;
}

/** Documented assumption with risk mitigation */
export interface VYAssumption {
    id: string;
    statement: string;
    confidence: ConfidenceLevel;
    risk: string;
    mitigation: string;
    verification_method: string;
}

/** Retry configuration */
export interface RetryConfig {
    condition: string;
    max_attempts: number;
    backoff: string;
    recovery_action?: string;
}

/** Rollback configuration */
export interface RollbackConfig {
    trigger: string;
    procedure: string | string[];
    reversibility_level?: 'full_system_reversion' | 'application_state_reversion' | 'partial_cleanup' | 'graceful_abort';
}

/** Monitoring checkpoint */
export interface MonitoringCheckpoint {
    checkpoint: string;
    evidence: string;
    summary_point?: string;
}

/** Failure playbook definition */
export interface FailurePlaybook {
    name: string;
    detection: string;
    response: string[];
    escalation?: string;
}

/** Context for VY execution */
export interface VYContext {
    platform: string;
    access_method: AccessMethod;
    auth_state: AuthState;
    environment: string | {
        os?: string;
        browser?: string;
        shell?: string;
        version?: string;
        [key: string]: unknown;
    };
}

/** Output format specification */
export interface VYOutputFormat {
    type: OutputFormatType;
    structure?: string;
    evidence_requirements?: string | string[];
    [key: string]: unknown;
}

/** Task specification */
export interface VYTask {
    goal: string;
    steps: VYStep[];
}

/** Robustness improvements */
export interface RobustnessImprovements {
    retries?: RetryConfig[];
    rollbacks?: RollbackConfig[];
    monitoring?: MonitoringCheckpoint[];
}

/** Validation tests */
export interface ValidationTests {
    schema_tests?: string[];
    ui_tests?: string[];
    safety_tests?: string[];
    determinism_tests?: string[];
}

/** Complete VY Prompt Specification */
export interface VYPromptSpec {
    identity: string;
    purpose: string;
    context: VYContext;
    inputs: VYInput[];
    task: VYTask;
    constraints: string[];
    output_format: VYOutputFormat;
    self_check: string[];
    assumptions?: VYAssumption[];
    robustness_improvements?: RobustnessImprovements;
    validation_tests?: ValidationTests;
    failure_playbooks?: FailurePlaybook[];
    examples?: Array<{ input?: string; output?: string; description?: string }>;
    inputs_missing?: Array<{ name: string; description: string; required?: boolean }>;
}

/** Validation result */
export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
}

/** Validation error */
export interface ValidationError {
    path: string;
    message: string;
    code: string;
    severity: 'error';
}

/** Validation warning */
export interface ValidationWarning {
    path: string;
    message: string;
    code: string;
    severity: 'warning';
}

/** AI Provider configuration */
export interface AIProviderConfig {
    provider: 'anthropic' | 'openai';
    apiKey: string;
    model?: string;
    maxTokens?: number;
}

/** Generation options */
export interface GenerationOptions {
    taskDescription: string;
    provider?: AIProviderConfig;
    maxIterations?: number;
    verbose?: boolean;
}

/** Generation result */
export interface GenerationResult {
    success: boolean;
    prompt?: VYPromptSpec;
    yaml?: string;
    iterations: number;
    errors?: ValidationError[];
}
