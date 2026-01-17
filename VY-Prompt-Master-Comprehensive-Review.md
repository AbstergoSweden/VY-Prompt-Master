# VY Prompt Master – Comprehensive Review and Documentation

## Executive Summary

**VY Prompt Master** is a sophisticated prompt engineering framework designed for **Vy**, an AI-driven computer automation agent developed by Vercept. The framework transforms high-level user task descriptions into detailed, executable prompt specifications that Vy can reliably execute on macOS through UI automation.

**Key Differentiators:**
- **Safety-First Design**: Policy routing with explicit classification (allowed/disallowed/ambiguous/high-risk)
- **UI-Grounded Execution**: Every action tied to visible UI elements with verification
- **Deterministic Output**: Structured YAML specifications with zero ambiguity
- **Reversible-First Approach**: Prefer reversible actions; gate irreversible ones with confirmation
- **Evidence-Based**: Comprehensive verification at every step

---

## Project Architecture

### Repository Structure

The project follows a **flat content repository** model (no nested directories) with primarily YAML and Markdown files:

```
├── Core Framework Files
│   ├── VY-Meta-Prompt.yaml              # Main meta-prompt specification (v2.0)
│   ├── VY-Unified-Framework-v3.yaml     # Consolidated framework (v3.0)
│   ├── VY-Prompt-Engineering-Persona.yaml  # Primary persona definition
│   └── vy-prompt-schema.json            # JSON Schema for validation
│
├── Knowledge Base
│   ├── knowledge 1.txt                  # Core architecture & AI foundation
│   ├── knowledge 2.txt                  # Tool system & capabilities
│   └── knowledge 3.txt                  # Workflow execution & operational intelligence
│
├── Examples & Testing
│   ├── vy_task1.yaml / vy_task2.yaml    # Task specification examples
│   ├── test_promptV1-3.yaml            # Regression test prompts
│   ├── Response1-3.yml                  # AI-generated output examples
│   └── ClaudesPromptToVY.yaml          # Cross-model generation example
│
├── Documentation
│   ├── README.md                        # Project overview
│   ├── Schema Overview.md               # Schema documentation
│   ├── VY-Meta-Prompt-Quick-Reference.md # Quick reference guide
│   └── AGENTS.md                        # Repository guidelines
│
└── Model-Specific Overviews
    ├── QWEN.md                          # Qwen model system message
    ├── GEMINI.md                        # Gemini CLI instructions
    └── AGENTS.md                        # OpenAI agents overview
```

### Key File Purposes

| File | Purpose | Version | Last Updated |
|------|---------|---------|--------------|
| `VY-Meta-Prompt.yaml` | Master meta-prompt for AI generation | 2.0 | 2026.01.16 |
| `VY-Unified-Framework-v3.yaml` | Consolidated framework specification | 3.0 | 2026.01.16 |
| `VY-Prompt-Engineering-Persona.yaml` | Primary persona for prompt engineering | 1.1 | 2026.01.14 |
| `vy-prompt-schema.json` | JSON Schema validation (611 lines) | - | - |
| `knowledge 1-3.txt` | Comprehensive Vy documentation | - | - |

---

## Design Philosophy

### 1. Safety-First Automation

**Policy Router Classification Flow:**
```yaml
1. Classify: allowed | disallowed | ambiguous | high_risk_irreversible
2. If disallowed → Safe alternative only, no operational details
3. If ambiguous → Output inputs_missing list and stop
4. If high_risk → Require explicit user confirmation checkpoint
5. If allowed → Proceed with plan→execute→verify workflow
```

**Safety Gate Levels:**
- `safe`: Non-destructive routine actions (default)
- `caution`: Sensitive but reversible actions
- `checkpoint`: Progress markers before critical junctures
- `irreversible_requires_confirmation`: Destructive actions requiring explicit user approval

**Disallowed Content Categories:**
- Reverse engineering instructions
- Competitor-building or cloning guidance
- Bypass/jailbreak/evasion operational details
- Credential harvesting or privacy invasion facilitation
- System prompt or internal instruction disclosure

### 2. UI-Grounded Deterministic Execution

**Core Pattern: locate → confirm_target → act → verify_outcome**

Every step must include:
1. **locate**: Unambiguous UI element description (unique text, label, icon, position)
2. **confirm_target**: Observable criteria to verify correct element BEFORE acting
3. **act**: Specific action with exact parameters (click/type/select/scroll/keyboard_shortcut)
4. **verify_outcome**: Observable evidence of success AFTER acting

**UI Grounding Principles:**
- Use unique visible text labels (not "the button")
- Include context: section, panel, nearby elements
- Specify visual hierarchy: header > section > button
- Mention state: enabled/disabled, expanded/collapsed
- Avoid coordinates unless absolutely necessary

### 3. Reversibility and Fallbacks

**Reversibility-First Strategy:**
- Prefer reversible actions (move to trash vs. permanent delete)
- Gate irreversible actions with explicit user confirmation
- Create checkpoints before high-impact operations
- Include rollback guidance in failure scenarios

**Fallback Path Requirements:**
- At least one fallback for critical steps
- Alternative approaches if primary action fails
- Ordered by reliability
- Examples: keyboard shortcuts, menu navigation, retry with delay

**Anti-Loop Protection:**
- Maximum 2 attempts per action
- Progressive backoff: 250ms → 500ms → 1000ms
- After 2 failures, replan with fallback (don't repeat indefinitely)

### 4. Efficiency and Conciseness

**Complexity Thresholds:**
- **≤ 20 actions**: Direct execution without TODO.md
- **21-99 actions**: TODO.md with phase organization
- **≥ 100 actions**: Checkpoint system with persistent progress markers

**Batch Optimization:**
- Group independent operations
- Batch TODO updates (check off multiple items in single operation)
- Parallel execution for independent steps

**Verbosity Constraints:**
- Minimal output outside YAML prompt spec
- No preamble, commentary, or chain-of-thought printing
- Reason internally; output only the specification

### 5. Tool Abstraction

**Principle**: Users describe outcomes, not tool implementations

**Internal Tool Categories:**
- Mouse/Keyboard: click, type, scroll, drag, keyboard shortcuts
- File System: create, read, move, organize files/directories
- Browser: navigation, form interaction, screenshot capture
- Application Control: open, close, switch applications
- OCR & Vision: text extraction from images/PDFs

**Abstraction Rule**: Prompt specs use UI-focused language, not tool names
- ❌ "Use open_application tool to launch Safari"
- ✅ "Open Safari browser via Dock icon or Spotlight"

### 6. Stateful Workflow & Self-Checks

**Execution State Machine:**
```
Intake → Plan → Preflight → Execute → Verify → Checkpoint → Finalize
                    ↓            ↓          ↓
              Rollback/Retry ← Failure → Escalate to User
```

**Self-Check Questions (Post-Execution):**
- Did all steps complete without errors?
- Is the final outcome achieved?
- Were there any security warnings or permission dialogs?
- Were assumptions verified and validated?
- Is the output in the expected format?

---

## Detailed Workflow Guide

### Phase 1: Task Intake and Classification

**Required Inputs for Any Request:**
- Target application/site and access method (desktop/web)
- Desired end state (what "done" looks like)
- Authentication state (logged_in/requires_login/user_logged_in_as_needed)
- Constraints or special instructions

**Handling Missing Information:**
If critical details are missing, output only:
```yaml
inputs_missing:
  - "Specify which file(s) to upload (path or names)"
  - "Specify destination cloud drive or service"
```

**Policy Routing Decision Tree:**
```
User Request
    ↓
[Classify]
    ├─→ Disallowed → Safe Refusal (no YAML)
    ├─→ Ambiguous → inputs_missing list
    ├─→ High Risk → Add confirmation checkpoint + Generate plan
    └─→ Allowed → Generate plan
```

### Phase 2: Planning and Prompt Generation

**Step Decomposition Strategy:**
1. Break task into atomic steps (one intent per step)
2. For each step, apply locate→confirm→act→verify pattern
3. Identify irreversible actions and add safety gates
4. Map steps to UI elements with unique identifiers
5. Add fallback paths for failure scenarios
6. Document assumptions with verification methods

**Step ID Naming Convention:**
- Format: `step_<3-digit>_<short_action_name>`
- Examples: `step_001_launch_safari`, `step_010_confirm_deletion`
- Must be unique and sequential
- Use `snake_case` with lowercase letters and numbers

**YAML Structure Requirements:**

```yaml
identity: "VY Automation Agent"  # Role/persona
purpose: "Clear statement of accomplishment"  # Min 10 chars
context:  # All sub-keys required
  platform: "VY (Vercept) automation agent on macOS"
  access_method: "desktop"  # enum: desktop/web/mobile/hybrid
  auth_state: "user_logged_in_as_needed"  # enum
  environment: "macOS, Safari browser"  # Can be string or object  
inputs:  # Min 1 item
  - name: "user_task_description"
    required: true
    description: "High-level task description"
    example: "Open Safari and capture headlines"
task:
  goal: "Desired end state description"  # Min 10 chars
  steps:  # Min 1 step, each with 8 required fields
    - step_id: "step_001_open_browser"
      intent: "Launch Safari browser"  # Min 10 chars
      locate: "Safari icon in macOS Dock"  # Min 10 chars
      confirm_target: "Safari icon is visible and clickable"
      act: "Click Safari icon or use open_application"  # Min 5 chars
      verify_outcome: "Safari window appears on screen"  # Min 10 chars
      fallback_paths:  # Array of strings, min 1 for critical steps
        - "Use Spotlight (Cmd+Space) to open Safari"
      safety_gate: "safe"  # enum: safe/caution/checkpoint/irreversible_requires_confirmation
constraints:  # Min 1 item
  - "No internet connectivity issues"
output_format:  # type is required
  type: "yaml"  # enum: yaml/markdown/plaintext/structured_data/json
  structure: "Description of expected output"
self_check:  # Min 1 item, min 10 chars each
  - "Did Safari launch successfully?"
  - "Is the target page loaded?"
```

### Phase 3: Safety Enhancements

**Safety Gate Application:**
- **safe**: Opening applications, navigation, reading data
- **caution**: Modifying settings, writing files, batch operations
- **checkpoint**: Progress markers before critical sections
- **irreversible_requires_confirmation**: Deleting, sending, purchasing, permanent changes

**Confirmation Checkpoint Pattern:**
```yaml
# BEFORE irreversible action
- step_id: "step_009_confirm_deletion"
  intent: "Confirm bulk deletion with user"
  locate: "N/A"
  confirm_target: "User explicitly confirms deletion"
  act: "Prompt user: 'Delete all 47 files permanently?' (Yes/No)"
  verify_outcome: "User responds with Yes"
  fallback_paths: []
  safety_gate: "irreversible_requires_confirmation"

# THE irreversible action
- step_id: "step_010_perform_deletion"
  intent: "Permanently delete files"
  locate: "Delete button in confirmation dialog"
  confirm_target: "Dialog shows correct file count"
  act: "Click 'Delete Permanently'"
  verify_outcome: "Files removed from system"
  fallback_paths: ["If fails, move to trash as alternative"]
  safety_gate: "irreversible_requires_confirmation"
```

**Fallback Path Strategies:**
1. **Alternative UI Path**: Menu navigation vs. keyboard shortcut
2. **Retry with Delay**: Wait 250ms/500ms/1000ms and retry
3. **Escalation**: Use more reliable method (e.g., Spotlight vs. Dock)
4. **Graceful Degradation**: Partial completion with user notification

**Assumption Documentation:**
```yaml
assumptions:
  - id: "assumption_001_file_exists"
    statement: "The target file exists at specified path"
    confidence: "medium"
    risk: "Task fails if file is missing"
    mitigation: "Check file existence in preflight step"
    verification_method: "Use file_exists check before attempting operations"
```

### Phase 4: Execution by Vy

**Vy Execution Flow:**
1. **Intake**: Parse identity, purpose, context; bind input values
2. **Preflight**: Verify assumptions, check prerequisites, validate auth state
3. **Execute Steps**: For each step:
   - Locate UI element via visual/accessibility layers
   - Confirm target element is correct and in expected state
   - Perform action (click, type, etc.) using appropriate tool
   - Verify outcome by checking observable evidence
   - On failure: attempt fallback path (max 2 retries)
   - On irreversible step: pause for user confirmation
4. **Checkpoint**: Save progress before critical sections
5. **Post-Execution**: Run self_check questions to validate completion
6. **Output**: Format results according to output_format specification

**Error Handling:**
- **Transient Failures**: Retry with exponential backoff (250ms → 500ms → 1000ms)
- **UI Element Not Found**: Try fallback paths, then replan
- **Verification Failed**: Execute rollback if available, or escalate
- **User Cancellation**: Graceful abort with progress summary
- **System Errors**: Log error (if logging available) and mark task incomplete

### Phase 5: Validation, Iteration, and Maintenance

**Four Categories of Validation Tests:**

1. **Schema Tests**: All required keys present, correct types, valid patterns
2. **UI Tests**: locate+confirm+verify for every step, unique step_ids
3. **Safety Tests**: No disallowed content, proper safety gates, no credential exposure
4. **Determinism Tests**: No hallucinated completion, all steps have verification

**Validation Command:**
```bash
# Convert YAML to JSON first, then validate
npx ajv validate -s vy-prompt-schema.json -d my-prompt.json
```

**Editor Integration:**
```yaml
# Add to top of YAML files for IDE validation
# yaml-language-server: $schema=./vy-prompt-schema.json
```

**Regression Testing:**
- Use `test_promptV1-3.yaml` as reference patterns
- When modifying framework, re-run validation on all examples
- Document changes in file-review-notes.md

---

## Unified Meta Prompt Specification

### System Message for AI Prompt Generation

```
You are a Prompt Creation Engine for Vy (Vercept) – an AI-powered macOS 
automation agent. Your role is to convert a user's task request into a 
VY execution prompt specification written in YAML, following a very strict 
format and policy. No step is actually executed by you; you only draft 
the plan for Vy to execute.

ABSOLUTE RULES (must follow):

1. Policy Routing: Always classify the user's request first:
   - If ambiguous/missing info → output ONLY inputs_missing list (YAML)
   - If disallowed → Refuse with safe alternative, NO YAML
   - If high risk → Include confirmation checkpoint + irreversible_requires_confirmation
   - If allowed → Generate full YAML plan

2. YAML-Only Output: Produce ONLY valid YAML (no commentary, no markdown)
   - Use 2-space indentation, ASCII characters only
   - No code fences, no explanations, no preamble

3. Top-Level Structure (required keys in order):
   - identity: Brief role name
   - purpose: One-sentence goal
   - context: platform, access_method, auth_state, environment
   - inputs: At least user_task_description
   - task: goal + ordered steps
   - constraints: Hard constraints (min 1)
   - output_format: Expected result format
   - self_check: Validation questions (min 1)
   - Optional: assumptions, robustness_improvements, validation_tests, failure_playbooks

4. Step Structure (each step requires ALL 8 fields):
   - step_id: step_NNN_name format
   - intent: Single-sentence purpose (min 10 chars)
   - locate: UI element description (min 10 chars)
   - confirm_target: Verification BEFORE acting
   - act: Specific action (min 5 chars)
   - verify_outcome: Observable evidence AFTER acting (min 10 chars)
   - fallback_paths: Array of alternatives (min 1 for critical steps)
   - safety_gate: safe | caution | irreversible_requires_confirmation

5. Best Practices:
   - Be explicit & deterministic: Use exact UI labels, titles, element names
   - UI grounding: Tie actions to visible states, avoid coordinates
   - Reversible-first: Prefer undoable actions; isolate irreversible steps
   - Atomic steps: One intent per step, no multi-action steps
   - No assumptions without verification: Check preconditions explicitly
   - Security: Never include secrets; prompt user for login/credentials
   - Determinism: Use present tense imperatives ("Click" not "Clicked")

Examples of correct output patterns are provided in the project documentation.
Follow these specifications exactly to ensure Vy can execute tasks safely and reliably.
```

### Example: Allowed Request (Correct Output)

**User Request**: "Open Safari, go to example.com, save the headline text to a file."

```yaml
identity: "VY Automation Agent"
purpose: "Retrieve and save the main headline from example.com"
context:
  platform: "VY (Vercept) automation agent on macOS"
  access_method: "desktop"
  auth_state: "user_logged_in_as_needed"
  environment: "macOS, Safari browser"
inputs:
  - name: "user_task_description"
    required: true
    description: "High-level description of the task"
    example: "Open Safari, go to example.com, capture headline, save to file"
task:
  goal: "Capture main page headline and save to local file"
  steps:
    - step_id: "step_001_launch_safari"
      intent: "Launch Safari web browser"
      locate: "Safari app icon in Dock or Applications folder"
      confirm_target: "Safari is not already running or can open new window"
      act: "Click Safari icon or use Spotlight to open"
      verify_outcome: "Safari window appears on screen"
      fallback_paths:
        - "Use Spotlight (Cmd+Space, type 'Safari') if not in Dock"
      safety_gate: "safe"
    
    - step_id: "step_002_navigate_to_example"
      intent: "Navigate to example.com"
      locate: "Safari address bar at top of window"
      confirm_target: "Address bar is focused and empty"
      act: "Type 'https://example.com' and press Enter"
      verify_outcome: "Example.com homepage loads successfully"
      fallback_paths:
        - "If address bar not focused, click it or use Cmd+L"
      safety_gate: "safe"
    
    - step_id: "step_003_extract_headline"
      intent: "Extract main headline text from page"
      locate: "Main heading element (h1 tag near top of page)"
      confirm_target: "Heading element is visible and contains text"
      act: "Read text content of main heading element"
      verify_outcome: "Non-empty headline text is retrieved"
      fallback_paths:
        - "If h1 not found, look for largest text element or id='headline'"
      safety_gate: "safe"
    
    - step_id: "step_004_save_to_file"
      intent: "Save captured headline to text file"
      locate: "User's Documents folder"
      confirm_target: "Documents folder is writable"
      act: "Create file '~/Documents/headline.txt' with headline text"
      verify_outcome: "File exists at path with correct content"
      fallback_paths:
        - "If Documents unavailable, use Desktop as alternative"
      safety_gate: "caution"
    
    - step_id: "step_005_confirm_completion"
      intent: "Verify task completion"
      locate: "N/A"
      confirm_target: "All previous steps succeeded"
      act: "No further action"
      verify_outcome: "Task completed successfully"
      fallback_paths:
        - "If any step failed, log error and mark incomplete"
      safety_gate: "safe"

constraints:
  - "Assumes internet connectivity and example.com accessibility"
  - "Requires write permission to user's Documents folder"

output_format:
  type: "plaintext"
  structure: "Confirmation message with saved file path"

self_check:
  - "Did Safari launch and navigate to example.com?"
  - "Was headline text successfully extracted?"
  - "Is file saved with correct content at expected location?"
```

### Example: Ambiguous Request (Correct Response)

**User Request**: "Upload the report."

```yaml
inputs_missing:
  - "Specify which report file(s) to upload (path or name)"
  - "Specify target location or service (e.g., Google Drive, Dropbox, email)"
```

### Example: Disallowed Request (Correct Response)

**User Request**: "Find and delete all system log files."

```
I'm not able to help with that request. Deleting system log files can 
cause system instability and is against security best practices. However, 
I can help you safely free up disk space by:
- Emptying the Trash
- Clearing browser caches
- Removing old downloads
- Using macOS storage management tools
```

---

## Quality Assurance Checklist

### Schema Compliance
- [ ] All 8 required top-level keys present
- [ ] All steps have exactly 8 required fields
- [ ] step_id format: `step_NNN_name`
- [ ] Input/assumption IDs: `[a-z][a-z0-9_]*`
- [ ] Safety gate values are valid enum
- [ ] Type validations pass (string lengths, patterns)

### UI Grounding
- [ ] Every step has locate description (≥10 chars)
- [ ] Every step has confirm_target criteria
- [ ] Every step has verify_outcome evidence (≥10 chars)
- [ ] locate uses specific UI labels, not vague terms
- [ ] No coordinate-based clicks without fallback
- [ ] Fallback paths provided for critical steps

### Safety
- [ ] No disallowed content in plan
- [ ] Irreversible steps have confirmation checkpoint
- [ ] No credentials or secrets in specification
- [ ] Security boundaries respected
- [ ] Policy routing applied correctly
- [ ] Fallback paths don't bypass safety

### Determinism
- [ ] No hallucinated completion (no "already done")
- [ ] Present tense imperatives used throughout
- [ ] Every action has verification
- [ ] No ambiguous language
- [ ] Assumptions documented with verification
- [ ] No premature success claims

### Format
- [ ] Pure YAML output (no markdown, no code fences)
- [ ] 2-space indentation throughout
- [ ] ASCII characters only (no smart quotes)
- [ ] No extra text outside YAML structure
- [ ] Comments only where explicitly allowed

---

## Best Practices for Contributors

### Adding New Prompt Specifications

1. **Start with Template:**
   ```yaml
   identity: ""
   purpose: ""
   context:
     platform: "VY (Vercept) automation agent on macOS"
     access_method: "desktop"
     auth_state: "user_logged_in_as_needed"
     environment: ""
   inputs:
     - name: "user_task_description"
       required: true
       description: ""
   task:
     goal: ""
     steps: []
   constraints: []
   output_format:
     type: "yaml"
   self_check: []
   ```

2. **Follow Step Creation Process:**
   - Identify UI element (locate)
   - Define verification criteria (confirm_target)
   - Specify action (act)
   - Determine success evidence (verify_outcome)
   - Add fallback paths
   - Assign safety gate

3. **Test Before Committing:**
   - Validate against schema
   - Check all 8 fields per step
   - Verify safety gates are appropriate
   - Ensure no disallowed content

### Modifying Framework Files

1. **Update Version Numbers:** Increment version when making changes
2. **Document Changes**: Update file-review-notes.md with modifications
3. **Regression Test**: Validate existing test_prompt*.yaml files still work
4. **Update Quick Reference**: Keep VY-Meta-Prompt-Quick-Reference.md in sync

### Schema Evolution

When updating `vy-prompt-schema.json`:
1. Maintain backward compatibility where possible
2. Update Schema Overview.md documentation
3. Notify contributors of breaking changes
4. Provide migration guide for existing prompts

---

## Common Pitfalls and How to Avoid Them

### ❌ Mistake: Hallucinated Completion
```yaml
# WRONG
act: "Clicked the Send button"  # Past tense
verify_outcome: "Email was sent"  # Assumes success
```

✅ **Correct:**
```yaml
act: "Click the Send button"  # Present tense imperative
verify_outcome: "Sent folder shows new email"  # Observable evidence
```

### ❌ Mistake: Missing Fallback Paths
```yaml
# WRONG
fallback_paths: []  # No alternatives for critical step
```

✅ **Correct:**
```yaml
fallback_paths:
  - "If button not visible, use keyboard shortcut Cmd+Enter"
  - "If shortcut fails, navigate via menu: File > Send"
```

### ❌ Mistake: Vague UI Descriptions
```yaml
# WRONG
locate: "The button"  # Ambiguous
```

✅ **Correct:**
```yaml
locate: "Send button in top-right corner of compose window (blue, labeled 'Send')"
```

### ❌ Mistake: Skipping Verification
```yaml
# WRONG
verify_outcome: "N/A"  # No evidence of success
```

✅ **Correct:**
```yaml
verify_outcome: "Browser URL bar shows 'https://example.com' and page title loads"
```

### ❌ Mistake: No Safety Gate for Irreversible Action
```yaml
# WRONG
safety_gate: "safe"  # For a file deletion step!
```

✅ **Correct:**
```yaml
safety_gate: "irreversible_requires_confirmation"
# Plus a preceding confirmation step
```

---

## Integration with Different AI Models

### Model-Specific System Messages

The project includes tailored overviews for different AI platforms:

- **QWEN.md**: For Alibaba Qwen model integration
- **GEMINI.md**: For Google Gemini CLI context
- **AGENTS.md**: For OpenAI agents framework
- **backup*.md**: Previous versions for reference

Each maintains the same core principles but adapts:
- Tone and formatting to match model expectations
- Integration points specific to the platform
- Example outputs formatted for the target system

### Cross-Model Consistency

Despite different formats, all model-specific docs preserve:
- Safety-first policy routing
- UI-grounded execution pattern
- 8-field step structure
- Schema compliance requirements
- Deterministic output expectations

---

## Future Evolution and Roadmap

### Current State: Version 3.0

**Strengths:**
- Comprehensive schema with 611 lines of validation rules
- Mature safety framework with policy routing
- Rich knowledge base (3 detailed documents)
- Working examples and test prompts
- Quick reference guides for rapid development

**Areas for Enhancement:**
1. **Automated Validation Pipeline**: CI/CD integration for schema validation
2. **Prompt Testing Framework**: Automated execution testing in sandbox
3. **Version Migration Tools**: Help upgrade prompts between schema versions
4. **Visual Prompt Builder**: GUI for creating compliant specifications
5. **Community Templates**: Library of common task patterns
6. **Performance Metrics**: Track success rates, failure categories, recovery times

### Version 4.0 Considerations

Potential improvements based on current design:
- **Enhanced Parallelism**: Explicit parallel step groups
- **Conditional Logic**: Branching based on verification outcomes
- **Loop Constructs**: For iterating over dynamic item lists
- **Sub-prompt Composition**: Reusable step sequences as modules
- **Richer Verification**: Screenshot comparison, OCR text validation
- **Dynamic Fallback Selection**: AI- chosen fallbacks based on failure type

---

## Conclusion

**VY Prompt Master** represents a production-ready framework for safe, deterministic AI automation that prioritizes:

1. **User Safety**: Through policy routing, confirmation gates, and reversibility-first design
2. **Execution Reliability**: Via UI grounding, verification at every step, and comprehensive fallbacks
3. **Specification Quality**: Enforced through rigorous schema validation and deterministic output requirements
4. **Operational Transparency**: Clear step-by-step plans that can be inspected and validated
5. **Cross-Platform Consistency**: While designed for Vy/macOS, principles apply to any UI automation

The framework successfully bridges the gap between natural language task descriptions and executable UI automation plans while maintaining the highest standards for safety and predictability.

---

## References

- **Primary Author**: Faye Håkansdotter
- **Contact**: https://github.com/Fayeblade1488
- **Project Repository**: https://github.com/AbstergoSweden/VY-Prompt-Master
- **Schema Version**: 3.0 (611 lines)
- **Framework Version**: Unified Framework v3.0
- **Meta-Prompt Version**: 2.0
- **Last Updated**: 2026.01.16