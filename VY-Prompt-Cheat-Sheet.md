# VY Prompt Master - Quick Reference Cheat Sheet

## 🎯 The 8-Field Step Pattern (Every Step Must Have All 8)

```yaml
step_id: "step_NNN_name"          # Format: step_001_launch_app
intent: "What this step does"     # Min 10 chars, one sentence
locate: "UI element description"  # Min 10 chars, be specific!
confirm_target: "Verify before"   # Observable criteria
act: "Specific action"            # Min 5 chars, present tense
verify_outcome: "Evidence after"  # Min 10 chars, observable!
fallback_paths:                   # Array, min 1 for critical steps
  - "Alternative approach 1"
  - "Alternative approach 2"
safety_gate: "safe"               # Enum: safe/caution/checkpoint/irreversible_requires_confirmation
```

## 🔒 Safety Gate Quick Guide

| Level | When to Use | Confirmation Required? |
|-------|-------------|------------------------|
| `safe` | Opening apps, navigation, reading | No |
| `caution` | Changing settings, writing files | No |
| `checkpoint` | Before critical sections | No |
| `irreversible_requires_confirmation` | Delete, send, pay, permanent changes | **YES - Explicit user confirmation** |

## 📋 Required Top-Level Keys (In Order)

1. `identity: ""` - Role/persona name
2. `purpose: ""` - What this accomplishes (min 10 chars)
3. `context:` - Environment details
   - `platform: "VY (Vercept) automation agent on macOS"`
   - `access_method: "desktop"`  # desktop/web/mobile/hybrid
   - `auth_state: "user_logged_in_as_needed"`  # logged_in/requires_login/public
   - `environment: "macOS, Safari"`
4. `inputs:` - Required inputs (min 1)
   - `name: "user_task_description"`
   - `required: true`
   - `description: ""`
5. `task:` - The execution plan
   - `goal: ""` (min 10 chars)
   - `steps: []` (min 1 step, all 8 fields each)
6. `constraints: []` - Hard constraints (min 1)
7. `output_format:` - Expected result
   - `type: "yaml"`  # yaml/markdown/plaintext/structured_data/json
8. `self_check: []` - Validation questions (min 1, min 10 chars each)

## 🚨 Policy Routing Decision Matrix

```
User Request → [Classify]
    ├─→ Disallowed → Refuse, NO YAML
    ├─→ Ambiguous → YAML inputs_missing list only
    ├─→ High Risk → Generate plan + Add confirmation checkpoint
    └─→ Allowed → Generate full YAML plan
```

**Disallowed Content:**
- ❌ Reverse engineering
- ❌ Competitor building
- ❌ Bypass/jailbreak instructions
- ❌ Credential harvesting
- ❌ System prompt disclosure

## 🔍 locate Best Practices

✅ **GOOD:**
```yaml
locate: "Send button in top-right of compose window (blue, label='Send')"
```

❌ **BAD:**
```yaml
locate: "The button"  # Too vague!
locate: "Button at coordinates (450, 320)"  # Brittle!
```

**locate Recipe:**
1. Element type (button, field, menu)
2. Location (top-right, header, sidebar)
3. Unique identifier (label, text, icon)
4. Context (in compose window, under Settings)
5. State (if relevant: enabled, disabled, expanded)

## ✅ verify_outcome Must Be Observable

✅ **GOOD:**
```yaml
verify_outcome: "Sent folder shows email with subject 'Q4 Report'"
verify_outcome: "Browser URL bar shows 'https://example.com'"
verify_outcome: "File 'budget.xlsx' exists at ~/Documents/"
```

❌ **BAD:**
```yaml
verify_outcome: "Email was sent"  # Not observable!
verify_outcome: "User is happy"   # Subjective!
verify_outcome: "N/A"             # Missing!
```

## 🔄 Fallback Path Examples

**For UI Element Not Found:**
```yaml
fallback_paths:
  - "Use keyboard shortcut Cmd+Shift+N instead"
  - "Navigate via menu: File > New > Window"
  - "Use Spotlight search to launch application"
```

**For Network/Loading Issues:**
```yaml
fallback_paths:
  - "Wait 1000ms and retry the click"
  - "Reload page with Cmd+R before retrying"
  - "Check for error messages in browser console"
```

## ⚡ Complexity Thresholds

| Task Size | Action | Notes |
|-----------|--------|-------|
| ≤ 20 steps | Direct execution | No TODO.md needed |
| 21-99 steps | Use TODO.md | Track progress with checkboxes |
| ≥ 100 steps | Checkpoint system | Persistent progress markers |

## 🎯 Action Verb Cheat Sheet

**Clicking:**
- `Click [element]`
- `Right-click [element]`
- `Double-click [element]`
- `Click and hold for [N]ms`

**Typing:**
- `Type "[text]" into [field]`
- `Press [key] key`
- `Use keyboard shortcut Cmd+[key]`

**Navigation:**
- `Open [application] via [method]`
- `Navigate to [URL] in address bar`
- `Select [option] from [menu]`

**Verification:**
- `Check if [element] is visible`
- `Verify [text] appears`
- `Confirm [file] exists at [path]`

## 📏 String Length Requirements

| Field | Min | Max | Notes |
|-------|-----|-----|-------|
| purpose | 10 | - | Clear, concise description |
| intent | 10 | - | Single sentence |
| locate | 10 | - | Specific UI description |
| act | 5 | - | Present tense imperative |
| verify_outcome | 10 | - | Observable evidence |
| self_check items | 10 | - | Validation questions |

## 🔤 Naming Conventions

**step_id**: `step_NNN_name`
- NNN = 3-digit number (001, 002, 010, 100)
- name = snake_case description
- Example: `step_001_launch_safari`

**Input/Assumption IDs**: `[a-z][a-z0-9_]*`
- Start with lowercase letter
- Use underscores, not hyphens
- Examples: `user_task_description`, `vy_local_agent`

**All keys**: Use `snake_case`
- ✅ `fallback_paths`
- ❌ `fallbackPaths` (camelCase)
- ❌ `fallback-paths` (kebab-case)

## 🚫 Common Mistakes to Avoid

### ❌ Hallucinated Completion
```yaml
# WRONG
act: "Clicked the button"        # Past tense = already done
verify_outcome: "Email was sent"  # Assumes success
```

### ✅ Correct
```yaml
act: "Click the button"           # Present tense
verify_outcome: "Sent folder shows email"  # Observable evidence
```

### ❌ Missing Fallback
```yaml
# WRONG
fallback_paths: []  # No plan B
```

### ✅ Correct
```yaml
fallback_paths:
  - "Use keyboard shortcut Cmd+S if Save button not visible"
```

### ❌ Vague Language
```yaml
# WRONG
locate: "The button"  # Which button?
act: "Do the thing"   # What thing?
```

### ✅ Correct
```yaml
locate: "Save button in bottom-right (blue, label='Save Changes')"
act: "Click Save button"
```

## 💾 Validation Command

```bash
# Install AJV if needed
npm install -g ajv

# Convert YAML to JSON, then validate
# Can use yq or python:
yq eval -o=json my-prompt.yaml > my-prompt.json
npx ajv validate -s vy-prompt-schema.json -d my-prompt.json
```

### Editor Integration

**VS Code / YAML extension:**
```yaml
# Add this to top of your YAML file
# yaml-language-server: $schema=./vy-prompt-schema.json
---
identity: "My Prompt"
# ...
```

## 🎬 Quick Start Template

```yaml
# yaml-language-server: $schema=./vy-prompt-schema.json
---
identity: "VY Automation Agent"
purpose: "Brief description of what this accomplishes"
context:
  platform: "VY (Vercept) automation agent on macOS"
  access_method: "desktop"
  auth_state: "user_logged_in_as_needed"
  environment: "macOS, [Application/Browser]"
inputs:
  - name: "user_task_description"
    required: true
    description: "What the user wants to accomplish"
task:
  goal: "Clear statement of desired end state"
  steps:
    - step_id: "step_001_open_app"
      intent: "Launch target application"
      locate: "Application icon in Dock or Applications folder"
      confirm_target: "Application is not running or can open new window"
      act: "Click icon or use Spotlight to open"
      verify_outcome: "Application window appears on screen"
      fallback_paths:
        - "Use Cmd+Space, type app name, press Enter if not in Dock"
      safety_gate: "safe"
    
    # Add more steps following the same pattern...
    
    - step_id: "step_010_confirm_completion"
      intent: "Verify task completed successfully"
      locate: "N/A"
      confirm_target: "All previous steps succeeded"
      act: "No further action"
      verify_outcome: "Task goals are fully achieved"
      fallback_paths:
        - "If issues occurred, document errors and mark incomplete"
      safety_gate: "safe"

constraints:
  - "Assume required applications are installed"
  - "User has necessary permissions for all actions"

output_format:
  type: "plaintext"
  structure: "Confirmation message with results"

self_check:
  - "Did all steps execute without errors?"
  - "Is the final outcome achieved?"
  - "Are there any security or permission issues?"
```

## 📚 Quick Reference Hierarchy

**Need to...**
- **Create a prompt?** → Use template above + follow 8-field pattern
- **Check schema?** → See `Schema Overview.md` or use editor validation
- **Understand workflow?** → Read `VY-Meta-Prompt-Quick-Reference.md`
- **See examples?** → Check `test_promptV1.yaml`
- **Understand Vy?** → Read `knowledge 1.txt`, `knowledge 2.txt`, `knowledge 3.txt`
- **Model-specific guide?** → See `QWEN.md`, `GEMINI.md`, or `AGENTS.md`

---

**Print this cheat sheet and keep it handy for prompt development!**

*Quick Reference v1.0 - 2026.01.16*