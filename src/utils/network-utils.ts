/**
 * VY Prompt Master - Network Utilities with Retry Logic
 * Handles network errors and implements exponential backoff retry strategy
 */

export interface RetryConfig {
    /** Maximum number of retry attempts (default: 3) */
    maxRetries?: number;
    /** Initial delay in milliseconds (default: 1000) */
    initialDelayMs?: number;
    /** Maximum delay in milliseconds (default: 30000) */
    maxDelayMs?: number;
    /** Exponential backoff multiplier (default: 2) */
    backoffMultiplier?: number;
    /** HTTP status codes that should trigger a retry (default: [429, 502, 503, 504]) */
    retryableStatusCodes?: number[];
    /** Error messages that should trigger a retry (default: network-related errors) */
    retryableErrors?: RegExp[];
}

const DEFAULT_RETRY_CONFIG: Required<RetryConfig> = {
    maxRetries: 3,
    initialDelayMs: 1000,
    maxDelayMs: 30000,
    backoffMultiplier: 2,
    retryableStatusCodes: [429, 502, 503, 504],
    retryableErrors: [
        /ETIMEDOUT/i,
        /ECONNRESET/i,
        /ENOTFOUND/i,
        /ECONNREFUSED/i,
        /ENETUNREACH/i,
        /EAI_AGAIN/i,
        /socket hang up/i,
        /timeout/i,
        /network/i,
    ],
};

/**
 * Calculate delay with exponential backoff and jitter
 */
function calculateDelay(attempt: number, config: Required<RetryConfig>): number {
    const exponentialDelay = config.initialDelayMs * Math.pow(config.backoffMultiplier, attempt - 1);
    const cappedDelay = Math.min(exponentialDelay, config.maxDelayMs);
    
    // Add jitter to prevent thundering herd (±25% randomization)
    const jitter = cappedDelay * 0.25 * (Math.random() * 2 - 1);
    return Math.floor(cappedDelay + jitter);
}

/**
 * Check if an error is retryable based on status code or error message
 */
function isRetryableError(error: unknown, config: Required<RetryConfig>): boolean {
    if (!error || typeof error !== 'object') {
        return false;
    }

    // Check for HTTP status code
    if ('status' in error && typeof error.status === 'number') {
        if (config.retryableStatusCodes.includes(error.status)) {
            return true;
        }
    }

    // Check for retryable error messages
    const errorMessage = 'message' in error && typeof error.message === 'string' 
        ? error.message 
        : String(error);

    return config.retryableErrors.some(pattern => pattern.test(errorMessage));
}

/**
 * Sleep for a specified duration
 */
function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Execute a function with retry logic
 * @param operation The async operation to execute
 * @param operationName Name of the operation for logging
 * @param config Retry configuration
 * @returns Result of the operation
 */
export async function withRetry<T>(
    operation: () => Promise<T>,
    operationName: string,
    config: RetryConfig = {}
): Promise<T> {
    const fullConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
    let lastError: unknown;

    for (let attempt = 1; attempt <= fullConfig.maxRetries + 1; attempt++) {
        try {
            // Attempt the operation
            return await operation();
        } catch (error) {
            lastError = error;
            
            // Check if we should retry
            const shouldRetry = attempt <= fullConfig.maxRetries && isRetryableError(error, fullConfig);
            
            if (!shouldRetry) {
                // Not retryable or max retries reached, throw the error
                break;
            }

            // Calculate delay for next retry
            const delayMs = calculateDelay(attempt, fullConfig);
            
            console.warn(
                `Network operation "${operationName}" failed (attempt ${attempt}/${fullConfig.maxRetries + 1}): ${
                    error instanceof Error ? error.message : String(error)
                }. Retrying in ${delayMs}ms...`
            );

            // Wait before retrying
            await sleep(delayMs);
        }
    }

    // All retries exhausted or error not retryable
    throw lastError;
}

/**
 * Error classification for network errors
 */
export enum NetworkErrorType {
    TIMEOUT = 'timeout',
    CONNECTION = 'connection',
    AUTHENTICATION = 'authentication',
    RATE_LIMIT = 'rate_limit',
    SERVER_ERROR = 'server_error',
    CLIENT_ERROR = 'client_error',
    UNKNOWN = 'unknown',
}

export interface ClassifiedNetworkError {
    type: NetworkErrorType;
    message: string;
    statusCode?: number;
    isRetryable: boolean;
}

/**
 * Classify a network error for better error handling
 */
export function classifyNetworkError(error: unknown): ClassifiedNetworkError {
    if (!error || typeof error !== 'object') {
        return {
            type: NetworkErrorType.UNKNOWN,
            message: 'Unknown error',
            isRetryable: false,
        };
    }

    const message = 'message' in error && typeof error.message === 'string' 
        ? error.message 
        : String(error);

    const statusCode = 'status' in error && typeof error.status === 'number' 
        ? error.status 
        : 'statusCode' in error && typeof error.statusCode === 'number'
        ? error.statusCode
        : undefined;

    // Determine error type
    let type: NetworkErrorType;
    let isRetryable = false;

    if (statusCode === 401 || statusCode === 403) {
        type = NetworkErrorType.AUTHENTICATION;
        isRetryable = false;
    } else if (statusCode === 429) {
        type = NetworkErrorType.RATE_LIMIT;
        isRetryable = true;
    } else if (statusCode && statusCode >= 500) {
        type = NetworkErrorType.SERVER_ERROR;
        isRetryable = true;
    } else if (statusCode && statusCode >= 400) {
        type = NetworkErrorType.CLIENT_ERROR;
        isRetryable = false;
    } else if (/timeout/i.test(message) || /ETIMEDOUT/i.test(message)) {
        type = NetworkErrorType.TIMEOUT;
        isRetryable = true;
    } else if (/ECONNREFUSED|ENOTFOUND|EAI_AGAIN|ENETUNREACH/i.test(message)) {
        type = NetworkErrorType.CONNECTION;
        isRetryable = true;
    } else {
        type = NetworkErrorType.UNKNOWN;
        isRetryable = true; // Be optimistic about unknown errors
    }

    return {
        type,
        message,
        statusCode,
        isRetryable,
    };
}
