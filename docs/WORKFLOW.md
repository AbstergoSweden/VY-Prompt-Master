# VY Prompt Engineering Workflow

> Complete end-to-end guide for understanding and using the VY Prompt Master framework.

---

## Overview

The VY Prompt Master workflow transforms high-level user task descriptions into detailed, executable
YAML specifications that Vy can safely and deterministically execute on macOS.

```text
User Request → Classification → Planning → YAML Generation → Validation → Execution
```

---

## Phase 1: Task Intake & Classification

### Required Inputs

Every request must specify (or the system will ask for):

| Input | Description | Example |
| ------- | ------------- | --------- |
| Target application/site | What app or website is involved | Safari, Finder, Excel |
| Access method | How to interact | desktop, web, hybrid |
| Desired end state | What "done" looks like | "Email sent with attachment" |
| Auth state | Login requirements | logged_in, requires_login |
| Constraints | Special requirements | Offline mode, time limits |

### Policy Router

```text
               ┌─────────────────┐
               │  User Request   │
               └────────┬────────┘
                        ▼
               ┌─────────────────┐
               │    Classify     │
               └────────┬────────┘
         ┌──────────────┼──────────────┐
         ▼              ▼              ▼
    ┌─────────┐   ┌──────────┐   ┌──────────────┐
    │Disallowed│   │Ambiguous │   │   Allowed    │
    └────┬────┘   └────┬─────┘   └──────┬───────┘
         ▼             ▼                 │
    Safe Refusal   inputs_missing   ┌────┴────┐
    (No YAML)      YAML list        ▼         ▼
                                High-Risk  Standard
                                    │         │
                                    ▼         ▼
                              Add Confirm  Generate
                              Checkpoint   YAML Plan
```

### Classification Outcomes

| Result | Action |
| -------- | -------- |
| **Disallowed** | Safe refusal, no YAML output |
| **Ambiguous** | Output `inputs_missing` YAML list only |
| **High-Risk** | Add confirmation checkpoint, then generate |
| **Allowed** | Generate full YAML specification |

---

## Phase 2: Planning

### Step Decomposition

Break the task into atomic steps, each following the pattern:

```text
locate → confirm_target → act → verify_outcome
```

**Rules:**

- One intent per step (never combine actions)
- Each step must be independently verifiable
- Identify irreversible actions upfront
- Map UI elements precisely

### Step ID Convention

Format: `step_<NNN>_<action_name>`

**Examples:**

- `step_001_launch_safari`
- `step_005_enter_credentials`
- `step_010_confirm_deletion`

### Safety Gate Assignment

| Gate Level | Use Case | Example Actions |
| ------------ | ---------- | ----------------- |
| `safe` | Routine, non-destructive | Open app, navigate, read |
| `caution` | Sensitive but reversible | Write file, change setting |
| `irreversible_requires_confirmation` | Permanent effects | Delete, send, purchase |

---

## Phase 3: YAML Specification

### Required Structure

```yaml
identity: "VY Automation Agent"  # Role/persona
purpose: "One sentence goal"      # Min 10 chars

context:
  platform: "VY (Vercept) automation agent on macOS"
  access_method: "desktop"  # desktop/web/mobile/hybrid
  auth_state: "user_logged_in_as_needed"
  environment: "macOS, Safari browser"

inputs:  # Min 1 item
  - name: "user_task_description"
    required: true
    description: "High-level task description"

task:
  goal: "Desired end state"  # Min 10 chars
  steps:  # Min 1 step, each with 8 required fields
    - step_id: "step_001_action"
      intent: "Purpose of this step"       # Min 10 chars
      locate: "UI element description"     # Min 10 chars
      confirm_target: "Verification before acting"
      act: "Specific action to perform"    # Min 5 chars
      verify_outcome: "Evidence of success" # Min 10 chars
      fallback_paths: ["Alternative if fails"]
      safety_gate: "safe"

constraints:  # Min 1 item
  - "Hard constraint or caveat"

output_format:
  type: "yaml"  # yaml/markdown/plaintext/json
  structure: "Description of output"

self_check:  # Min 1 item, min 10 chars each
  - "Did the action succeed?"
```

### Optional Sections

Include when relevant:

```yaml
assumptions:
  - id: "assumption_001"
    statement: "What we're assuming"
    confidence: "high"  # high/medium/low
    risk: "What happens if wrong"
    mitigation: "How to handle it"
    verification_method: "How to check"

robustness_improvements:
  retries:
    - condition: "Element not found"
      max_attempts: 2
      backoff: "250ms → 500ms → 1000ms"
      recovery_action: "Try fallback"
  rollbacks:
    - trigger: "Critical failure"
      procedure: "Undo steps"
      reversibility_level: "full"

failure_playbooks:
  - name: "ui_not_found"
    detection: "Element not found after retries"
    response:
      - "Execute fallback_paths"
      - "Capture screenshot"
      - "Request user assist"
```

---

## Phase 4: Validation

### Four Categories of Tests

| Category | What It Checks |
| ---------- | ---------------- |
| **Schema Tests** | Required keys, types, formats |
| **UI Tests** | locate+confirm+verify for every step |
| **Safety Tests** | No disallowed content, proper gates |
| **Determinism Tests** | No hallucination, present-tense imperatives |

### Validation Checklist

**Schema Compliance:**

- [ ] All 8 top-level keys present
- [ ] Every step has 8 required fields
- [ ] `step_id` format: `step_NNN_name`
- [ ] Valid enum values for safety_gate

**UI Grounding:**

- [ ] Every step has specific `locate` (≥10 chars)
- [ ] Every step has `verify_outcome` (≥10 chars)
- [ ] No coordinate-based clicks without fallback
- [ ] Critical steps have fallback paths

**Safety:**

- [ ] Irreversible steps have confirmation checkpoint
- [ ] No credentials or secrets in plan
- [ ] No disallowed content

**Determinism:**

- [ ] Present-tense imperatives ("Click" not "Clicked")
- [ ] No claims of completion without verification
- [ ] Assumptions documented with mitigation

### Validation Commands

```bash
# Validate YAML syntax
npx yaml-lint framework/*.yaml

# Validate against schema
npx ajv validate -s framework/vy-prompt-schema.json -d my-prompt.yaml
```

---

## Phase 5: Execution by Vy

### Execution Flow

```text
1. INTAKE
   └─→ Parse identity, purpose, context
   └─→ Bind input values

2. PREFLIGHT
   └─→ Verify assumptions
   └─→ Check prerequisites
   └─→ Validate auth state

3. EXECUTE STEPS (for each step)
   ├─→ LOCATE: Find UI element
   ├─→ CONFIRM: Verify correct target
   ├─→ ACT: Perform action
   └─→ VERIFY: Check outcome
       ├─→ Success → Next step
       └─→ Failure → Fallback → Retry → Escalate

4. POST-EXECUTION
   └─→ Run self_check questions
   └─→ Validate all goals met

5. OUTPUT
   └─→ Format per output_format
   └─→ Return to user
```

### Error Handling

| Failure Type | Response |
| -------------- | ---------- |
| Transient | Retry with backoff (250ms → 500ms → 1s) |
| UI not found | Try fallback paths |
| Verification failed | Rollback if available, else escalate |
| Auth blocked | Halt, request manual login, resume |
| User cancellation | Graceful abort with progress summary |

### User Interaction Points

The user only intervenes when:

1. **Auth required**: Vy pauses for manual login
2. **Confirmation needed**: Irreversible action requires explicit approval

---

## Common Pitfalls

### ❌ Hallucinated Completion

```yaml
# WRONG
act: "Clicked the Send button"  # Past tense
```

```yaml
# CORRECT
act: "Click the Send button"  # Present tense imperative
```

### ❌ Vague UI Description

```yaml
# WRONG
locate: "The button"
```

```yaml
# CORRECT
locate: "Blue 'Send' button in top-right of compose window"
```

### ❌ Missing Fallback

```yaml
# WRONG
fallback_paths: []  # No alternatives
```

```yaml
# CORRECT
fallback_paths:
  - "Use keyboard shortcut Cmd+Enter"
  - "Navigate via menu: File > Send"
```

### ❌ Wrong Safety Gate

```yaml
# WRONG - file deletion marked as safe!
safety_gate: "safe"
```

```yaml
# CORRECT
safety_gate: "irreversible_requires_confirmation"
```

---

## Quick Reference Card

**Core Pattern:**

```text
locate → confirm_target → act → verify_outcome
```

**Golden Rule:**
> If VY cannot verify it, VY should not execute it.

**Step Fields (all 8 required):**

1. `step_id` - Unique identifier
2. `intent` - Purpose
3. `locate` - UI element
4. `confirm_target` - Pre-check
5. `act` - Action
6. `verify_outcome` - Post-check
7. `fallback_paths` - Alternatives
8. `safety_gate` - Risk level

**macOS Conventions:**

- Use Command (⌘), not Control
- Use `open_application` for apps
- Clear fields before typing
- Use calendar pickers for dates
