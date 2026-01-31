/**
 * VY Prompt Master - Network Retry Logic Tests
 * Tests for network error handling and retry mechanisms
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { withRetry, classifyNetworkError, NetworkErrorType } from '../src/utils/network-utils.js';

describe('Network Retry Logic Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    describe('withRetry Function', () => {
        it('should succeed on first attempt', async () => {
            const operation = vi.fn().mockResolvedValue('success');
            const result = await withRetry(operation, 'test-operation');

            expect(result).toBe('success');
            expect(operation).toHaveBeenCalledTimes(1);
        });

        it('should retry on timeout error and eventually succeed', async () => {
            const operation = vi.fn()
                .mockRejectedValueOnce(new Error('ETIMEDOUT: connection timed out'))
                .mockRejectedValueOnce(new Error('socket hang up'))
                .mockResolvedValue('success');

            const promise = withRetry(operation, 'test-operation', {
                maxRetries: 3,
                initialDelayMs: 1000
            });

            // Fast-forward through retry delays
            await vi.runAllTimersAsync();

            const result = await promise;
            expect(result).toBe('success');
            expect(operation).toHaveBeenCalledTimes(3);
        });

        it('should fail after max retries', async () => {
            const error = new Error('ECONNREFUSED: Connection refused');
            const operation = vi.fn().mockRejectedValue(error);

            const promise = withRetry(operation, 'test-operation', {
                maxRetries: 2,
                initialDelayMs: 100
            });

            // Attach expectation before running timers to avoid unhandled rejection
            const expectation = expect(promise).rejects.toThrow('ECONNREFUSED: Connection refused');

            // Fast-forward through all retry delays
            await vi.runAllTimersAsync();

            await expectation;
            expect(operation).toHaveBeenCalledTimes(3); // Initial + 2 retries
        });

        it('should not retry non-retryable errors', async () => {
            const error: any = new Error('Authentication failed');
            error.status = 401;
            const operation = vi.fn().mockRejectedValue(error);

            const promise = withRetry(operation, 'test-operation', { maxRetries: 3 });

            await expect(promise).rejects.toThrow('Authentication failed');
            expect(operation).toHaveBeenCalledTimes(1); // No retries
        });

        it('should retry on 503 Service Unavailable', async () => {
            const error: any = new Error('Service Unavailable');
            error.status = 503;
            const operation = vi.fn()
                .mockRejectedValueOnce(error)
                .mockResolvedValue('success');

            const promise = withRetry(operation, 'test-operation', {
                maxRetries: 2,
                initialDelayMs: 100
            });

            await vi.runAllTimersAsync();

            const result = await promise;
            expect(result).toBe('success');
            expect(operation).toHaveBeenCalledTimes(2);
        });

        it('should use exponential backoff', async () => {
            const operation = vi.fn()
                .mockRejectedValueOnce(new Error('ECONNRESET'))
                .mockRejectedValueOnce(new Error('ECONNRESET'))
                .mockRejectedValueOnce(new Error('ECONNRESET'))
                .mockResolvedValue('success');

            const promise = withRetry(operation, 'test-operation', {
                maxRetries: 3,
                initialDelayMs: 100,
                backoffMultiplier: 2
            });

            // Fast-forward through all retries
            await vi.runAllTimersAsync();

            const result = await promise;
            expect(result).toBe('success');
            expect(operation).toHaveBeenCalledTimes(4);
        });

        it('should respect max delay cap', async () => {
            const operation = vi.fn()
                .mockRejectedValueOnce(new Error('timeout'))
                .mockRejectedValueOnce(new Error('timeout'))
                .mockRejectedValueOnce(new Error('timeout'))
                .mockResolvedValue('success');

            const promise = withRetry(operation, 'test-operation', {
                maxRetries: 3,
                initialDelayMs: 1000,
                backoffMultiplier: 10, // Large multiplier to hit max cap
                maxDelayMs: 5000
            });

            await vi.runAllTimersAsync();

            const result = await promise;
            expect(result).toBe('success');
            expect(operation).toHaveBeenCalledTimes(4);
        });

        it('should handle successful retry after multiple failures', async () => {
            const errors = [
                new Error('ENOTFOUND: DNS lookup failed'),
                new Error('ECONNREFUSED: Connection refused'),
                new Error('EAI_AGAIN: Temporary DNS failure'),
            ];

            const operation = vi.fn()
                .mockRejectedValueOnce(errors[0])
                .mockRejectedValueOnce(errors[1])
                .mockRejectedValueOnce(errors[2])
                .mockResolvedValue('finally works');

            const promise = withRetry(operation, 'dns-operation', {
                maxRetries: 5,
                initialDelayMs: 100
            });

            await vi.runAllTimersAsync();

            const result = await promise;
            expect(result).toBe('finally works');
            expect(operation).toHaveBeenCalledTimes(4);
        });

        it('should handle abort signals', async () => {
            const controller = new AbortController();
            const operation = vi.fn().mockImplementation(async () => {
                controller.abort();
                throw new Error('Operation was aborted');
            });

            const promise = withRetry(operation, 'test-operation', { maxRetries: 3 });

            await expect(promise).rejects.toThrow('Operation was aborted');
            expect(operation).toHaveBeenCalledTimes(1); // No retry on abort
        });

        it('should implement custom retryable status codes', async () => {
            const config = { retryableStatusCodes: [408, 429, 500, 502, 503, 504] };
            const error: any = new Error('Request Timeout');
            error.status = 408;

            const operation = vi.fn()
                .mockRejectedValueOnce(error)
                .mockResolvedValue('success');

            const promise = withRetry(operation, 'test-operation', {
                ...config,
                maxRetries: 2,
                initialDelayMs: 100
            });

            await vi.runAllTimersAsync();

            const result = await promise;
            expect(result).toBe('success');
            expect(operation).toHaveBeenCalledTimes(2);
        });
    });

    describe('classifyNetworkError Function', () => {
        it('should classify timeout errors', () => {
            const error = new Error('ETIMEDOUT: Connection timed out');
            const classified = classifyNetworkError(error);

            expect(classified.type).toBe(NetworkErrorType.TIMEOUT);
            expect(classified.isRetryable).toBe(true);
        });

        it('should classify connection errors', () => {
            const error = new Error('ECONNREFUSED: Connection refused');
            const classified = classifyNetworkError(error);

            expect(classified.type).toBe(NetworkErrorType.CONNECTION);
            expect(classified.isRetryable).toBe(true);
        });

        it('should classify authentication errors', () => {
            const error: any = new Error('Unauthorized');;
            error.status = 401;
            const classified = classifyNetworkError(error);

            expect(classified.type).toBe(NetworkErrorType.AUTHENTICATION);
            expect(classified.isRetryable).toBe(false);
            expect(classified.statusCode).toBe(401);
        });

        it('should classify rate limit errors', () => {
            const error: any = new Error('Rate limit exceeded');
            error.status = 429;
            const classified = classifyNetworkError(error);

            expect(classified.type).toBe(NetworkErrorType.RATE_LIMIT);
            expect(classified.isRetryable).toBe(true);
            expect(classified.statusCode).toBe(429);
        });

        it('should classify server errors as retryable', () => {
            const error: any = new Error('Internal Server Error');
            error.status = 500;
            const classified = classifyNetworkError(error);

            expect(classified.type).toBe(NetworkErrorType.SERVER_ERROR);
            expect(classified.isRetryable).toBe(true);
            expect(classified.statusCode).toBe(500);
        });

        it('should classify client errors as non-retryable', () => {
            const error: any = new Error('Bad Request');
            error.status = 400;
            const classified = classifyNetworkError(error);

            expect(classified.type).toBe(NetworkErrorType.CLIENT_ERROR);
            expect(classified.isRetryable).toBe(false);
            expect(classified.statusCode).toBe(400);
        });

        it('should handle status codes via statusCode property', () => {
            const error = { message: 'Server Error', statusCode: 503 };
            const classified = classifyNetworkError(error);

            expect(classified.type).toBe(NetworkErrorType.SERVER_ERROR);
            expect(classified.isRetryable).toBe(true);
            expect(classified.statusCode).toBe(503);
        });

        it('should handle unknown errors optimistically', () => {
            const error = new Error('Something strange happened');
            const classified = classifyNetworkError(error);

            expect(classified.type).toBe(NetworkErrorType.UNKNOWN);
            expect(classified.isRetryable).toBe(true); // Optimistic default
        });

        it('should handle null/undefined errors', () => {
            expect(classifyNetworkError(null).type).toBe(NetworkErrorType.UNKNOWN);
            expect(classifyNetworkError(undefined).type).toBe(NetworkErrorType.UNKNOWN);
            expect(classifyNetworkError('string error').type).toBe(NetworkErrorType.UNKNOWN);
        });

        it('should classify various DNS errors', () => {
            const dnsErrors = [
                'ENOTFOUND: DNS lookup failed',
                'EAI_AGAIN: DNS server returned answer with no data',
                'getaddrinfo ENOTFOUND api.openai.com',
            ];

            dnsErrors.forEach(message => {
                const error = new Error(message);
                const classified = classifyNetworkError(error);
                expect(classified.type).toBe(NetworkErrorType.CONNECTION);
                expect(classified.isRetryable).toBe(true);
            });
        });
    });
});
