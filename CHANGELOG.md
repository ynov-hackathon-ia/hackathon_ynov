# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Ollama deployment runbook with `setup_ollama.sh`, `check_lfs.sh` and
  `healthcheck.py` helper scripts.
- Streamlit chat interface (`rendu/devweb`) with live connection status.
- Continuous integration: ruff lint/format, Streamlit smoke test, shellcheck,
  hadolint and gitleaks secret scanning.
- Pre-commit hooks, ruff configuration and Dependabot updates.
- Project documentation: README, CONTRIBUTING, SECURITY, Code of Conduct,
  issue/PR templates and CODEOWNERS.

### Fixed

- `check_lfs.sh` now derives the LFS file list dynamically instead of a hardcoded
  list that omitted tracked files.
