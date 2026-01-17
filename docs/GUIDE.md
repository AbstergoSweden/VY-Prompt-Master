# Guide

This guide provides instructions on using VY Prompt Master to create and manage prompts.

## Creating a Prompt
- Choose a persona YAML from the `personas/` directory or create your own following the schema.
- Draft your prompt using the guidelines in `docs/VY-Meta-Prompt-Quick-Reference.md`.
- Test prompts using the CI workflow or your own environment.

## Running Workflows
- The GitHub Actions workflow in `.github/workflows/ci.yml` checks that the repository builds.
- You can add additional jobs to validate prompts or run tests.

## Contributing
- Please read `docs/LEGAL.md` for licensing information.
- Update `CODEOWNERS` to add maintainers.
