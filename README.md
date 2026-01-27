# VY Prompt Master

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Schema Version](https://img.shields.io/badge/Schema-v3.0-blue.svg)](framework/vy-prompt-schema.json)
[![Framework](https://img.shields.io/badge/Framework-Unified%20v3.0-purple.svg)](framework/VY-Unified-Framework-v3.yaml)
[![Node.js](https://img.shields.io/badge/Node.js-%3E=20.0.0-brightgreen.svg)](.nvmrc)
[![Tests](https://img.shields.io/badge/Tests-58%20Passing-brightgreen.svg)](./tests)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-blue.svg)](tsconfig.json)

<div align="center">

![VY Prompt Master](https://github.com/user-attachments/assets/64d110ca-e90d-4e7d-a821-13ff3b93162b)

**[📖 Documentation](docs/ABOUT.md)** | **[⚡ Quick Start](docs/QUICK-REFERENCE.md)** | **[🐛 Issues](docs/TODO-MASTER.md)** | **[🤝 Contributing](legal/CONTRIBUTING.md)**

</div>

> **A comprehensive prompt engineering framework for safe, deterministic AI automation.**
> 
> **Authors**: [Faye Hakansdotter](https://github.com/Fayeblade1488) and [AbstergoSweden](https://github.com/AbstergoSweden)

---

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [CLI Tools](#cli-tools)
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
| --------- | ------------- |
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

Copy the system message from [`docs/ai-review-prompt.md`](docs/ai-review-prompt.md) to your AI. For provider-specific instructions, see the [`providers/`](providers/) directory.

### 2. Provide a Task Description

```text
Open Safari, navigate to example.com, extract the main headline, 
and save it to a file called headline.txt in my Documents folder.
```

### 3. Receive YAML Specification

The AI generates a complete YAML spec with:

- All 8 required top-level keys
- Steps with 8 required fields each
- Safety gates and fallback paths

### 4. Validate with CLI

```bash
npm install
npm run validate your-prompt.yaml
```

---

## CLI Tools

The VY Orchestrator provides a TypeScript-based CLI for AI-powered prompt generation and validation.

### Installation

```bash
npm install
cp .env.example .env
# Add your API key: ANTHROPIC_API_KEY or OPENAI_API_KEY
```

### Commands

| Command | Description |
| --------- | ------------- |
| `npm run generate "task"` | Generate a VY prompt using AI |
| `npm run validate file.yaml` | Validate YAML against schema + safety rules |
| `npx tsx src/cli/index.ts check file.yaml` | Quick structure check |

### Generate Example

```bash
export ANTHROPIC_API_KEY=your_actual_api_key_here
npm run generate "Clear Safari cookies and website data"
```

### CLI Options

The CLI provides several options for customization:

```bash
# Generate with specific provider and model
npm run generate -- --provider openai --model gpt-4o "Your task here"

# Dry run to validate inputs without calling AI APIs
npm run generate -- --dry-run "Your task here"

# Specify output file
npm run generate -- --output my-prompt.yaml "Your task here"

# Verbose output with progress indicators
npm run generate -- --verbose "Your task here"

# Strict mode - fail on warnings
npm run generate -- --strict "Your task here"

# Custom number of refinement iterations
npm run generate -- --iterations 5 "Your task here"
```

### Configuration

You can customize the default behavior by creating a configuration file:
- `vy.config.json`
- `.vyrc.json`

Example configuration:
```json
{
  "defaultProvider": "anthropic",
  "defaultModel": "claude-3-5-sonnet-20241022",
  "maxIterations": 5,
  "strictMode": false,
  "verbose": false
}
```

### Development

```bash
npm run preflight   # Build, test, typecheck, lint
npm run test        # Run tests only
npm run build       # TypeScript compilation
```

---

## Project Structure

```text
VY-Prompt-Master/
├── src/                # TypeScript orchestrator
│   ├── validator/      # Schema, safety, UI validators
│   ├── generator/      # AI adapters (Claude, OpenAI)
│   ├── orchestrator/   # 5-phase workflow pipeline
│   └── cli/            # Command-line interface
├── tests/              # Vitest test suite
├── framework/          # Core specifications
│   ├── VY-Unified-Framework-v3.yaml
│   ├── VY-Meta-Prompt.yaml
│   └── vy-prompt-schema.json
├── examples/           # Sample prompts and tasks
├── knowledge/          # VY capability documentation
├── docs/               # Guides and references
│   ├── TODO-MASTER.md  # Comprehensive bug & enhancement tracker
│   └── ...
├── legal/              # Legal documents
├── personas/           # Agent persona definitions
└── providers/          # Provider-specific documentation
    ├── AGENTS.md       # OpenAI agents instructions
    ├── GEMINI.md       # Google Gemini instructions
    └── QWEN.md         # Qwen model instructions
```

See [`docs/FILE-TREE.md`](docs/FILE-TREE.md) for complete structure.

---

## Documentation

| Document | Description |
| ---------- | ------------- |
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
| ------- | --------- |
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

### CLI Validation (Recommended)

```bash
# Full validation (schema + safety + UI patterns)
npm run validate examples/prompts/test_promptV3.yaml

# Quick structure check
npx tsx src/cli/index.ts check examples/prompts/test_promptV3.yaml
```

### Manual Schema Validation

```bash
npx ajv validate -s framework/vy-prompt-schema.json -d my-prompt.yaml
```

### Quality Checklist

- [ ] All 8 top-level keys present
- [ ] Every step has 8 required fields
- [ ] Safety gates appropriate for actions
- [ ] No credentials in specifications
- [ ] Command key (⌘) used, not Control

---

## Contributing

We welcome contributions! Please see:

- [CONTRIBUTING.md](legal/CONTRIBUTING.md) - Contribution guidelines
- [TODO-MASTER.md](docs/TODO-MASTER.md) - Comprehensive bug & improvement tracker
- [LEGAL.md](legal/LEGAL.md) - Legal information
- [SECURITY.md](.github/SECURITY.md) - Security policy

### Before Submitting

1. Validate all YAML files using `npm run validate`
2. Update documentation if needed (see docs/TODO-MASTER.md)
3. Review the comprehensive TODO list in docs/TODO-MASTER.md
4. Follow commit conventions

---

## License

This project is licensed under the **MIT License**. See [LICENSE](LICENSE) for details.

---

## Acknowledgments

- **Primary Author**: [Faye Hakansdotter](https://github.com/Fayeblade1488)
- **Collaborator**: [AbstergoSweden](https://github.com/AbstergoSweden)
- **VY/Vercept**: [vercept.com](https://vercept.com/)

---

> Built with ❤️ for safe, deterministic AI automation
