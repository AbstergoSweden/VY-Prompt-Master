# Usage Guide

> How to use VY Prompt Master to create reliable VY automation prompts.

---

## Quick Start

### 1. Choose Your AI Integration

Use the appropriate system message for your AI:

- **General purpose**: [ai-review-prompt.md](./ai-review-prompt.md)
- **Gemini CLI**: [GEMINI.md](../GEMINI.md)
- **Qwen**: [QWEN.md](../QWEN.md)
- **OpenAI**: [AGENTS.md](../AGENTS.md)

### 2. Provide a Task Description

Include these required elements:

```
- Target application/site
- Desired end state (what "done" looks like)
- Authentication state
- Any constraints
```

**Example**:

```
Open Safari, navigate to example.com, extract the main headline, 
and save it to a file called headline.txt in my Documents folder.
```

### 3. Review Generated YAML

Ensure the output includes:

- All 8 top-level keys
- 8 fields per step
- Proper safety gates for risky actions

### 4. Validate Against Schema

```bash
npx ajv validate -s framework/vy-prompt-schema.json -d your-prompt.yaml
```

---

## Understanding the Output

### Top-Level Structure

```yaml
identity: "VY Automation Agent"
purpose: "Goal statement"
context: { platform, access_method, auth_state, environment }
inputs: [ { name, required, description } ]
task: { goal, steps: [...] }
constraints: [ "..." ]
output_format: { type, structure }
self_check: [ "..." ]
```

### Step Structure

Every step has 8 required fields:

| Field | Purpose |
|-------|---------|
| `step_id` | Unique identifier |
| `intent` | What this step does |
| `locate` | How to find the UI element |
| `confirm_target` | Verify before acting |
| `act` | The action to perform |
| `verify_outcome` | Evidence of success |
| `fallback_paths` | Alternatives on failure |
| `safety_gate` | Risk level |

---

## Handling Edge Cases

### Ambiguous Requests

If your request lacks details, the AI returns:

```yaml
inputs_missing:
  - "What specific file should be uploaded?"
  - "Which cloud service is the target?"
```

Provide the missing information and retry.

### Disallowed Requests

If your request violates safety policies, the AI responds with a safe refusal (no YAML):

```
I cannot help with that request. However, I can suggest...
```

### High-Risk Requests

Legitimate but destructive requests will include confirmation checkpoints:

```yaml
- step_id: "step_005_confirm_deletion"
  safety_gate: "irreversible_requires_confirmation"
```

---

## Best Practices

1. **Be specific** – "Click the blue Send button" not "click send"
2. **Include context** – Mention the app, window, and section
3. **Define success** – What observable change means "done"?
4. **Consider failures** – What if the element isn't there?
5. **Gate risky actions** – Always confirm before delete/send/pay

---

## Resources

- [WORKFLOW.md](./WORKFLOW.md) – Complete workflow documentation
- [QUICK-REFERENCE.md](./QUICK-REFERENCE.md) – Quick lookup card
- [SCHEMA.md](./SCHEMA.md) – Schema field reference
- [examples/](../examples/) – Sample prompts and tasks
