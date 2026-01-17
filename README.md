# Codex Review Files

![6A546ECF-F04C-456B-B8DE-68772634596A_1_105_c](https://github.com/user-attachments/assets/07d33d72-449a-4a77-a975-895017b45672)

## Overview
This folder contains a synthesized, production-ready set of documents for generating and validating VY (Vercept) automation prompt specifications. The contents are derived from the repository's existing personas, frameworks, knowledge files, and examples. Use these files to standardize prompt creation, enforce safety boundaries, and produce deterministic YAML specs.

## Audience
- Prompt engineers producing VY-compatible execution specs
- Reviewers validating UI-grounded automation prompts
- Contributors aligning new prompts with the repository's conventions

## Contents
- `meta-prompt-system.md` - System message for a non-VY AI that generates VY prompt specs.
- `vy-concept-system-message.md` - Example system message produced by the meta prompt, shown as YAML output.
- `workflow-meta-guide.md` - End-to-end process guide with best practices and do/do-not rules.
- `file-review-notes.md` - Per-file review of purpose, style, and output conventions.

## Quickstart
1. Provide `meta-prompt-system.md` as the system message to a non-VY AI model.
2. Give the model a structured task brief (target app/site, end state, auth state, constraints).
3. Receive a YAML prompt spec as output (no preamble or commentary).
4. Validate the YAML against the schema if needed:
   - Convert YAML to JSON.
   - Run: `npx ajv validate -s vy-prompt-schema.json -d my-prompt.json`

## Output Expectations
A valid VY prompt spec must include:
- Top-level keys: identity, purpose, context, inputs, task, constraints, output_format, self_check.
- Task steps with the 8 required fields: step_id, intent, locate, confirm_target, act, verify_outcome, fallback_paths, safety_gate.
- Explicit safety gates for any irreversible action.

## Conventions
- Use 2-space indentation and ASCII characters.
- Use `step_001_short_name` for step_id naming.
- Use macOS conventions (Command shortcuts, open_application, open_url).
- Clear text fields before typing new content.
- Prefer reversible actions first; insert checkpoints for destructive steps.

## Validation and Quality Bar
Run these checks before accepting a prompt spec:
- Schema: required keys and correct types.
- UI: every step has locate and verify_outcome.
- Safety: no bypass, evasion, or credential harvesting.
- Determinism: no claims of completed actions.

## Security and Privacy
- Treat `.env` as local-only and never embed secrets in prompts or examples.
- Avoid copying API keys or private data into documentation.

## Contributing
If you add new prompt specs:
- Mirror the existing YAML structure and safety boundaries.
- Add fallback_paths for steps likely to fail.
- Update `file-review-notes.md` if you add new files or change conventions.

## Notes
This folder is a synthesis layer. It does not replace the source YAML and knowledge documents; it distills them into a usable workflow and examples.
