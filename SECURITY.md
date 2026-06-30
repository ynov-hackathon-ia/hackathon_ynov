# Security Policy

## Scope

This is a hackathon project. It intentionally ships with a **compromised inherited
model and dataset** as part of the challenge — the planted backdoor and trigger
phrase are documented in the [Cyber audit report](rendu/cyber/README.md) and are
**not** considered vulnerabilities to report here.

## Reporting a vulnerability

For any *new* security issue (something not already covered by the audit report):

- Open a [GitHub issue](../../issues) using the **Bug report** template and prefix
  the title with `[security]`, **or**
- Contact a maintainer listed in [CODEOWNERS](.github/CODEOWNERS) directly.

Please include reproduction steps and the affected file(s) / commit.

## Handling secrets

- Never commit credentials, tokens, or `.env` files (`.env` is git-ignored).
- The CI pipeline runs [gitleaks](https://github.com/gitleaks/gitleaks) on every
  push and pull request to catch accidental secret leaks.
