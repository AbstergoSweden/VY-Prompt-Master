# How To Guide

> Step-by-step instructions for common tasks.

---

## Setting Up the Repository

### Prerequisites

- Git
- Node.js (for validation tools)
- Text editor with YAML support

### Clone and Install

```bash
# Clone repository
git clone https://github.com/AbstergoSweden/VY-Prompt-Master.git
cd VY-Prompt-Master

# Install validation tools (optional)
npm install -g ajv-cli yaml-lint
```

---

## Creating a New Prompt Specification

### Step 1: Start with the Template

Create a new file in `examples/prompts/`:

```yaml
identity: "VY Automation Agent"
purpose: ""  # Fill in: one sentence goal
context:
  platform: "VY (Vercept) automation agent on macOS"
  access_method: "desktop"
  auth_state: "user_logged_in_as_needed"
  environment: ""  # Fill in: e.g., "macOS, Safari"
inputs:
  - name: "user_task_description"
    required: true
    description: "High-level task description"
task:
  goal: ""  # Fill in: desired end state
  steps: []  # Fill in: your steps
constraints:
  - ""  # Fill in: at least one constraint
output_format:
  type: "yaml"
  structure: ""  # Fill in: output description
self_check:
  - ""  # Fill in: at least one check question
```

### Step 2: Add Steps

For each step, include all 8 fields:

```yaml
- step_id: "step_001_action_name"
  intent: "Purpose of this step (min 10 chars)"
  locate: "UI element description (min 10 chars)"
  confirm_target: "Verification before acting"
  act: "Action to perform (min 5 chars)"
  verify_outcome: "Evidence of success (min 10 chars)"
  fallback_paths:
    - "Alternative approach"
  safety_gate: "safe"  # or caution, irreversible_requires_confirmation
```

### Step 3: Validate

```bash
npx ajv validate -s framework/vy-prompt-schema.json -d examples/prompts/your-prompt.yaml
```

---

## Adding a New Persona

### Step 1: Copy the Canonical Persona

```bash
cp personas/VY-Prompt-Engineering-Persona.yaml personas/MyNewPersona.yaml
```

### Step 2: Modify Identity and Behavior

Edit the new file to change:

- `identity` – New persona name
- `purpose` – Specific focus area
- `constraints` – Role-specific rules

### Step 3: Document in personas/README.md

Add your persona to the list with its purpose.

---

## Updating Documentation

### Adding a New Doc

1. Create file in `docs/` directory
2. Use Markdown format
3. Add to `docs/FILE-TREE.md`
4. Link from relevant documents

### Modifying Existing Docs

1. Make your changes
2. Update version/date if applicable
3. Test all links still work

---

## Running Validation

### Validate All YAML Files

```bash
# Lint all framework files
npx yaml-lint framework/*.yaml

# Lint all examples
npx yaml-lint examples/**/*.yaml
```

### Validate Against Schema

```bash
# Single file
npx ajv validate -s framework/vy-prompt-schema.json -d file.yaml

# All prompts
for f in examples/prompts/*.yaml; do
  echo "Validating $f..."
  npx ajv validate -s framework/vy-prompt-schema.json -d "$f"
done
```

---

## Contributing

### Before Submitting

1. Validate all modified YAML files
2. Test documentation links
3. Update FILE-TREE.md if adding files
4. Follow commit message conventions

### Pull Request Process

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit PR with description

See [CONTRIBUTING.md](../legal/CONTRIBUTING.md) for full guidelines.
