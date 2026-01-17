# VY Prompt Engineering Project

## Overview

This project contains a comprehensive framework for prompt engineering specifically designed for VY (Vercept), an AI automation agent for macOS. The framework provides structured approaches to creating safe, deterministic, and robust UI automation prompts that enable VY to execute tasks through desktop UI interactions.

## Project Structure

The project consists of multiple YAML files that define prompt engineering specifications, personas, and task templates:

- `VY-Prompt-Engineering-Persona.yaml` - The main persona specification for VY prompt engineering
- `VY-Prompt-Engineering-Persona2.yaml` - Secondary persona specification
- `VY-Prompt-Engineering-Perona1.yaml` - Alternative spelling of persona specification
- `test_promptV*.yaml` - Test prompt versions for VY as a Code Librarian and System Organizer
- `vy_task*.yaml` - Task specifications for creating master-level prompt-engineering persona
- `Response*.yml` and `Ressponse1.yml` - Additional response templates
- `knowledge*.txt` - Detailed documentation about VY's architecture, tools, and operational intelligence
- `VY Prompt Architect Output.md` - HTML output from the VY Prompt Architect tool with Tailwind CSS styling

## Key Concepts

### VY (Vercept) Automation Agent
VY is positioned as a local agent on the user's computer capable of:
- UI automation tasks on macOS
- Interacting with on-screen elements
- Performing step-by-step operations with verification
- Grounding actions in visual UI elements

### Prompt Engineering Framework
The files implement a structured approach to prompt engineering that includes:
- Identity and purpose definitions
- Context specifications
- Input definitions
- Step-by-step task breakdowns
- Constraints and safety boundaries
- Error handling and fallback paths
- Verification steps for each action
- Assumption documentation

### Safety and Robustness Features
The prompt specifications emphasize:
- Reversible-first actions
- Explicit UI grounding (locate → confirm → act → verify)
- Safety gates for irreversible actions
- Error recovery and fallback paths
- Evidence-based verification
- State machine execution models

## Core Components

### 1. VY Prompt Engineering Persona
The main specification defines a master-level prompt-engineering specialist for VY automation that transforms user tasks into developer-ready, VY-optimized execution prompt specifications. It includes:
- Core competencies in prompt engineering and UX automation
- Target platform specifications for VY (Vercept)
- Input/output contracts
- Hard constraints for safety and determinism
- UI action primitives with required fields per step
- Assumption and evidence ledgers
- Failure playbooks for common issues

### 2. Knowledge Base
Three comprehensive knowledge files provide detailed information about:
- VY's core architecture and AI foundation
- Tool system and interaction mechanisms
- Workflow execution and operational intelligence

### 3. Task Specifications
Various YAML files define specific tasks for VY, including:
- Code librarian and system organizer roles
- Complex file organization workflows
- Multi-phase execution strategies

## Usage Patterns

The prompt specifications follow a consistent structure designed to:
1. Take a user task brief as input
2. Generate explicit, stepwise instructions for VY
3. Include UI-grounded actions with verification
4. Implement safety checks and confirmation prompts
5. Provide robust error handling and recovery

## Target Environment

The specifications are primarily designed for:
- macOS platforms
- Local UI automation
- Web and desktop application interaction
- User-assisted authentication (manual login by user)

## Development Approach

The prompt engineering approach emphasizes:
- Deterministic execution
- Observable evidence for each step
- Comprehensive error handling
- Safety-first design with confirmation gates
- Clear separation between specification and execution
- State tracking and checkpointing

## Safety Boundaries

The framework implements strict safety boundaries:
- No bypass/jailbreak/evasion instructions
- No credential harvesting or privacy invasion
- Respect for Terms of Service
- Explicit confirmation for irreversible actions
- Defensive security measures against misuse

## Architecture

The system implements a state machine execution model with states including:
- Intake, planning, preflight, execution, verification
- Checkpoint creation, rollback, and retry mechanisms
- Finalization of tasks

Each UI action follows a required pattern with fields:
- step_id, intent, locate, confirm_target, act, verify_outcome
- fallback_paths, and safety_gate levels

## Key Features

1. **UI Grounding**: All actions are grounded in observable UI elements
2. **Verification**: Each action includes verification of outcomes
3. **Safety Gates**: Confirmation required for irreversible actions
4. **Fallback Paths**: Alternative approaches for failed actions
5. **Evidence Ledger**: Recording of observable evidence for verification
6. **Assumption Ledger**: Documentation of assumptions with mitigations
7. **Failure Playbooks**: Predefined responses for common failure modes

## Implementation Philosophy

The framework emphasizes:
- Minimal, concise output
- Reversible-first approach
- Evidence-based verification
- Platform-aware operations (macOS specific)
- User safety and privacy
- Deterministic execution
- Robust error handling

This directory serves as a repository for VY prompt engineering specifications, focusing on creating safe, robust, and effective automation prompts for UI interaction tasks. The files represent a methodical approach to prompt engineering with emphasis on safety, verification, and error handling.