# VY Prompt Master

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Schema Version](https://img.shields.io/badge/Schema-v3.0-blue.svg)](framework/vy-prompt-schema.json)
[![Framework](https://img.shields.io/badge/Framework-Unified%20v3.0-purple.svg)](framework/VY-Unified-Framework-v3.yaml)

![VY Prompt Master](https://github.com/user-attachments/assets/64d110ca-e90d-4e7d-a821-13ff3b93162b)

> **A comprehensive prompt engineering framework for safe, deterministic AI automation.**

---

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Documentation](#documentation)
- [Usage](#usage)
- [Validation](#validation)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**VY Prompt Master** is a production-ready framework for generating VY (Vercept) automation prompt specifications. It transforms high-level task descriptions into detailed, executable YAML specs that ensure:

| Feature | Description |
|---------|-------------|
| **Safety-First** | Policy routing with explicit safety gates for irreversible actions |
| **UI-Grounded** | Every action tied to visible UI elements with verification |
| **Deterministic** | Same input produces same output, every time |
| **Reversible** | Prefer undo-able actions; gate destructive ones with confirmation |

### Core Philosophy

> **"If VY cannot verify it, VY should not execute it."**

Every step follows the pattern: `locate → confirm_target → act → verify_outcome`

---

## Quick Start

### 1. Use the AI Review Prompt

Copy the system message from [`docs/ai-review-prompt.md`](docs/ai-review-prompt.md) to your AI.

### 2. Provide a Task Description

```
Open Safari, navigate to example.com, extract the main headline, 
and save it to a file called headline.txt in my Documents folder.
```

### 3. Receive YAML Specification

The AI generates a complete YAML spec with:

- All 8 required top-level keys
- Steps with 8 required fields each
- Safety gates and fallback paths

### 4. Validate (Optional)

```bash
npx ajv validate -s framework/vy-prompt-schema.json -d my-prompt.yaml
```

---

## Project Structure

```
VY-Prompt-Master/
├── framework/          # Core specifications
│   ├── VY-Unified-Framework-v3.yaml
│   ├── VY-Meta-Prompt.yaml
│   └── vy-prompt-schema.json
├── examples/           # Sample prompts and tasks
│   ├── tasks/
│   ├── prompts/
│   └── responses/
├── knowledge/          # VY capability documentation
├── docs/               # Guides and references
├── legal/              # Legal documents
└── personas/           # Agent persona definitions
```

See [`docs/FILE-TREE.md`](docs/FILE-TREE.md) for complete structure.

---

## Documentation

| Document | Description |
|----------|-------------|
| [AI Review Prompt](docs/ai-review-prompt.md) | System message for AI prompt generation |
| [Workflow Guide](docs/WORKFLOW.md) | Complete 5-phase workflow |
| [Quick Reference](docs/QUICK-REFERENCE.md) | Quick lookup card |
| [How-To Guide](docs/HOW-TO.md) | Step-by-step instructions |
| [About](docs/ABOUT.md) | Project overview and philosophy |

---

## Usage

### Required YAML Structure

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

### Step Structure (8 Required Fields)

| Field | Purpose |
|-------|---------|
| `step_id` | Unique identifier (`step_001_action`) |
| `intent` | What this step does |
| `locate` | UI element description |
| `confirm_target` | Verification before acting |
| `act` | Specific action |
| `verify_outcome` | Evidence of success |
| `fallback_paths` | Alternatives on failure |
| `safety_gate` | Risk level (`safe`, `caution`, `irreversible_requires_confirmation`) |

---

## Validation

### Validate YAML Syntax

```bash
npx yaml-lint framework/*.yaml
```

### Validate Against Schema

```bash
npx ajv validate -s framework/vy-prompt-schema.json -d examples/prompts/test_promptV3.yaml
```

### Quality Checklist

- [ ] All 8 top-level keys present
- [ ] Every step has 8 required fields
- [ ] Safety gates appropriate for actions
- [ ] No credentials in specifications
- [ ] Fallback paths for critical steps

---

## Contributing

We welcome contributions! Please see:

- [CONTRIBUTING.md](legal/CONTRIBUTING.md) - Contribution guidelines
- [LEGAL.md](legal/LEGAL.md) - Legal information
- [SECURITY.md](.github/SECURITY.md) - Security policy

### Before Submitting

1. Validate all YAML files
2. Update documentation if needed
3. Follow commit conventions

---

## License

This project is licensed under the **MIT License**. See [LICENSE](LICENSE) for details.

---

## Acknowledgments

- **Author**: [Faye Håkansdotter](https://github.com/Fayeblade1488)
- **VY/Vercept**: [vercept.com](https://vercept.com/)

---

<p align="center">
  <sub>Built with ❤️ for safe, deterministic AI automation</sub>
</p>
