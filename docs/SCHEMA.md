# VY Prompt Schema Reference

## Schema Overview

**File:** `~VY Prompt master/vy-prompt-schema.json`

### Required Top-Level Properties

| Property | Type | Description |
| ---------- | ------ | ------------- |
| `identity` | string | Role/persona for VY |
| `purpose` | string | What the prompt accomplishes |
| `context` | object | Platform, access method, auth state, environment |
| `inputs` | array | Required inputs for task |
| `task` | object | Goal + ordered steps |
| `constraints` | array | Hard constraints |
| `output_format` | object | Expected output format |
| `self_check` | array | Validation questions |

### Optional Properties

| Property | Type | Description |
| ---------- | ------ | ------------- |
| `assumptions` | array | Documented assumptions with risk/mitigation |
| `robustness_improvements` | object | Retries, rollbacks, monitoring |
| `validation_tests` | object | Schema, UI, safety, determinism tests |
| `failure_playbooks` | array | Predefined failure responses |
| `examples` | array | Example inputs/outputs |
| `inputs_missing` | array | Blocks execution if present |

---

### Step Schema (within `task.steps[]`)

Every step **requires** all 8 fields from the locate→confirm→act→verify pattern:

```json
{
  "step_id": "step_001_launch_safari",      // pattern: step_NNN_name
  "intent": "Launch Safari browser",         // min 10 chars
  "locate": "Safari icon in macOS Dock",     // min 10 chars
  "confirm_target": "Safari icon visible",
  "act": "Click Safari icon",                // min 5 chars
  "verify_outcome": "Safari window appears", // min 10 chars
  "fallback_paths": ["Use open_application tool"],
  "safety_gate": "safe"                      // enum
}
```

**Optional step fields:**

- `wait_before` / `wait_after` (ms)
- `screenshot_before` / `screenshot_after` (boolean)
- `user_confirmation_required` (boolean)
- `confirmation_prompt` (string)
- `max_retries` (0-5, default 2)
- `timeout` (ms)
- `notes` (string)

---

### Safety Gate Enum

```json
["safe", "caution", "checkpoint", "irreversible_requires_confirmation"]
```

---

### Validation Patterns

| Field | Pattern | Example |
| ------- | --------- | --------- |
| `step_id` | `^step_[0-9]{3}_[a-z][a-z0-9_]*$` | `step_001_launch_browser` |
| `input.name` | `^[a-z][a-z0-9_]*$` | `user_task_description` |
| `assumption.id` | `^[a-z][a-z0-9_]*$` | `vy_local_agent_presence` |
| `failure_playbook.name` | `^[a-z][a-z0-9_]*$` | `ui_not_found` |

---

### Usage

You can validate any VY prompt YAML against this schema by:

1. Converting YAML to JSON
2. Running a JSON Schema validator (e.g., `ajv`, `jsonschema`, VS Code)

```bash
# Example with ajv-cli
npx ajv validate -s vy-prompt-schema.json -d my-prompt.json
```

Or use it in VS Code with YAML extension by adding to your YAML file:

```yaml
# yaml-language-server: $schema=./vy-prompt-schema.json
```
