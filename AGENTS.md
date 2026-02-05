# Repository Guidelines

## Project Structure & Module Organization

- `src/`: TypeScript source (library + CLI). Entry points: `src/index.ts`, `src/cli/index.ts`.
- `tests/`: Vitest test suite (`tests/**/*.test.ts`) plus fixtures under `tests/fixtures/`.
- `framework/`: Core YAML framework files and JSON schema (used by CI to validate prompt examples).
- `examples/`: Example tasks, prompt YAMLs, and response samples.
- `docs/`, `knowledge/`, `personas/`, `legal/`: Documentation and reference content.
- `dist/`: Compiled output from `tsc` (generated; don’t edit by hand).

## Build, Test, and Development Commands

```bash
nvm use                       # uses .nvmrc (Node 22.x); package.json requires >=20
npm ci                        # clean install
npm run dev                   # watch CLI (tsx)
npm run build                 # compile to dist/ (tsc)
npm run typecheck             # TS strict checks (no emit)
npm test                      # run vitest once
npm run test:coverage         # v8 coverage for src/**/*.ts
npm run lint                  # eslint src tests
npm run preflight             # build + test + typecheck + lint

npm run generate -- "Clear Safari cookies" -p mock --dry-run
npm run validate -- examples/prompts/example.yaml
```

## Coding Style & Naming Conventions

- TypeScript, ESM (`"type": "module"`). Keep local imports using `.js` extensions (NodeNext/TS emit).
- Indentation matches existing code: 4 spaces; keep formatting consistent within a file.
- Prefer explicit types and `unknown` over `any` (ESLint warns on `any`).
- Unused parameters must be prefixed with `_` (ESLint `argsIgnorePattern: '^_'`).

## Testing Guidelines

- Framework: Vitest (`tests/**/*.test.ts`).
- Add unit tests for new logic and regression tests for bug/security fixes.
- Keep fixtures deterministic; place reusable inputs under `tests/fixtures/`.

## Commit & Pull Request Guidelines

- Use Conventional Commits as in history: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:` (optional scopes like `fix(docs):`).
- Before opening a PR, run `npm run preflight`.
- PRs should include: what changed, how to verify (commands/output), and links to issues. If changing YAML in `framework/` or `examples/`, ensure schema/validation stays green in CI.

## Security & Configuration Tips

- Use `.env.example` for local setup; never commit `.env` or API keys.
- Optional: enable hooks with `pre-commit install` to run gitleaks/YAML/JSON checks locally.
- Follow the repo security policy in `SECURITY.md` for vulnerability reporting.
