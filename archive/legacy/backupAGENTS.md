# VY Prompt Engineering Project

## Project Overview

This project is dedicated to developing master-level prompt engineering specifications for VY (Vercept), an AI-powered computer automation agent. The project creates sophisticated YAML-based prompt specifications that enable VY to execute UI automation tasks safely, deterministically, and robustly on macOS systems.

**Key Characteristics:**
- **Focus**: Transforming benign user tasks into developer-ready, VY-optimized execution prompt specifications
- **Methodology**: UI-grounded automation with evidence-based verification and reversible-first actions
- **Safety Model**: Defensive security with policy routing, safety gates, and explicit user confirmations for irreversible actions
- **Complexity Threshold**: Simple tasks (<20 actions) execute directly; complex tasks (>20 actions) create TODO.md checkpoint files

## Technology Stack

- **Primary Format**: YAML (for prompt specifications and personas)
- **Documentation**: Markdown, plain text
- **Target Platform**: VY (Vercept) automation agent on macOS
- **Architecture**: UI-grounded automation with evidence-based verification
- **AI Integration**: Gemini API (API keys present in `.env`)

## Project Structure Analysis

### Core Persona Files (535+ lines each)

**`VY-Prompt-Engineering-Persona.yaml`** - Master persona specification (v1.1)
- Comprehensive 536-line YAML specification defining the complete prompt engineering persona
- Includes policy router for safety classification (allowed/disallowed/ambiguous/high_risk_irreversible)
- Defines execution model with 8-state state machine (intake → plan → execute_step → verify_step → checkpoint → rollback_or_retry → finalize)
- Contains UI action primitives with 8 required fields per step: step_id, intent, locate, confirm_target, act, verify_outcome, fallback_paths, safety_gate
- Features assumption_ledger and evidence_ledger frameworks for tracking unknowns and verification evidence
- Includes comprehensive validation tests (schema, UI, safety, determinism)
- Documents failure playbooks for ui_not_found, unexpected_modal, auth_blocked scenarios
- Contains advanced patterns for multi-phase workflows, conditional branching, and error recovery

**`VY-Prompt-Engineering-Persona2.yaml`** - Alternative persona configuration (identical to master, alternative version)
**`VY-Prompt-Engineering-Perona1.yaml`** - Variant persona implementation (254 lines, alternative structure)

### Knowledge Base Documentation

**`knowledge 1.txt`** (87 lines) - VY Core Architecture and AI Foundation
- Documents VY's foundational identity and purpose as an AI-powered computer automation agent
- Explains AI processing and prompt handling architecture with complexity-based decision tree
- Details state management with TODO.md files for tasks exceeding 20 actions
- Describes security architecture with conversation termination on malicious intent detection
- Covers macOS platform integration, system awareness, and environmental context
- Documents error handling with anti-loop protection (max 2 attempts per action)
- Explains continuous learning and expert system integration capabilities

**`knowledge 2.txt`** (594 lines) - VY Tool System and Interaction Mechanisms
- Comprehensive documentation of Vy's tool system architecture and abstraction principles
- Details mouse and keyboard interaction capabilities with 15+ operation types
- Documents scrolling intelligence with adaptive algorithms and anti-failure mechanisms
- Covers file system operations with Finder integration for native macOS support
- Explains text processing capabilities including string replacement and manipulation
- Describes screenshot and vision capabilities for UI element identification
- Documents web automation tools for browser control and web scraping
- Covers specialized tools for calendar interaction, PDF analysis, memory management, and expert creation

**`knowledge 3.txt`** (538 lines) - VY Workflow Execution and Operational Intelligence
- Documents workflow planning strategies with 20-action threshold for TODO.md creation
- Explains form interaction protocols including critical rule: always erase pre-existing text before typing
- Details calendar and date input handling with multi-step visual selection protocols
- Covers browser-specific knowledge including URL pattern navigation (github.com/new, direct Twitter/X search URLs)
- Documents application-specific behaviors for native macOS applications
- Explains communication style philosophy: extreme conciseness, no tool name mentions
- Details information persistence through memory system with batching optimizations
- Covers expert system creation and continuous learning from complex tasks

### Task Specifications

**`vy_task1.yaml`** (98 lines) - Core Task Specification for Persona Creation
- Defines goal: Crafting master-level prompt-engineering persona for VY
- Specifies allowed domains: prompt engineering, UX automation, benign persuasion, defensive security analysis
- Documents target platform assumptions and unknowns
- Defines output contract: pure YAML only, no commentary or code fences
- Includes hard constraints for verbosity, interaction, VY-specific requirements, and factuality
- Specifies ToS boundaries and safety boundaries with bypass/jailbreak prohibition
- Contains prompt generator task definition and prompt_spec_schema
- Documents prompting playbook with Plan→Execute→Verify, UI grounding, and safety gating

**`vy_task2.yaml`** (279 lines) - Extended Task with Desktop Placement Requirements
- Enhanced specification including desktop placement coordinates and positioning
- Additional requirements for window management and multi-monitor support
- Extended error handling and recovery mechanisms
- More detailed verification and rollback procedures

### Test Prompts (Development Examples)

**`test_promptV1.yaml`** (140 lines) - Code Librarian and System Organizer Persona
- Practical implementation example demonstrating VY prompt structure
- Shows proper UI grounding patterns and evidence-based verification
- Includes concrete examples of assumption_ledger entries
- Demonstrates failure playbook implementation
- Shows proper output_format specification with type, structure, and evidence_requirements

**`test_promptV2yaml.yaml`** (130 lines) - Version 2 Test Specification
- Refined structure with improved robustness_improvements section
- Enhanced validation_tests with specific pass/fail criteria
- Demonstrates multi-phase workflow patterns
- Shows improved fallback path cascading

**`test_promptV3.yaml`** (375 lines) - Enhanced Version 3 Test Specification
- Comprehensive example with advanced patterns and edge case handling
- Detailed documentation of complex multi-step workflows
- Extensive validation_tests covering schema, UI, safety, and determinism
- Demonstrates conditional branching patterns and state management
- Shows expert system creation and integration patterns

### Response Documentation

**`Ressponse1.yml`** - Initial response documentation (110 lines)
- Contains initial prompt specifications and early design decisions
- Documents baseline response patterns and structure validation
- Shows early UI grounding and verification implementations

**`Response2.yml`** - Error handling and feedback documentation (211 lines)
- Comprehensive error handling patterns and recovery procedures
- Documents incremental improvement iterations based on feedback
- Shows refinement of validation tests and safety checks
- Demonstrates evolution of fallback path strategies

**`Response3.yml`** - Additional response patterns (43 lines)
- Supplementary response documentation for edge cases
- Documents specialized handling for complex scenarios
- Shows pattern extraction from unsafe content for defensive analysis

**`VY Prompt Architect Output.md`** (650 lines) - Comprehensive Architect Output
- Complete end-to-end prompt architecture documentation
- Generated examples and implementation patterns
- Detailed workflow analysis and optimization recommendations
- Comprehensive validation results and quality gates assessment

### Configuration Files

**`.env`** - Environment configuration (3 lines)
```
NANOBANANA_GEMINI_API_KEY=AIzaSyBylAD3qYAg1ccGfGgQ1G7Ayb4ZGq85OQ0
GEMINI_API_KEY=AIzaSyBylAD3qYAg1ccGfGgQ1G7Ayb4ZGq85OQ0
GOOGLE_API_KEY=AIzaSyBylAD3qYAg1ccGfGgQ1G7Ayb4ZGq85OQ0
```
- **Security Note**: API keys are hardcoded in plaintext - this is a critical security concern for production deployment
- All three API keys use identical values for different vendor naming conventions

## Key Architecture Principles

### UI-Grounded Automation Pattern
**Locate → Confirm → Act → Verify** 

Every UI interaction follows this strict pattern:
1. **Locate**: Use unique visible text, labels, icons, or stable layout anchors
2. **Confirm**: Verify correct element before acting with explicit observable criteria
3. **Act**: Execute specific action (click/type/select/scroll) with platform-specific conventions
4. **Verify**: Check observable evidence of success (changed text, URL, toast, new panel)

**Anti-Coordinate Principle**: Avoid brittle coordinates unless absolutely necessary; if used, include resolution/window assumptions and provide disambiguation strategies.

### Safety and Security Architecture

**Reversible-First Design**: Prefer reversible actions; irreversible actions (delete/send/pay/post) require explicit user confirmation with safety_gate: irreversible_requires_confirmation

**Progressive Safety Gates**:
- **safe**: Standard UI interactions with easy reversal
- **caution**: Actions with moderate consequences, checkpoint recommended
- **irreversible_requires_confirmation**: Explicit user confirmation required before execution

**Anti-Loop Protection**: Maximum 2 attempts per action, then replan with fallback paths or user intervention

**Policy Router Classification**:
- **allowed**: Proceed with plan→execute→verify
- **disallowed**: Emit safe alternative only, no operational details
- **ambiguous**: Request inputs_missing and stop
- **high_risk_irreversible**: Require user confirmation checkpoint

**Security Boundaries**:
- No bypass/jailbreak/evasion instructions
- No reverse engineering or competitor-building instructions
- No credential harvesting or privacy invasion operations
- Conversation termination on malicious intent detection
- High-level pattern extraction only from unsafe content (no operational detail)

### State Management Architecture

**TODO.md Based Workflow**: For complex tasks (>20 actions), VY creates TODO.md with structured phases:
- Phase headers with checkbox items for steps
- Verification steps and phases included
- Final verification phase confirms completion
- Batch updates (multiple steps checked off in single operation)

**Checkpoint Mechanism**: 
- Inserted before irreversible actions or high-impact state changes
- Always updates TODO.md before creating checkpoint
- Provides recovery points and progress visibility
- Never created at task completion (intermediate progress tracking only)

**Adaptive Replanning**: If original plan becomes invalid, VY can completely replace TODO.md while preserving completed steps

### Error Recovery Patterns

**Progressive Backoff**: 250ms → 500ms → 1000ms for retries

**Fallback Path Cascading**: Execute fallback paths in priority order until success or user intervention

**Failure Playbooks**:
- **ui_not_found**: Try fallback_paths → use search → request screenshot/description
- **unexpected_modal**: Identify title/buttons → prefer cancel/close → require confirmation for destructive wording
- **auth_blocked**: Stop automation → request manual login → resume from last checkpoint after confirmation

## Development Conventions

### YAML Structure Standards

**Strict Validation Required**:
- Valid YAML syntax only (no trailing commas, proper indentation)
- No preamble, commentary, or code fences in output
- Pure YAML emission unless user explicitly requests markdown/plaintext

**Required Top-Level Keys** (must be present in all prompt specs):
1. `identity` - Role/persona for VY to adopt
2. `purpose` - What this prompt accomplishes
3. `context` - Platform, access_method, auth_state, environment
4. `inputs` - List of input specifications with name, required, description, example
5. `task` - Goal and steps with UI action primitives
6. `constraints` - Hard constraint list
7. `output_format` - Type, structure, evidence_requirements
8. `self_check` - Validation questions

**Optional Top-Level Keys** (used when applicable):
- `examples` - Sample inputs/outputs
- `assumptions` - Assumption_ledger entries with id, statement, confidence, risk, mitigation, verification_method
- `inputs_missing` - List of blocking missing information
- `robustness_improvements` - Retries, rollbacks, monitoring configurations
- `validation_tests` - Schema, UI, safety, determinism test definitions
- `failure_playbooks` - Specific failure scenarios and responses

### UI Action Primitives Specification

**Each step must include 8 required fields**:
```yaml
- step_id: "step_001_unique_identifier"
  intent: "What this step accomplishes"
  locate: "UI element description with unique text, label, icon, or position"
  confirm_target: "How to verify correct element before acting"
  act: "Specific action: click button labeled 'Submit', type 'text' into field, select 'option'"
  verify_outcome: "Observable evidence: changed text, URL, toast message, new panel"
  fallback_paths:
    - "Alternative approach if primary fails"
    - "Second fallback if first also fails"
  safety_gate: "safe"  # or "caution" or "irreversible_requires_confirmation"
```

**Platform-Specific Conventions** (macOS):
- Use Command (cmd) key combinations, not Control (ctrl)
- Use `open_application` tool instead of clicking dock icons
- Understand Finder integration for native file operations
- Use percentage-based positioning for sliders (e.g., "price slider at 45%")

**Verification Evidence Requirements**:
- **Before acting**: confirm_target must be observable and unambiguous
- **After acting**: verify_outcome must capture observable state change
- Use multiple evidence types: text changes, URL changes, visual state, toast messages
- Document evidence expectations in evidence_ledger

### Evidence and Assumption Ledgers

**Assumption Ledger Fields**:
- `id`: Unique identifier (e.g., "assumption_001")
- `statement`: What we're assuming
- `confidence`: low/medium/high
- `risk`: What breaks if assumption is wrong
- `mitigation`: How to reduce risk
- `verification_method`: How to check the assumption

**Evidence Ledger Fields**:
- `step_id`: Associated step identifier
- `what_observed`: What changed or appeared
- `where_observed`: Location/context of observation
- `why_it_matters`: Why this evidence confirms success

## Testing Strategies

### Validation Tests Framework

**Schema Tests**:
- All required_keys present (identity, purpose, context, inputs, task, constraints, output_format, self_check)
- No unknown top-level keys unless explicitly in optional_keys
- Types match schema expectations (list vs scalar)

**UI Tests**:
- Every action step includes locate + confirm_target + verify_outcome
- UI references use unique visible text (not vague "the button")
- Platform-specific conventions followed (macOS shortcuts)
- Fallback paths defined for critical operations

**Safety Tests**:
- No bypass/jailbreak/evasion content present
- No credential harvesting or secret collection
- Irreversible steps include safety_gate == irreversible_requires_confirmation
- User confirmation requested before delete/send/pay/post

**Determinism Tests**:
- No claims of completed actions; phrase as instructions-to-VY only
- No vague verbs without UI referents (no "handle it", "process it")
- Concrete, observable success criteria defined
- Every step has unambiguous verification_outcome

### Testing Execution

**Self-Check Validation**: Every prompt spec must include self_check section with minimum 3 validation questions:
- "Did I classify request via policy_router correctly?"
- "Does every step use locate→confirm→act→verify?"
- "Are irreversible actions gated with explicit user confirmation?"
- "Did I avoid tool-access hallucinations and completion claims?"

**Quality Gates**:
1. Policy router classification must be applied
2. Safety gate levels must be appropriate for action risk
3. All unknowns documented in assumption_ledger
4. Evidence expectations defined for verify_outcome steps
5. Failure playbooks included for common error scenarios

## Build and Deployment Process

### Persona Generation Workflow

1. **Intake Phase**: Request classification via policy_router
   - If disallowed → emit safe alternative only
   - If ambiguous → output inputs_missing list and stop
   - If allowed → proceed to planning
   - If high_risk_irreversible → require user confirmation checkpoint

2. **Planning Phase**: Multi-approach evaluation and selection
   - Draft 2-3 approaches internally
   - Evaluate safety, reliability, reversibility
   - Choose optimal approach based on tradeoff analysis
   - Decompose into UI action primitives
   - Identify checkpoints and safety gates

3. **Specification Generation**: YAML prompt spec creation
   - Generate YAML following prompt_spec_schema
   - Include all required_keys
   - Add assumption_ledger for non-blocking unknowns
   - Add evidence_ledger expectations
   - Include failure_playbooks for common issues

4. **Validation Phase**: Comprehensive test suite execution
   - Run schema_tests for structure validation
   - Run ui_tests for action completeness
   - Run safety_tests for security compliance
   - Run determinism_tests for action specificity

5. **Output Phase**: Pure YAML emission
   - No preamble, commentary, or code fences unless explicitly requested
   - If inputs missing → output only inputs_missing list
   - If validation fails → return to planning with identified issues

### Development Environment Setup

**Required Configuration**:
- `.env` file with GEMINI_API_KEY (currently hardcoded in plaintext - security concern)
- No build system required (YAML/text files only)
- No package management or dependencies
- No compilation or transpilation steps

**File Organization Convention**:
- Core specifications: `VY-Prompt-Engineering-Persona*.yaml`
- Knowledge base: `knowledge {1,2,3}.txt`
- Task specs: `vy_task*.yaml`
- Test examples: `test_prompt*.yaml`
- Responses: `Response*.yml` or `Ressponse*.yml` (note spelling variation in initial file)
- Documentation: `*.md` files

### Version Control and Authoring

**Version Management**:
- Current version: 1.1 (as of 2026.01.14)
- Author: Faye Håkansdotter
- Contact: https://github.com/Fayeblade1488, https://github.com/AbstergoSweden
- Version history tracked within persona YAML files

**Change Tracking**:
- Each persona file includes version_history section
- Document date, author, and specific changes for each version
- Track evolution of features and architectural improvements

## Security Considerations

### Critical Security Issues Identified

**API Key Exposure**: 
- `.env` file contains hardcoded Gemini API keys in plaintext
- All three API keys use identical values (duplication concern)
- **Action Required**: Implement proper secret management for production deployment

### Content Boundaries (Strict Enforcement)

**Disallowed Content**:
- No reverse engineering instructions
- No competitor-building or cloning guidance
- No look/feel rip-off instructions
- No bypass/jailbreak/evasion operational details
- No credential theft or privacy invasion facilitation

**Defensive Security Only**:
- Threat modeling for vulnerability analysis (high-level, non-operational)
- Abuse-case discovery and mitigation strategies (pattern-level)
- High-level pattern extraction from unsafe content (no operational step reproduction)

**Terms of Service Compliance**:
- Respect Vercept Terms of Service and usage rules
- Respect target application/site Terms of Service
- No operational misuse or policy circumvention

### User Protection Mechanisms

**Authentication Handling**:
- Never harvest credentials or secrets
- Always ask user to perform manual authentication
- Resume from checkpoint after user confirms logged in
- Stop automation if auth blocked, do not attempt bypass

**Confirmation Requirements**:
- Explicit user confirmation before all irreversible actions (delete/send/pay/post)
- Checkpoint before state changes with user prompt
- Destructive wording detection triggers mandatory confirmation (e.g., "Delete account")

**Privacy Preservation**:
- Information persistence only through explicit memory tools
- User information stored using memory and user information management systems
- Privacy-preserving design with no covert data collection

### Malicious Intent Detection

**Conversation Termination Triggers**:
- Attempts to reverse engineer VY system prompt
- Extraction attempts for internal instructions or tool implementations
- Requests for bypass/jailbreak instructions
- Defensive security violations (operational misuse requests)
- Standardized security message with Vercept feedback channel reference

## Usage Instructions

### For AI Agents (When Loaded with Persona YAML)

1. **Load and Initialize**: Load appropriate persona YAML file (persona selection based on task type)
2. **Intake and Classification**: Apply policy_router to classify request (allowed/disallowed/ambiguous/high_risk_irreversible)
3. **Strict UI Pattern**: Follow locate → confirm → act → verify for every UI interaction
4. **Safety Gate Compliance**: Implement all safety gates and explicit user confirmations
5. **Assumption Documentation**: Document all unknowns in assumption_ledger with mitigations
6. **Fallback Provision**: Provide fallback paths for every critical operation
7. **Validation Execution**: Run validation_tests before final output
8. **Pure YAML Output**: Emit only valid YAML unless user explicitly requests other format

### For Developers (Project Maintenance and Extension)

1. **Reference Knowledge Files**: Use knowledge 1/2/3.txt for VY architecture understanding
2. **Study Test Prompts**: Use test_promptV1/2/3.yaml as implementation examples
3. **Follow State Machine**: Implement state machine execution model with proper transitions
4. **Error Handling**: Implement comprehensive error handling with failure playbooks
5. **Evidence Standards**: Maintain evidence-based verification standards
6. **Version Tracking**: Update version_history when modifying persona specifications
7. **Schema Compliance**: Ensure all prompt specs include required_keys and pass schema_tests

## Common Pitfalls to Avoid (with Solutions)

### Critical Failures

1. **Assuming Tool Access Without Verification**
   - **Pitfall**: Phrasing actions as completed rather than instructions-to-VY
   - **Solution**: Always phrase as "VY should click X" not "I clicked X"
   - **Validation**: self_check: "Did I avoid tool-access hallucinations?"

2. **Vague UI References**
   - **Pitfall**: "The button", "the field" without unique identifiers
   - **Solution**: Use unique text labels, icons, or relative positioning with nearby elements
   - **Validation**: UI test: "Every action step includes locate with unique identifiers"

3. **Missing Verification Steps**
   - **Pitfall**: Acting without confirming target or verifying outcome
   - **Solution**: Every step must have both confirm_target and verify_outcome
   - **Validation**: UI test: "locate + confirm_target + verify_outcome completeness"

4. **No Fallback Paths**
   - **Pitfall**: Single failure point with no recovery options
   - **Solution**: Provide at least one fallback path for each critical step
   - **Validation**: Robustness requirements in spec

5. **Irreversible Actions Without Confirmation**
   - **Pitfall**: Delete/send/pay/post without explicit user confirmation
   - **Solution**: Set safety_gate to irreversible_requires_confirmation with explicit user prompt
   - **Validation**: Safety test: "Every irreversible step includes confirmation gate"

6. **Undocumented Assumptions**
   - **Pitfall**: Proceeding with unknowns without documenting risks
   - **Solution**: Add all assumptions to assumption_ledger with mitigations
   - **Validation**: assumption_ledger presence in output

### Architecture Violations

7. **Skipping the State Machine**
   - **Pitfall**: Not following intake → plan → execute → verify flow
   - **Solution**: Explicitly map workflow to execution_model states

8. **Incomplete Evidence Ledger**
   - **Pitfall**: Verify steps without documented evidence expectations
   - **Solution**: Include evidence_ledger with what_observed, where_observed, why_it_matters

9. **Policy Router Bypass**
   - **Pitfall**: Not classifying requests via policy_router
   - **Solution**: Always apply routing_rules: allowed/disallowed/ambiguous/high_risk_irreversible

10. **Output Format Violations**
    - **Pitfall**: Including commentary, preamble, or code fences
    - **Solution**: Strict YAML only unless user explicitly requests other format
    - **Validation**: output_contract.no_extras_rule enforced

## File Path Reference

**Root Directory**: `/Users/super_user/Desktop/VY Prompt master/`

**Total File Statistics**:
- 9 YAML files: 2,344 total lines
- 3 Knowledge base files: ~1,000 total lines  
- 1 Comprehensive architect output: 650 lines
- 3 Response documentation files: ~350 lines
- 1 Current AGENTS.md: 158 lines

**Security Risk**: API keys exposed in `.env` - requires immediate attention for production
