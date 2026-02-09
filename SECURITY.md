# Security Policy

## Supported Versions

| Version       | Supported |
| ------------- | --------- |
| 0.1.0-alpha   | Yes       |

## Reporting a Vulnerability

If you discover a security vulnerability in Lumira, please report it responsibly.

**Do NOT open a public issue.**

Instead, email: **security@lumiraos.dev**

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We will respond within 48 hours and work with you on a fix before public disclosure.

## Security Design

Lumira is designed with safety as a core principle:

- **Dry-run by default** — No transactions are sent unless explicitly opted out with `--no-dry-run`
- **Audit logging** — Every action is logged with timestamp, command, provider, and result
- **No secret storage** — Lumira does not store private keys, seeds, or credentials
- **Plugin validation** — All providers are validated against the manifest contract before use
- **No auto-send** — Transaction building and sending are separate steps
