# VY Meta Prompt - Quick Reference Guide

## Overview

The **VY Meta Prompt** is a unified framework that consolidates all VY (Vercept) automation best practices into a single, streamlined specification for generating safe, deterministic, and robust UI automation prompts.

**Version:** 2.0  
**Date:** 2026.01.16  
**Purpose:** Single-source-of-truth for VY prompt engineering

---

## Quick Start: 5-Phase Workflow

### Phase 1: Intake & Classification

```text
1. Receive user task description
2. Classify via policy_router: allowed / disallowed / ambiguous / high_risk_irreversible
3. Route appropriately:
   - disallowed → safe alternative only
   - ambiguous → inputs_missing list
   - high_risk → user confirmation checkpoint
   - allowed → proceed to planning
```

### Phase 2: Planning

```text
1. Draft 2-3 internal approaches
2. Evaluate: safety, reliability, reversibility, efficiency
3. Decompose into UI action primitives (8-field steps)
4. Identify checkpoints and safety gates
5. Document assumptions with mitigations
```

### Phase 3: Specification Generation

```text
1. Use the standardized template structure
2. Include all required keys (identity, purpose, context, inputs, task, constraints, output_format, self_check)
3. Add assumption_ledger for non-blocking unknowns
4. Add evidence_ledger expectations
5. Include failure_playbooks for common scenarios
6. Add robustness_improvements (retries, rollbacks, monitoring)
```

### Phase 4: Validation

```text
Run all four validation categories:

✓ Schema Tests: All required keys present, correct types
✓ UI Tests: locate+confirm+verify for every step, unique identifiers
✓ Safety Tests: No disallowed content, no credential harvesting
✓ Determinism Tests: No completion claims, concrete actions only

Execute self_check questions (all 10 must pass)
```

### Phase 5: Output

```text
If inputs_missing → output ONLY inputs_missing YAML list
If validation fails → return to planning with issues
If validation passes → emit pure YAML only (no preamble, commentary, code fences)
```

---

## The 8-Field UI Action Primitive

Every step **MUST** include these fields:

| Field | Description | Example |
|-------|-------------|---------|
| **step_id** | Unique identifier | `step_001_launch_browser` |
| **intent** | Single-sentence purpose | "Launch the user's default web browser" |
| **locate** | Unambiguous UI element | "Visible 'Safari' icon in macOS Dock" |
| **confirm_target** | Verify BEFORE acting | "Browser window appears in foreground" |
| **act** | Specific action | "Click Safari icon or use open_application tool" |
| **verify_outcome** | Observable evidence AFTER | "Browser is active, new window open" |
| **fallback_paths** | Alternative approaches | `["Use open_application tool if click fails"]` |
| **safety_gate** | Risk level | `safe` / `caution` / `irreversible_requires_confirmation` |

**Pattern:** `locate → confirm_target → act → verify_outcome`

---

## Safety Gate Levels

| Level | When to Use | Confirmation Required? |
|-------|-------------|----------------------|
| **safe** | Standard UI interactions, easily reversible | No |
| **caution** | Moderate consequences, checkpoint recommended | Optional |
| **irreversible_requires_confirmation** | Delete, send, pay, post, destructive actions | **YES - Explicit user confirmation** |

---

## Critical Rules

### ✅ DO

- **ALWAYS** use locate→confirm→act→verify pattern
- **ALWAYS** provide fallback paths for critical steps
- **ALWAYS** document assumptions in assumption_ledger
- **ALWAYS** classify via policy_router before proceeding
- **ALWAYS** require user confirmation for irreversible actions
- **ALWAYS** phrase as instructions-to-VY (never completed actions)
- **ALWAYS** use unique UI identifiers (button text, field labels)
- **ALWAYS** capture observable evidence for verification

### ❌ NEVER

- **NEVER** claim tool access ("I clicked X") - only instruct ("VY should click X")
- **NEVER** use vague references ("the button", "the field")
- **NEVER** skip verify_outcome steps
- **NEVER** allow irreversible actions without safety_gate
- **NEVER** include preamble/commentary in YAML output
- **NEVER** bypass policy_router classification
- **NEVER** provide bypass/jailbreak instructions
- **NEVER** harvest credentials or secrets
- **NEVER** repeat failed actions more than 2 times

---

## Platform-Specific Conventions

### macOS

- **Keyboard:** Use Command (cmd) key, NOT Control (ctrl)
- **Launch Apps:** Use `open_application` tool, NOT clicking Dock
- **File Operations:** Use Finder integration tools
- **Sliders:** Use percentage positioning (e.g., "slider at 45%")
- **Paths:** Use tilde (~) for home directory

### Web Automation

- **Navigation:** Use `open_url` tool, NOT typing in address bar
- **Google:** Use `google_search` tool directly
- **Forms:** ALWAYS erase pre-existing text before typing
- **Dates:** Use visual calendar selection when available
- **Known URLs:**
  - GitHub new repo: `github.com/new`
  - Twitter search: `twitter.com/search?q=...`

---

## Failure Playbooks

### 1. ui_not_found

**Detection:** Element not found after 2 attempts  
**Response:**

1. Execute fallback_paths in priority order
2. Attempt search within app/menu
3. Reposition mouse and retry
4. Capture screenshot → request user clarification

### 2. unexpected_modal

**Detection:** Modal interrupts workflow  
**Response:**

1. Identify title and button labels
2. Prefer cancel/close unless required
3. If destructive wording → require user confirmation

### 3. auth_blocked

**Detection:** Login prompt or session expiration  
**Response:**

1. Halt automation immediately
2. Request manual login: "Authentication required. Please log in manually to proceed."
3. Resume from last checkpoint after confirmation

### 4. verification_failed

**Detection:** verify_outcome not met  
**Response:**

1. Wait 250ms and retry
2. Check for modals/notifications
3. Re-locate element
4. Execute fallback path

---

## Validation Tests Checklist

### Schema Tests

- [ ] All 8 required keys present (identity, purpose, context, inputs, task, constraints,
  output_format, self_check)
- [ ] No unknown top-level keys
- [ ] Correct data types (lists for steps, strings for identity, etc.)

### UI Tests

- [ ] Every action step has locate + confirm_target + verify_outcome
- [ ] locate uses unique identifiers (button text, field label, etc.)
- [ ] All irreversible steps have safety_gate == irreversible_requires_confirmation
- [ ] Platform conventions followed (macOS shortcuts)
- [ ] Critical steps have fallback paths

### Safety Tests

- [ ] No bypass/jailbreak/evasion content
- [ ] No credential harvesting or secret collection
- [ ] Manual authentication specified if needed
- [ ] User confirmation required for destructive actions

### Determinism Tests

- [ ] No claims of completed actions (only instructions)
- [ ] No vague verbs ('handle it', 'process it')
- [ ] Concrete actions with exact parameters
- [ ] Observable success criteria defined

---

## Assumption Ledger Template

```yaml
assumptions:
  - id: "assumption_001"
    statement: "What we're assuming"
    confidence: "low | medium | high"
    risk: "What breaks if assumption is wrong"
    mitigation: "How to reduce risk"
    verification_method: "How to check the assumption"
```

**Mandatory Assumptions:**

- vy_local_agent_presence
- vy_ui_grounding_capability
- macOS_environment_conventions
- target_application_availability

---

## Evidence Ledger Template

```yaml
# Internally tracked during execution
evidence_ledger:
  - step_id: "step_001"
    what_observed: "Browser window appeared with Safari title bar"
    where_observed: "Foreground application window"
    why_it_matters: "Confirms browser launch success, ready for navigation"
```

**Capture Timing:**

- Before critical UI state changes
- After every verify_outcome step
- Before user confirmation prompts

---

## Complexity Thresholds

| Actions | Workflow Type | TODO.md Required? |
|---------|---------------|-------------------|
| ≤ 20 | Simple task | No - execute directly |
| 21-100 | Complex task | Yes - checkpoint phases |
| > 100 | Very complex | Yes - subtask checkpoints |

**Checkpoint Rule:** Always update TODO.md before creating a checkpoint

---

## Output Contract

**Format Rule:** Output ONLY valid YAML  
**No Extras:** No preamble, no commentary, no quotes, no code fences  
**Missing Info:** If details missing → output only inputs_missing YAML list  
**Determinism:** Avoid ambiguous language, use enumerated steps and observable evidence

### ✅ Valid Output

```yaml
---
identity: "VY Task Executor"
purpose: "Extract data from website"
# ... rest of valid YAML
```

### ❌ Invalid Output

```yaml
# DON'T: Include preamble
Here is the prompt specification:

```yaml
---
identity: "VY Task Executor"
# ...
```
```

---

## Common Patterns

### Multi-Phase Workflow

```yaml
task:
  goal: "Complete complex data entry task"
  phases:
    - phase_id: "setup"
      steps: [...]
      checkpoint: "applications_launched"
      rollback: "close_applications"
    - phase_id: "execution"
      steps: [...]
      checkpoint: "data_entered"
      rollback: "undo_data_entry"
    - phase_id: "verification"
      steps: [...]
```

### Conditional Branching

```yaml
- step_id: "decision_001"
  intent: "Check if user is logged in"
  locate: "Top-right corner for user avatar or 'Sign In' button"
  branches:
    - condition: "User avatar visible"
      next_step: "step_010_proceed"
    - condition: "'Sign In' button visible"
      next_step: "step_005_request_login"
```

---

## Self-Check Questions (Must Pass All)

1. Did I classify the request via policy_router correctly?
2. If inputs are missing, did I output only inputs_missing and stop?
3. Does every step use locate→confirm→act→verify with observable evidence?
4. Are irreversible actions gated with explicit user confirmation?
5. Did I avoid tool-access hallucinations and completion claims?
6. Did I convert unsafe content into compliant alternatives without operational detail?
7. Is the output pure YAML without preamble or code fences?
8. Are all UI actions grounded in observable on-screen elements?
9. Do all critical steps have fallback paths?
10. Are assumptions documented with mitigations?

---

## Gold Standard Quality Criteria

✨ **A gold-standard VY prompt has:**

1. **Every step** follows locate→confirm→act→verify pattern
2. **Every irreversible action** has explicit user confirmation
3. **Every assumption** has documented risk and mitigation
4. **Every failure mode** has a playbook response
5. **Output is pure YAML** with zero extraneous text
6. **All UI references** are unique and observable
7. **Verification evidence** is concrete and multi-modal
8. **Fallback paths** are actionable and ordered by priority
9. **Policy router classification** is explicit and correct
10. **Self-check validation** passes all questions

---

## Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Can't locate element | Add fallback paths, use search, request screenshot |
| Verification fails | Wait 250ms and retry, check for modals, re-locate element |
| Tool execution error | Verify parameters, try alternative tool, fall back to UI |
| Action not reversible | Set safety_gate to irreversible_requires_confirmation |
| Unclear UI reference | Use unique text labels, add context, specify hierarchy |
| Missing required keys | Check schema_validation.required_keys list |
| Preamble in output | Remove all text before/after YAML, no code fences |

---

## Resources

- **Full Meta Prompt:** `VY-Meta-Prompt.yaml`
- **Knowledge Base:** `knowledge 1.txt`, `knowledge 2.txt`, `knowledge 3.txt`
- **Example Specifications:** `test_promptV3.yaml`, `vy_task1.yaml`
- **Architect Output:** `VY Prompt Architect Output.md`

---

## Summary: The 10 Commandments of VY Prompt Engineering

1. **THOU SHALT** classify all requests via policy_router first
2. **THOU SHALT** use locate→confirm→act→verify for every step
3. **THOU SHALT** gate irreversible actions with explicit user confirmation
4. **THOU SHALT** document all assumptions with risk+mitigation
5. **THOU SHALT** provide fallback paths for critical operations
6. **THOU SHALT** phrase actions as instructions, never completion claims
7. **THOU SHALT** use unique, observable UI identifiers
8. **THOU SHALT** capture evidence for verification and debugging
9. **THOU SHALT** output pure YAML only (no preamble/commentary)
10. **THOU SHALT** validate with schema, UI, safety, and determinism tests

---

**Remember:** *If VY cannot verify it, VY should not execute it.*
