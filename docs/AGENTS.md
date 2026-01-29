# Repository Guidelines

## Project Structure & Module Organization

- The repository is flat (no nested directories) and is primarily YAML and Markdown content.
- Core personas/frameworks: `VY-Prompt-Engineering-Persona*.yaml`, `VY-Meta-Prompt.yaml`,
  `VY-Unified-Framework-v3.yaml`.
- Task specs and examples: `vy_task*.yaml` for task definitions, `test_prompt*.yaml`
  for sample prompts.
- Schema and docs: `vy-prompt-schema.json` and `Schema Overview.md` describe required fields
  and validation rules.
- Supporting references: `knowledge *.txt`, `Response*.yml`, and `backup*.md` preserve
  research notes and prior outputs.

## Build, Test, and Development Commands

- There is no build or runtime step; this is a content repository.
- Schema validation (convert YAML to JSON first) can be done with:
  `npx ajv validate -s vy-prompt-schema.json -d my-prompt.json`
- For editor validation, add: `# yaml-language-server: $schema=./vy-prompt-schema.json`.

## Coding Style & Naming Conventions

- Use 2-space indentation in YAML; avoid tabs and trailing whitespace.
- Prefer `snake_case` keys and ids (e.g., `fallback_paths`, `inputs_missing`).
- `step_id` naming pattern: `step_001_short_name`; input/assumption ids match `[a-z][a-z0-9_]*`.
- For action steps, follow the `locate` → `confirm_target` → `act` → `verify_outcome`
  pattern and include `fallback_paths` and `safety_gate`.

## Testing Guidelines

- No automated tests are present; schema validation is the primary check.
- Verify required top-level keys and that every step includes all required fields.
- Use `test_prompt*.yaml` as regression references when adding or refactoring patterns.

## Commit & Pull Request Guidelines

- This folder is not a Git repo, so there is no established commit history to mirror.
- If you initialize Git, use short imperative commit messages (e.g., "Add schema validation note").
- In PRs, include a brief description, list of changed prompt files, and validation evidence
  or manual review notes.

## Security & Configuration Tips

- Treat `.env` as local-only; do not paste secrets into docs or examples.
- Avoid adding operational instructions that violate the safety boundaries documented
  in the persona files.
