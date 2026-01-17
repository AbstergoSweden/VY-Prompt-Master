# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 3.x     | :white_check_mark: |
| 2.x     | :x:                |
| 1.x     | :x:                |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please report it responsibly.

### How to Report

1. **Do NOT** create a public GitHub issue for security vulnerabilities
2. **Email**: <security@example.com> (replace with actual contact)
3. **GitHub Security Advisories**: Use the "Security" tab to report privately

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested fixes

### Response Timeline

- **Acknowledgment**: Within 48 hours
- **Initial Assessment**: Within 7 days
- **Fix/Patch**: Depends on severity (critical: ASAP, others: within 30 days)
- **Public Disclosure**: After fix is released

### Security Considerations

This repository contains **documentation and specification files only**, not executable code. However, security concerns may include:

- **Schema vulnerabilities** that could allow malicious prompts to pass validation
- **Documentation errors** that could lead to unsafe automation practices
- **Prompt injection** patterns that could bypass safety gates

### Safe Automation Practices

When using this framework:

1. **Never include credentials** in prompt specifications
2. **Always use safety gates** for irreversible actions
3. **Validate outputs** before execution
4. **Review generated prompts** before running on production systems
5. **Keep the framework updated** for latest security improvements

### Acknowledgments

We appreciate responsible disclosure and will credit security researchers who:

- Report vulnerabilities responsibly
- Allow reasonable time for fixes
- Do not publicly disclose before a fix is available

---

**Contact**: <security@example.com> | [GitHub Security Advisories](../../security/advisories)
