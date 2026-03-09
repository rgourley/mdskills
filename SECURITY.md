# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in mdskills.ai, please report it responsibly.

**Do NOT open a public GitHub issue for security vulnerabilities.**

Instead, email: **security@mdskills.ai**

Or use [GitHub's private vulnerability reporting](https://github.com/rgourley/mdskills/security/advisories/new).

### What to include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if you have one)

### Response timeline

- **Acknowledgment**: Within 48 hours
- **Assessment**: Within 1 week
- **Fix**: As soon as possible, depending on severity

### Scope

The following are in scope:
- mdskills.ai website (Next.js application)
- API endpoints (`/api/*`)
- Authentication and authorization
- Data exposure or leakage
- CLI tool (`npx mdskills`)

The following are out of scope:
- Third-party skills listed on the marketplace (report to the skill author)
- Supabase infrastructure (report to Supabase)
- Denial of service attacks

## Supported Versions

Only the latest version on `main` is supported with security updates.
