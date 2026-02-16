# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.0.x (latest) | ✅ |
| < 1.0.0 | ❌ |

## Reporting a Vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

Please use one of the following methods:

### Option 1 — GitHub Private Vulnerability Reporting (preferred)
Use the **"Report a vulnerability"** button on the [Security tab](https://github.com/aos01/oss-ma/security/advisories/new).

### Option 2 — Email
Send a detailed report to the maintainer via the email listed on the [npm package page](https://www.npmjs.com/package/@oss-ma/tpl).

## What to Include

- Description of the vulnerability
- Steps to reproduce
- Affected versions
- Potential impact
- Suggested fix (optional)

## Response Timeline

| Step | Timeframe |
|------|-----------|
| Acknowledgement | Within 48 hours |
| Initial assessment | Within 7 days |
| Fix & disclosure | Within 90 days |

## Security Measures

This project implements the following security controls:

- **OIDC Trusted Publishing** — no npm tokens stored in CI
- **SLSA Level 3 provenance** — all releases are signed and verifiable
- **CodeQL SAST** — automated static analysis on every push
- **Dependabot** — automated dependency vulnerability alerts
- **Secret scanning** — GitHub scans all commits for leaked secrets
- **Path traversal protection** — all file operations use safe path guards
- **Shell injection protection** — hooks run with `shell: false`