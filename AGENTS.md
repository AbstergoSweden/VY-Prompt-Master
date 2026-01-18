# VY Prompt Master - AI Development Guide

## Project Overview

**VY Prompt Master** is a production-ready TypeScript framework that transforms high-level task descriptions into validated, executable YAML prompt specifications for the VY (Vercept) automation agent. It provides a CLI tool for AI-powered prompt generation and comprehensive validation against a strict schema and safety guidelines.

### Core Philosophy

> **"If VY cannot verify it, VY should not execute it."**

Every automation step follows the pattern: `locate → confirm_target → act → verify_outcome`

## Technology Stack

- **Runtime**: Node.js >=20.0.0 (ESM modules)
- **Language**: TypeScript 5.7+ with strict mode
- **Testing**: Vitest with coverage via v8
- **Linting**: ESLint 9.x with TypeScript support
- **Schema**: JSON Schema (ajv) for YAML validation
- **CLI**: Commander.js for command-line interface
- **AI Providers**: Anthropic Claude (primary), OpenAI GPT (alternative)
- **Build**: tsc (no bundler needed)

## Project Architecture

### Module Organization

```
src/
├── cli/                 # Command-line interface
│   └── index.ts        # Main CLI entry point
├── generator/           # AI prompt generation
│   ├── ai-adapters/    # Provider-specific adapters (Anthropic, OpenAI)
│   ├── prompt-generator.ts
│   └── index.ts
├── orchestrator/        # 5-phase workflow pipeline
│   └── index.ts        # Main orchestration logic
├── validator/           # Multi-level validation
│   ├── schema-validator.ts   # JSON Schema validation
│   ├── safety-validator.ts   # Safety and policy checks
│   ├── ui-validator.ts       # UI pattern validation
│   └── index.ts
├── types.ts            # Shared TypeScript definitions
└── index.ts           # Public API exports

framework/              # Core specifications
├── VY-Unified-Framework-v3.yaml
├── vy-prompt-schema.json
└── VY-Meta-Prompt.yaml

examples/               # Sample prompts and tasks
├── prompts/           # Generated prompt examples
└── tasks/             # Task description examples

knowledge/             # VY capability documentation
personas/              # Agent persona definitions
docs/                  # User-facing documentation
tests/                 # Test suite with fixtures
```

### Key Dependencies

**Runtime:**
- `@anthropic-ai/sdk` - Anthropic Claude API
- `openai` - OpenAI GPT API
- `ajv` + `ajv-formats` - JSON Schema validation
- `commander` - CLI framework
- `chalk` - Terminal colors
- `dotenv` - Environment configuration
- `yaml` - YAML parsing

**Development:**
- `typescript` - Type checking and compilation
- `tsx` - TypeScript execution in development
- `vitest` - Testing framework
- `eslint` - Linting with TypeScript rules

## Build and Development Commands

### Essential Commands

```bash
# Install dependencies
npm install

# Build TypeScript to dist/
npm run build

# Run all quality checks (build, test, typecheck, lint)
npm run preflight

# Development mode with watch
npm run dev

# Run CLI commands from source
npx tsx src/cli/index.ts generate "your task"
npx tsx src/cli/index.ts validate file.yaml
npx tsx src/cli/index.ts check file.yaml  # Quick structure check
```

### Testing

```bash
# Run tests once
npm run test

# Watch mode for development
npm run test:watch

# Generate coverage report
npm run test:coverage

# Type checking without build
npm run typecheck
```

### Linting

```bash
# Check for linting errors
npm run lint

# Auto-fix linting errors
npm run lint:fix
```

### Prompt Generation & Validation

```bash
# Generate a prompt (requires ANTHROPIC_API_KEY or OPENAI_API_KEY)
npm run generate "Clear Safari cookies and website data"
npm run generate "Open Safari and navigate to example.com"

# Validate existing YAML
npm run validate examples/prompts/test_promptV3.yaml

# With custom options
npx tsx src/cli/index.ts generate "task" --provider openai --model gpt-4o --output prompt.yaml --verbose
```

## Code Style Guidelines

### TypeScript Configuration

- **Target**: ES2022 with NodeNext module resolution
- **Strict mode**: Enabled (noImplicitReturns, noUnusedLocals, etc.)
- **Source maps**: Generated for debugging
- **Declaration files**: Generated for library usage

### ESLint Rules

- Extends `@eslint/js` and `typescript-eslint` recommended configs
- Enforces no unused variables (with `_` prefix exception)
- Warns on `any` type usage
- No console restrictions (CLI tool needs console output)

### Naming Conventions

- **Files**: kebab-case (e.g., `prompt-generator.ts`)
- **Types**: PascalCase (e.g., `VYPromptSpec`)
- **Interfaces**: PascalCase with `I` prefix (e.g., `IValidationResult`)
- **Constants**: UPPER_SNAKE_CASE
- **Functions**: camelCase

### Code Organization

1. **Single Responsibility**: Each module has one clear purpose
2. **Dependency Injection**: AI adapters accept configuration objects
3. **Pure Functions**: Validators return results without side effects
4. **Error Handling**: Use typed errors and early returns
5. **Documentation**: JSDoc for public APIs and complex logic

## Testing Strategy

### Test Framework: Vitest

- **Location**: `tests/` directory mirrors `src/` structure
- **Pattern**: `*.test.ts` files
- **Timeout**: 10 seconds for tests and hooks
- **Coverage**: Tracked with v8 provider, excludes CLI entry point

### Test Fixtures

Located in `tests/fixtures/index.ts`:
- `VALID_MINIMAL` - Minimal valid prompt
- `VALID_FULL` - Prompt with all optional fields
- `INVALID_MISSING_FIELDS` - Missing required keys
- `INVALID_PAST_TENSE` - Past tense in `act` field (invalid)
- `INVALID_SAFETY_GATE` - Wrong safety gate for irreversible action
- `INVALID_CONTROL_KEY` - Uses Control instead of Command

### Test Categories

1. **Generator Tests**: AI adapter interfaces, YAML extraction
2. **Orchestrator Tests**: Workflow pipeline, iteration logic
3. **Validator Tests**: Schema, safety, UI pattern validation
4. **Integration Tests**: End-to-end generation and validation flows

### Running Tests

```bash
# All tests
npm run test

# Specific test file
npm run test -- validator/schema-validator

# With coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## Security Considerations

### Policy Router

The `safety-validator.ts` implements a policy router that classifies requests:
- **allowed**: Proceed with generation
- **disallowed**: Reject with message (no operational details)
- **ambiguous**: Request clarification
- **high_risk_irreversible**: Require explicit confirmation

### Disallowed Content

- Reverse engineering instructions
- Competitor-building or cloning guidance
- Credential harvesting
- System prompt disclosure
- Evasion/bypass techniques

### Safety Gates

Every action step requires a `safety_gate`:
- `safe`: No risk, fully reversible
- `caution`: Potential issues, careful verification needed
- `checkpoint`: User confirmation at significant milestones
- `irreversible_requires_confirmation`: Explicit user confirmation required

### No Disclosure Validation

`validateNoDisclosure()` checks for:
- Credentials in specifications
- API keys in prompts
- Sensitive user data
- Internal system details

### Environment Security

- `.env` file is gitignored
- `.env.example` provides template without secrets
- API keys only used in CLI, never logged
- Generated YAML is sanitized before output

## Deployment Process

### Requirements

- Node.js >=20.0.0
- ANTHROPIC_API_KEY or OPENAI_API_KEY for generation
- Read/write access to working directory for file operations

### Installation

```bash
# Clone repository
git clone <repository>
cd vy-prompt-master

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env and add API key

# Build
npm run build

# Test
npm run preflight
```

### CI/CD

GitHub Actions workflow (`.github/workflows/ci.yml`):
- **YAML Validation**: Checks all framework and example YAML files
- **Schema Validation**: Validates prompts against vy-prompt-schema.json
- **Markdown Linting**: Lints README and docs

### Distribution

- npm package with CLI binary (`vy-prompt`)
- Can be installed globally: `npm install -g vy-prompt-master`
- Docker-ready (Node.js base image recommended)

## YAML Specification Guidelines

### Required Structure

```yaml
identity: "VY Automation Agent"
purpose: "Clear statement of accomplishment"
context:
  platform: "VY (Vercept) automation agent on macOS"
  access_method: desktop | web | mobile | hybrid
  auth_state: logged_in | requires_login | public | user_logged_in_as_needed
  environment: string | object
inputs:
  - name: parameter_name
    required: true | false
    description: "Clear description"
    example: "Optional example"
    type: string | number | boolean | array | object | url | path | date
task:
  goal: "Overall task objective"
  steps:
    - step_id: step_001_action_name
      intent: "What this step does"
      locate: "UI element description"
      confirm_target: "Verification before acting"
      act: "Specific action to perform"
      verify_outcome: "Evidence of success"
      fallback_paths:
        - "Alternative if primary fails"
      safety_gate: safe | caution | checkpoint | irreversible_requires_confirmation
constraints:
  - "Do not modify user data"
output_format:
  type: yaml | markdown | plaintext | structured_data | json
self_check:
  - "Verification question 1"
```

### Step Validation Rules

Each step MUST have exactly 8 required fields:
1. `step_id`: Unique identifier (`step_001_short_name`)
2. `intent`: Clear description
3. `locate`: UI element location
4. `confirm_target`: Pre-action verification
5. `act`: Present-tense action (never past tense)
6. `verify_outcome`: Success criteria
7. `fallback_paths`: Array of alternatives
8. `safety_gate`: Risk classification

### macOS Conventions

- Use **Command (⌘)** key, **never Control**
- Common shortcuts: `⌘,` for settings, `⌘⇧G` for Go to Folder
- Prefer application icons in Dock before searching
- Use `open_application` tool when direct click fails

## Configuration Files

### TypeScript (`tsconfig.json`)
- ES2022 target with NodeNext modules
- Strict mode with unused code detection
- Declaration files for library usage
- Source maps for debugging

### ESLint (`eslint.config.mjs`)
- TypeScript parser with project references
- Warns on `any` and non-null assertions
- Allows console output (CLI requirement)
- Ignores `dist/` and `node_modules/`

### Vitest (`vitest.config.ts`)
- Node environment for all tests
- 10 second timeout for tests/hooks
- Coverage with v8 provider
- Excludes CLI entry point from coverage

### Environment (`.env`)
- `ANTHROPIC_API_KEY` - Primary AI provider
- `OPENAI_API_KEY` - Alternative provider
- `DEFAULT_AI_PROVIDER=anthropic`
- `MAX_REFINEMENT_ITERATIONS=3`
- `STRICT_VALIDATION=false`
- `LOG_LEVEL=info`

## Key Files Reference

- **Entry Point**: `src/cli/index.ts` - Commander.js CLI
- **Orchestrator**: `src/orchestrator/index.ts` - Main pipeline
- **Types**: `src/types.ts` - All TypeScript interfaces
- **Schema**: `framework/vy-prompt-schema.json` - JSON Schema validation
- **Framework**: `framework/VY-Unified-Framework-v3.yaml` - Generation guidelines
- **Examples**: `examples/prompts/test_promptV3.yaml` - Complete example
- **Tests**: `tests/fixtures/index.ts` - Test data
- **CI**: `.github/workflows/ci.yml` - GitHub Actions

## Development Workflow

### Adding New Features

1. **Design**: Consider impact on validation, generation, and CLI
2. **Types**: Update `types.ts` with new interfaces
3. **Implementation**: Follow existing patterns in appropriate module
4. **Tests**: Add test cases to fixture and test files
5. **Documentation**: Update relevant docs and examples
6. **Validation**: Run `npm run preflight` before committing

### Refactoring

1. **Preserve API**: Maintain backward compatibility for public exports
2. **Update Tests**: Ensure test coverage remains high
3. **Type Safety**: Use TypeScript strict mode to catch errors
4. **Validation**: Run full test suite after changes

### Bug Fixes

1. **Reproduce**: Create test case that fails
2. **Fix**: Minimal change to resolve issue
3. **Verify**: Test passes after fix
4. **Regression**: Ensure no other tests fail

## Documentation

- **README.md**: User-facing overview and quick start
- **docs/**: Detailed guides (WORKFLOW, HOW-TO, SCHEMA, etc.)
- **knowledge/**: VY operational intelligence and capabilities
- **personas/**: Agent persona definitions for generation
- **legal/**: CONTRIBUTING.md, LEGAL.md, and other legal documents

## Support and Contributing

- **Issues**: Report bugs via GitHub Issues
- **Security**: See `.github/SECURITY.md` for security policy
- **Contributing**: See `legal/CONTRIBUTING.md` for guidelines
- **License**: MIT (see LICENSE file)

---

**Last Updated**: 2026.01.17
**Schema Version**: v3.0
**Framework Version**: Unified v3.0
