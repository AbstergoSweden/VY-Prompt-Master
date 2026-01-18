# Contributing to VY Prompt Master

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

---

## Code of Conduct

By participating in this project, you agree to:

- Be respectful and inclusive
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards others

---

## How to Contribute

### Reporting Issues

**Before creating an issue:**

1. Search existing issues to avoid duplicates
2. Check the documentation for answers

**When creating an issue:**

- Use a descriptive title
- Provide steps to reproduce (for bugs)
- Include relevant context and environment details
- Use the appropriate issue template

### Suggesting Enhancements

1. Open an issue with the "enhancement" label
2. Describe the current behavior and your proposed change
3. Explain why this would be useful
4. Include examples if possible

### Contributing Code/Documentation

1. **Fork** the repository
2. **Create a branch** from `main`:

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
4. **Validate** your changes:

   ```bash
   npx yaml-lint framework/*.yaml
   npx yaml-lint examples/**/*.yaml
   ```

5. **Commit** with a clear message:

   ```bash
   git commit -m "feat: add new validation rule for X"
   ```

6. **Push** to your fork
7. **Open a Pull Request**

---

## Style Guide

### YAML Files

- Use 2-space indentation
- Use ASCII characters only (no smart quotes)
- Follow the existing file structure
- Validate against schema before submitting

### Markdown Files

- Use ATX-style headers (`# Header`)
- Include a table of contents for long documents
- Use fenced code blocks with language hints
- Keep lines under 100 characters when practical

### Commit Messages

Follow conventional commit format:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation only
- `style:` Formatting, no logic change
- `refactor:` Code change without feature/fix
- `test:` Adding tests
- `chore:` Maintenance

**Example:**

```text
feat: add fallback validation to schema

Added required validation for fallback_paths field to ensure
all critical steps have at least one fallback option.
```

---

## Pull Request Process

1. **Ensure all validation passes**
2. **Update documentation** if needed (FILE-TREE.md, etc.)
3. **Request review** from maintainers
4. **Address feedback** promptly
5. **Squash commits** if requested

### PR Requirements

- [ ] All YAML files pass validation
- [ ] Documentation updated if applicable
- [ ] No breaking changes without discussion
- [ ] Commit messages follow convention

---

## Development Setup

### Prerequisites

- Git
- Node.js 18+
- YAML-aware editor

### Getting Started

```bash
# Clone your fork
git clone https://github.com/YOUR-USERNAME/VY-Prompt-Master.git
cd VY-Prompt-Master

# Install validation tools
npm install -g ajv-cli yaml-lint markdownlint-cli

# Make your changes and validate
npx yaml-lint framework/*.yaml
```

---

## Recognition

Contributors who make significant contributions will be:

- Mentioned in release notes
- Added to CONTRIBUTORS file (if created)
- Credited in documentation where appropriate

---

## Questions?

- Open an issue for general questions
- Review existing documentation
- Check closed issues for similar questions

Thank you for contributing! 🎉
