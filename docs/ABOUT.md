# About VY Prompt Master

> A comprehensive prompt engineering framework for safe, deterministic AI automation.

---

## What is VY Prompt Master?

**VY Prompt Master** is a prompt engineering framework designed for [Vy (Vercept)](https://vercept.com/)
– an AI-powered macOS automation agent. It transforms high-level user task descriptions
into detailed, executable YAML specifications that Vy can safely and predictably carry out.

---

## Why This Exists

Modern AI agents can perform complex computer tasks, but without proper structure, they risk:

- **Unpredictable behavior** – Actions may vary between runs
- **Safety issues** – Destructive actions without user consent
- **Debugging difficulties** – Hard to trace what went wrong
- **Hallucination** – Claiming completion without verification

VY Prompt Master solves these problems by enforcing a rigorous specification format where every action is:

- **Grounded in UI** – Tied to visible elements, not abstract concepts
- **Verified** – Every action has observable success criteria
- **Reversible-first** – Preferring undo-able actions with safety gates
- **Deterministic** – Same input produces same output

---

## Key Features

| Feature | Description |
|---------|-------------|
| **Policy Router** | Classifies requests as allowed/disallowed/ambiguous |
| **UI Grounding** | Actions reference specific, visible UI elements |
| **Safety Gates** | Irreversible actions require explicit confirmation |
| **Fallback Paths** | Alternatives when primary approach fails |
| **Schema Validation** | JSON Schema ensures specification consistency |
| **Failure Playbooks** | Predefined handling for common errors |

---

## Who Is This For?

- **Prompt Engineers** building automation for Vy
- **AI Developers** creating structured agent specifications
- **Automation Specialists** needing deterministic UI automation
- **Organizations** requiring auditable, safe AI operations

---

## Core Philosophy

> **"If VY cannot verify it, VY should not execute it."**

Every step follows the pattern:

```text
locate → confirm_target → act → verify_outcome
```

This ensures no action proceeds without proper targeting, and no action completes without verification.

---

## Getting Started

1. **Review** the [WORKFLOW.md](./WORKFLOW.md) for complete process understanding
2. **Use** the [ai-review-prompt.md](./ai-review-prompt.md) as your AI system message
3. **Validate** outputs against the [schema](../framework/vy-prompt-schema.json)
4. **Test** with examples in the [examples/](../examples/) directory

---

## Links

- **Project Repository**: [github.com/Fayeblade1488/VY-Prompt-Master](https://github.com/Fayeblade1488/VY-Prompt-Master)
- **Collaborator**: [AbstergoSweden](https://github.com/AbstergoSweden)
- **Vercept (Vy)**: [vercept.com](https://vercept.com/)
- **Author**: Faye Håkansdotter
