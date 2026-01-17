# File Review Notes

This review maps each repository item to its intent and output style. It is based on a per-file scan of the current root directory.

| File | Purpose | Style and Output |
| --- | --- | --- |
| `.DS_Store` | macOS Finder metadata. | Binary file, not source content. |
| `.env` | Local API keys for Gemini and related tooling. | `KEY=value` secrets; do not commit or embed in prompts. |
| `ClaudesPromptToVY.yaml` | Example task spec for clearing Safari cookies. | YAML prompt spec with UI steps, safety gates, checkpoints, and confirmation wording; tab-indented in places. |
| `Ressponse1.yml` | Persona specification for VY prompt engineering. | YAML spec with policy router, action primitives, schemas, and playbooks. |
| `Response2.yml` | Error log plus embedded base persona. | Mixed text log and YAML block; includes error context and nested spec. |
| `Response3.yml` | Earlier persona spec variant. | YAML with concise sections and fewer optional blocks. |
| `Schema Overview.md` | Schema summary and validation guidance. | Markdown with tables and example ajv usage. |
| `VY Prompt Architect Output.md` | Generated output plus original task brief. | Markdown with a fenced YAML block followed by narrative and tables. |
| `VY Records.md` | Session tracking notes. | Short Markdown with a local file link and session ID list. |
| `VY-Meta-Prompt-Quick-Reference.md` | Quick reference guide for the meta prompt. | Markdown with sections, tables, and checklists. |
| `VY-Meta-Prompt.yaml` | Unified meta prompt specification. | YAML with policy routing, action primitives, state machine, and validation rules. |
| `VY-Prompt-Engineering-Perona1.yaml` | Alternate meta prompt for non-VY AI usage. | YAML with placeholders, heavy commentary, and explicit usage rules. |
| `VY-Prompt-Engineering-Persona.yaml` | Primary VY prompt engineering persona. | Long-form YAML with constraints, action primitives, and robust playbooks. |
| `VY-Prompt-Engineering-Persona2.yaml` | Secondary copy of the primary persona. | Nearly identical YAML to the primary persona. |
| `VY-Unified-Framework-v3.yaml` | Consolidated framework spec (v3). | YAML with section headers, expanded conventions, and detailed execution principles. |
| `VY_Engineering-Persona.yaml` | Example VY prompt spec with comments. | YAML with commentary for human review and sample UI steps. |
| `backupAGENTS.md` | Long-form project overview. | Markdown summary of files and concepts; includes plaintext API keys (treat as sensitive). |
| `backupGEMINI.md` | Alternative project overview. | Markdown summary mirroring backupAGENTS.md without the API key block. |
| `backupQWEN.md` | Alternative project overview. | Markdown summary mirroring backupGEMINI.md. |
| `knowledge 1.txt` | Core architecture and AI foundation description. | Plain text narrative with uppercase section headings. |
| `knowledge 2.txt` | Tool system and interaction mechanisms. | Plain text narrative with detailed capability coverage. |
| `knowledge 3.txt` | Workflow execution and operational intelligence. | Plain text narrative with rules, heuristics, and do/not behavior. |
| `test_promptV1.yaml` | Example prompt for code librarian workflow. | YAML with phases, TODO usage, and citation markers. |
| `test_promptV2yaml.yaml` | Second example prompt for cleanup workflow. | YAML with explicit steps and rollback requirements. |
| `test_promptV3.yaml` | Expanded example prompt with folded YAML. | YAML using folded scalars and longer assumption blocks. |
| `vy-prompt-schema.json` | JSON Schema for prompt validation. | Draft-07 schema with required keys and step definitions. |
| `vy_task1.yaml` | Task brief for generating the persona. | YAML task prompt with constraints and playbook summary. |
| `vy_task2.yaml` | Expanded task brief with extra requirements. | YAML with policy router, state machine, and action primitives. |
