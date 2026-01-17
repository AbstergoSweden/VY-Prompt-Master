# Workflow Meta Guide

## Purpose
This guide explains how to use the meta prompt to generate consistent, safe, and actionable VY prompt specifications. It captures the workflow, best practices, and common pitfalls observed in this repository.

## Inputs You Need
Provide a short, structured task brief. If any of these are missing, the prompt generator should return an inputs_missing list and stop.
- Target app or site and access method (desktop, web, mobile, hybrid)
- Desired end state (what "done" looks like)
- Auth requirement (user_logged_in_as_needed, logged_in, public)
- Any constraints (time, risk tolerance, data sources)

Optional but helpful
- Preferred UI path (menu path, known URL)
- OS version and browser name
- Data that will be typed or uploaded (never include secrets)

## End-to-End Workflow
1. Intake and classify
   - Run policy routing: allowed, ambiguous, disallowed, high_risk_irreversible.
   - If ambiguous, return inputs_missing only.
   - If disallowed, provide a safe alternative without operational detail.
   - If high risk, plan a user confirmation checkpoint before the irreversible step.

2. Plan the execution
   - Break the task into short, atomic steps.
   - Every step must follow locate -> confirm_target -> act -> verify_outcome.
   - Identify checkpoints and irreversible actions early.
   - Decide whether a TODO.md checkpoint is needed for 20+ actions.

3. Draft the YAML spec
   - Required keys: identity, purpose, context, inputs, task, constraints, output_format, self_check.
   - Optional keys: assumptions, robustness_improvements, validation_tests, failure_playbooks, examples.
   - Keep language deterministic and UI-grounded.

4. Add safety and robustness
   - Use safety_gate values: safe, caution, irreversible_requires_confirmation.
   - Insert confirmation prompts before delete, send, pay, post, or publish actions.
   - Add fallback_paths for critical steps.
   - Limit retries to 2 with progressive waits (250ms -> 500ms -> 1000ms).

5. Validate before output
   - Schema checks: required keys, correct types.
   - UI checks: locate and verify_outcome on every step.
   - Safety checks: no bypass or credential harvesting.
   - Determinism: no claims of completed actions.

6. Output discipline
   - YAML only for allowed requests.
   - No preamble, no commentary, no code fences.
   - Use ASCII and 2-space indentation.

## Best Practices
- Use specific UI anchors: button labels, section headers, icons, and nearby text.
- Prefer reversible operations first; if a change is irreversible, create a checkpoint.
- Always clear pre-existing text before typing in fields.
- Use macOS conventions (Command-based shortcuts, open_application, open_url).
- Keep steps short and single-purpose. Avoid multi-intent steps.
- Use assumptions for non-blocking unknowns and verify them in early steps.

## Do and Do Not
Do
- Write actions as instructions for VY, not as completed actions.
- Provide at least one fallback for steps that could fail.
- Include evidence expectations in verify_outcome and output_format.
- Use step_id naming: step_001_short_name.

Do Not
- Do not claim tool access or results.
- Do not skip verify_outcome.
- Do not include irreversible actions without explicit confirmation.
- Do not include secrets or ask for passwords.

## Example Walkthrough (Short)
User task: "Open Safari, go to vercept.com, capture the main headline, close Safari."
- Step 1: Launch Safari (locate Dock icon, confirm Safari is visible, act, verify window).
- Step 2: Navigate to URL (focus address bar, clear, type URL, verify page load).
- Step 3: Capture headline (locate largest heading, confirm, read text, verify non-empty).
- Step 4: Close Safari (locate close or quit, confirm, act, verify closed).
- Step 5: Report results (return headline and status).

## Quality Checklist
- All required keys present.
- Every step uses locate -> confirm_target -> act -> verify_outcome.
- safety_gate set for each step.
- Fallbacks included for critical steps.
- No tool claims or completion claims.
- Output is valid YAML only.

## Troubleshooting
- If UI element cannot be found, use fallback_paths and re-locate before retrying.
- If a modal appears, prefer cancel/close unless required for progress.
- If authentication is needed, stop and ask the user to log in manually.
