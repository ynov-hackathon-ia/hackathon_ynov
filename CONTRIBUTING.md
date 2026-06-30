# Contributing

Quality gates for the TechCorp AI Chat project. Everything here runs automatically
in CI; running it locally just gives faster feedback.

## Branches

- `main` — stable, protected.
- `dev` — integration branch for the hackathon deliverables.
- Work happens on short-lived branches: `feat/...`, `fix/...`, `ci/...`, `infra/...`.

Open a pull request into `dev`; CI must be green before merge.

## Commit messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>: <short imperative summary>
```

Common types: `feat`, `fix`, `ci`, `build`, `chore`, `docs`, `style`, `refactor`.

## Local setup

```bash
python -m pip install ruff pre-commit
pre-commit install          # run the hooks on every commit
```

## Checks

| Check         | Command                       | CI job          |
| ------------- | ----------------------------- | --------------- |
| Lint          | `ruff check .`                | `lint-python`   |
| Format        | `ruff format --check .`       | `lint-python`   |
| Web app smoke | `python -m py_compile rendu/devweb/app.py` | `smoke-devweb` |
| Shell scripts | `shellcheck rendu/infra/scripts/*.sh`      | `lint-shell`   |
| Dockerfile    | `hadolint tritton_server/Dockerfile`       | `lint-docker`  |
| Secrets       | `gitleaks detect`             | `secret-scan`   |

Auto-fix most issues before committing:

```bash
ruff check --fix .
ruff format .
```

## CI

`.github/workflows/ci.yml` runs the table above on every push to `main`/`dev`
and on every pull request. Action versions are pinned and kept current by
Dependabot (`.github/dependabot.yml`).
