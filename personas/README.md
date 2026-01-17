# Personas

> Agent persona definitions for VY prompt generation.

---

## Available Personas

### VY-Prompt-Engineering-Persona.yaml

The primary persona for generating VY automation prompts. Contains:

- Identity and purpose definition
- Constraint sets
- Safety boundaries
- Output contract

---

## Usage

Reference a persona when generating prompts to inherit its configuration:

```yaml
persona: VY-Prompt-Engineering-Persona
```

Or use the framework directly for full customization.

---

## Creating New Personas

1. Copy `VY-Prompt-Engineering-Persona.yaml`
2. Modify identity, constraints, and rules
3. Document in this README
4. Test with sample prompts
