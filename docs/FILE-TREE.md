# Repository File Tree

> Complete directory structure with file descriptions.

---

## Directory Structure

```text
VY-Prompt-Master/
│
├── .github/                          # GitHub configuration
│   ├── ISSUE_TEMPLATE/               # Issue templates
│   │   ├── bug_report.md             # Bug report template
│   │   └── feature_request.md        # Feature request template
│   ├── workflows/
│   │   └── ci.yml                    # CI/CD pipeline
│   ├── agents/
│   │   └── my-agent.agent.md         # GitHub Copilot agent config
│   ├── CODEOWNERS                    # Repository ownership
│   └── SECURITY.md                   # Security policy
│
├── src/                              # TypeScript orchestrator
│   ├── types.ts                      # Shared type definitions
│   ├── validator/                    # Validation pipeline
│   │   ├── schema-validator.ts       # JSON Schema validation (ajv)
│   │   ├── safety-validator.ts       # Policy router & safety gates
│   │   ├── ui-validator.ts           # 8-field pattern validation
│   │   └── index.ts                  # Unified validation pipeline
│   ├── generator/                    # AI prompt generation
│   │   ├── ai-adapters/              # Provider adapters
│   │   │   ├── base.ts               # Adapter interface
│   │   │   ├── anthropic.ts          # Claude adapter
│   │   │   ├── openai.ts             # GPT adapter
│   │   │   └── index.ts              # Factory function
│   │   ├── prompt-generator.ts       # Generation logic
│   │   └── index.ts
│   ├── orchestrator/                 # 5-phase workflow
│   │   └── index.ts                  # Main pipeline
│   ├── cli/                          # Command-line interface
│   │   └── index.ts                  # CLI commands
│   └── index.ts                      # Main entry point
│
├── tests/                            # Vitest test suite
│   ├── validator/                    # Validator tests
│   ├── generator/                    # Generator tests
│   ├── orchestrator/                 # Orchestrator tests
│   └── fixtures/                     # Test fixtures
│
├── framework/                        # Core framework specifications
│   ├── VY-Unified-Framework-v3.yaml  # Main framework spec (v3.0)
│   ├── VY-Meta-Prompt.yaml           # Meta-prompt definition (v2.0)
│   └── vy-prompt-schema.json         # JSON Schema for validation
│
├── personas/                         # Agent persona definitions
│   ├── VY-Prompt-Engineering-Persona.yaml  # Primary persona
│   └── README.md                     # Persona usage guide
│
├── examples/                         # Example files
│   ├── tasks/                        # Task input examples
│   ├── prompts/                      # Generated prompt examples
│   └── responses/                    # AI-generated outputs
│
├── knowledge/                        # VY knowledge base
│   ├── architecture.md               # Core architecture & AI foundation
│   ├── tools.md                      # Tool system & capabilities
│   └── operations.md                 # Workflow & operational intelligence
│
├── docs/                             # Documentation
│   ├── ABOUT.md                      # Project overview
│   ├── GUIDE.md                      # Usage guide
│   ├── HOW-TO.md                     # Step-by-step instructions
│   ├── QUICK-REFERENCE.md            # Quick reference card
│   ├── SCHEMA.md                     # Schema documentation
│   ├── WORKFLOW.md                   # Complete workflow guide
│   ├── ai-review-prompt.md           # AI system message template
│   └── FILE-TREE.md                  # This file
│
├── legal/                            # Legal documents
│   ├── LEGAL.md                      # Legal notices & compliance
│   └── CONTRIBUTING.md               # Contribution guidelines
│
├── archive/                          # Archived files
│   └── legacy/                       # Legacy/backup files
│
├── dist/                             # TypeScript build output
├── node_modules/                     # Dependencies
│
├── package.json                      # Node.js configuration
├── tsconfig.json                     # TypeScript configuration
├── vitest.config.ts                  # Test configuration
├── eslint.config.mjs                 # ESLint configuration
├── .env.example                      # Environment variable template
├── LICENSE                           # MIT License
├── README.md                         # Main project readme
├── GEMINI.md                         # Gemini CLI instructions
├── QWEN.md                           # Qwen model instructions
└── AGENTS.md                         # OpenAI agents instructions
```

---

## File Purposes

### Framework Files

| File | Purpose | Key Contents |
|------|---------|--------------|
| `VY-Unified-Framework-v3.yaml` | Core specification | Policy router, UI primitives, state machine |
| `VY-Meta-Prompt.yaml` | Meta-prompt definition | Consolidated prompt engineering spec |
| `vy-prompt-schema.json` | Validation schema | JSON Schema for prompt validation |

### Knowledge Base

| File | Purpose | Key Topics |
|------|---------|------------|
| `architecture.md` | Core design | AI foundation, decision-making, security |
| `tools.md` | Capabilities | Mouse, keyboard, file system, browser |
| `operations.md` | Execution | Workflows, error recovery, checkpoints |

### Documentation

| File | Purpose | Audience |
|------|---------|----------|
| `ai-review-prompt.md` | AI system message | LLM/AI integrations |
| `WORKFLOW.md` | Complete workflow | Developers, prompt engineers |
| `QUICK-REFERENCE.md` | Quick lookup | All users |
| `GUIDE.md` | Usage guide | New users |

---

## Version Information

| Component | Version | Last Updated |
|-----------|---------|--------------|
| Unified Framework | 3.0 | 2026.01.16 |
| Meta-Prompt | 2.0 | 2026.01.16 |
| Schema | Draft-07 | 2026.01.16 |
