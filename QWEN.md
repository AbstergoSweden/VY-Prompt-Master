# VY Prompt Master - Project Overview

## Project Identity
This is a comprehensive prompt engineering framework for VY (Vercept), an AI-powered computer automation agent. The project contains a unified system for creating, validating, and executing detailed prompt specifications that enable VY to perform complex computer tasks autonomously on macOS systems.

## Purpose
The VY Prompt Master framework transforms user task descriptions into detailed, executable prompt specifications that follow a strict UI-grounded methodology. The system emphasizes safety, reversibility, and evidence-based verification to ensure reliable automation execution.

## Architecture & Key Components

### Core Files
- **VY-Meta-Prompt.yaml**: The consolidated meta-prompt that unifies all knowledge, personas, and specifications into a single framework
- **vy-prompt-schema.json**: JSON Schema for validating VY prompt specifications
- **Schema Overview.md**: Documentation of the schema structure and validation patterns
- **Knowledge files (1-3.txt)**: Comprehensive documentation of VY's architecture, tool system, and operational intelligence
- **VY-Prompt-Engineering-Persona.yaml**: Specialized persona for prompt engineering tasks

### Prompt Specification Structure
All VY prompts follow a standardized structure with required components:
- `identity`: Role/persona for VY to adopt
- `purpose`: Clear statement of what the prompt accomplishes
- `context`: Platform, access method, auth state, and environment details
- `inputs`: Required inputs for task execution
- `task`: Goal and ordered steps following locate→confirm→act→verify pattern
- `constraints`: Hard constraints for execution
- `output_format`: Expected output format
- `self_check`: Validation questions

### UI Action Primitives
Each step follows an 8-field pattern:
- `step_id`: Unique identifier (e.g., step_001_open_chrome)
- `intent`: Purpose of the step
- `locate`: Unambiguous UI element description
- `confirm_target`: Criteria to verify correct element before acting
- `act`: Specific action with exact parameters
- `verify_outcome`: Observable evidence of success
- `fallback_paths`: Alternative approaches if primary fails
- `safety_gate`: Safety classification (safe/caution/irreversible_requires_confirmation)

## Building and Running

This is a configuration/documentation framework rather than a traditional codebase that compiles. The system works by:

1. Using the YAML prompt specifications with the VY automation agent
2. Validating prompts against the JSON schema using tools like AJV:
   ```bash
   npx ajv validate -s vy-prompt-schema.json -d my-prompt.json
   ```

3. Following the structured approach outlined in the meta-prompt to generate new automation specifications

## Development Conventions

### Safety-First Approach
- All irreversible actions require explicit user confirmation
- Policy routing classifies requests as allowed/disallowed/ambiguous/high_risk_irreversible
- Defensive security measures prevent bypass/jailbreak instructions

### UI Grounding Principles
- Every action must be tied to observable UI elements
- Use unique, stable text labels over coordinates when possible
- Include verification steps for every action
- Provide fallback paths for critical operations

### Complexity Thresholds
- Tasks ≤20 actions: Execute directly without planning documents
- Tasks >20 actions: Generate TODO.md planning file
- Tasks >100 interactions: Use checkpoint system with subtask breakdown

### Platform Conventions
- macOS-specific: Use Command (cmd) key shortcuts, not Control (ctrl)
- Respect native application behaviors and conventions
- Use specialized tools rather than UI automation when available (e.g., excel_read_sheet vs opening Excel)

## Key Features

### State Machine Execution
- Intake → Plan → Preflight → Execute → Verify → Checkpoint/Rollback → Finalize
- Clear transition rules between states
- Built-in error recovery and rollback mechanisms

### Robustness Framework
- Retry mechanisms with progressive backoff (250ms → 500ms → 1000ms)
- Fallback cascading (primary → secondary → tertiary → user escalation)
- Monitoring checkpoints at key intervals

### Failure Playbooks
- Predefined responses for common failure scenarios (ui_not_found, unexpected_modal, auth_blocked, etc.)
- Detection and response sequences for each failure type
- Escalation procedures when standard responses fail

### Expert System Integration
- Automatic creation of expert profiles for complex tasks
- Continuous learning and knowledge retention
- Workflow templates for repeatable processes

## Usage Guidelines

### For Prompt Creation
1. Start with the VY-Meta-Prompt.yaml as a reference
2. Follow the 8-field UI action primitive pattern
3. Validate against the JSON schema
4. Include comprehensive self-check questions
5. Add appropriate safety gates and confirmation prompts

### For Task Automation
1. Classify your request using the policy router
2. Determine if the task is simple (<20 actions) or complex (>20 actions)
3. Create appropriate prompt specification following the schema
4. Include assumptions, failure playbooks, and robustness improvements as needed
5. Test and validate before execution

## Quality Standards

### Gold Standard Criteria
- Every step follows locate→confirm→act→verify pattern
- Every irreversible action has explicit user confirmation
- Every assumption has documented risk and mitigation
- Every failure mode has a playbook response
- Output is pure YAML with zero extraneous text
- All UI references are unique and observable

### Critical Failures to Avoid
- Policy router bypass (safety violation)
- Irreversible action without confirmation
- Completion claims instead of instructions
- Preamble/commentary in output
- Missing fallback paths for critical steps