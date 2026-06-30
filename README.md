# TechCorp AI Chat

[![CI](https://github.com/HeliosMARTIN/hackathon_ynov/actions/workflows/ci.yml/badge.svg?branch=dev)](https://github.com/HeliosMARTIN/hackathon_ynov/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Python 3.10+](https://img.shields.io/badge/python-3.10%2B-blue.svg)](https://www.python.org/)
[![Code style: ruff](https://img.shields.io/badge/code%20style-ruff-261230.svg)](https://github.com/astral-sh/ruff)

A finance-focused conversational assistant: the **Phi-3.5-Financial** model served
through a local inference server and exposed via a real-time web chat. Built during
a 7-hour AI hackathon (Ynov), with a parallel R&D track for an experimental
medical model still tracked separately from the production demo.

> **Context:** this project was handed over as a "compromised inheritance" — part of
> the challenge is to audit the legacy code, models and data for tampering before
> shipping. See [Security](#security).

---

## Architecture

```
                 ┌──────────────────┐       ┌──────────────────────┐
   Browser  ───► │  React/Vite UI   │ ─HTTP►│  Ollama inference     │
                 │  rendu/devweb    │       │  techcorp-financial   │
                 └──────────────────┘       │  (base: phi3.5)       │
                                            └──────────────────────┘
```

- **Inference** — [Ollama](https://ollama.com) serving `techcorp-financial`, built
  from [`ollama_server/Modelfile`](ollama_server/Modelfile).
- **Web UI** — a React/Vite chat app ([`rendu/devweb/web`](rendu/devweb/web))
  that talks to `POST /api/chat`, streams answers, and shows live connection
  status. The legacy Streamlit app remains available as a fallback.
- **R&D** — experimental LoRA medical fine-tune, documented in
  [`medical_project/`](medical_project/Readme.md).

## Quickstart

### Local launcher

The easiest cross-platform entrypoint is the Python launcher. It works on macOS,
Linux and Windows, and prints the missing install steps when Python, Node.js,
Git LFS or Ollama is not available.

```bash
python scripts/dev.py doctor
python scripts/dev.py setup
python scripts/dev.py model
python scripts/dev.py all
```

On Windows, use `py -3 scripts\dev.py ...` if `python` is not on `PATH`.

Useful commands:

| Command | What it does |
| ------- | ------------ |
| `python scripts/dev.py backend` | Starts the Ollama backend only |
| `python scripts/dev.py frontend` | Starts the React/Vite frontend only |
| `python scripts/dev.py streamlit` | Starts the legacy Streamlit UI only |
| `python scripts/dev.py all` | Starts Ollama plus the React frontend |
| `python scripts/dev.py all --ui both` | Starts Ollama, React and Streamlit |

If the model is not ready yet, run `python scripts/dev.py model` once. For a
single first-time setup that also prepares the model, run
`python scripts/dev.py setup --with-model`.

### Prerequisites

- [Ollama](https://ollama.com/download)
- Python 3.10+
- Git LFS (to materialize the inherited model/datasets)

### 1. Start the inference server

```bash
./rendu/infra/scripts/setup_ollama.sh      # pulls phi3.5, builds techcorp-financial
ollama serve                                # serves http://localhost:11434
```

Verify it:

```bash
python3 rendu/infra/scripts/healthcheck.py
```

### 2. Launch the web interface

```bash
python scripts/dev.py frontend
```

The React UI is now at <http://localhost:5173>.

Legacy Streamlit fallback:

```bash
python scripts/dev.py streamlit
```

### Configuration

| Variable          | Default                  | Description              |
| ----------------- | ------------------------ | ------------------------ |
| `VITE_OLLAMA_BASE_URL` | `http://localhost:11434` | Ollama API base URL for React |
| `OLLAMA_BASE_URL`      | `http://localhost:11434` | Ollama API base URL for scripts/Streamlit |
| `MODEL_NAME`           | `techcorp-financial`     | Model to query from Streamlit |

## Repository layout

```
.
├── ollama_server/        # Ollama Modelfile for techcorp-financial
├── tritton_server/       # Bonus: Triton Inference Server dockerized
├── model_repository/     # Bonus: Triton configuration (Python backend)
├── models/               # Inherited Phi-3.5-Financial LoRA adapter (Git LFS)
├── datasets/             # Inherited finance datasets (Git LFS)
├── medical_project/      # Experimental medical fine-tune guidance (R&D)
├── scripts/              # Training / CLI chat scripts
├── logs/                 # Inherited logs & notes (audit material)
├── rendu/                # Deliverables, one folder per role
│   ├── infra/            #   inference deployment + helper scripts
│   ├── devweb/           #   React chat interface + Streamlit fallback
│   ├── ia/               #   model evaluation + medical status
│   ├── data/             #   dataset analysis & cleaning
│   └── cyber/            #   security audit & robustness report
└── docs/                 # Project brief and reference docs
```

## Deliverables by role

| Role        | Deliverable                                              |
| ----------- | ------------------------------------------------------- |
| **Infra**   | [Ollama deployment runbook](rendu/infra/README.md)      |
| **Dev Web** | [React chat interface + Streamlit fallback](rendu/devweb/README.md) |
| **IA**      | [Model evaluation & medical status](rendu/ia/README.md) |
| **Data**    | [Dataset analysis & cleaning](rendu/data/README.md)     |
| **Cyber**   | [Security audit report](rendu/cyber/README.md)          |

Project pilot notes: [`rendu/00-pilotage.md`](rendu/00-pilotage.md) ·
Oral presentation: [`rendu/presentation.md`](rendu/presentation.md)

## Security

This repository was intentionally seeded with a compromised model/dataset as part
of the challenge. The Cyber and Data tracks confirmed a backdoor and poisoned
finance datasets. **Do not deploy the inherited financial adapter.** The demo path
uses a clean `phi3.5` base through Ollama. Findings, evidence and recommendations
live in the [Cyber audit report](rendu/cyber/README.md). To report a new issue,
see [SECURITY.md](SECURITY.md).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the branch model, Conventional Commits
convention, and the local quality gates (ruff, pre-commit). All pull requests run
through [CI](.github/workflows/ci.yml).

## License

Released under the [MIT License](LICENSE).
