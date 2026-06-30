# TechCorp AI Chat

[![CI](https://github.com/HeliosMARTIN/hackathon_ynov/actions/workflows/ci.yml/badge.svg?branch=dev)](https://github.com/HeliosMARTIN/hackathon_ynov/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Python 3.10+](https://img.shields.io/badge/python-3.10%2B-blue.svg)](https://www.python.org/)
[![Code style: ruff](https://img.shields.io/badge/code%20style-ruff-261230.svg)](https://github.com/astral-sh/ruff)

A finance-focused conversational assistant: the **Phi-3.5-Financial** model served
through a local inference server and exposed via a real-time web chat. Built during
a 7-hour AI hackathon (Ynov), with a parallel R&D track fine-tuning an experimental
medical model.

> **Context:** this project was handed over as a "compromised inheritance" — part of
> the challenge is to audit the legacy code, models and data for tampering before
> shipping. See [Security](#security).

---

## Architecture

```
                 ┌─────────────────┐        ┌──────────────────────┐
   Browser  ───► │  Streamlit UI   │ ─HTTP─►│  Ollama inference     │
                 │  rendu/devweb   │        │  techcorp-financial   │
                 └─────────────────┘        │  (base: phi3.5)       │
                                            └──────────────────────┘
```

- **Inference** — [Ollama](https://ollama.com) serving `techcorp-financial`, built
  from [`ollama_server/Modelfile`](ollama_server/Modelfile). A Triton Inference
  Server configuration is also provided in [`tritton_server/`](tritton_server/) as
  an advanced alternative.
- **Web UI** — a Streamlit chat app ([`rendu/devweb/app.py`](rendu/devweb/app.py))
  that talks to `POST /api/chat` and shows live connection status.
- **R&D** — experimental LoRA medical fine-tune, documented in
  [`medical_project/`](medical_project/Readme.md).

## Quickstart

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
cd rendu/devweb
pip install -r requirements.txt
OLLAMA_BASE_URL=http://localhost:11434 streamlit run app.py
```

The UI is now at <http://localhost:8501>.

### Configuration

| Variable          | Default                  | Description              |
| ----------------- | ------------------------ | ------------------------ |
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Ollama API base URL      |
| `MODEL_NAME`      | `techcorp-financial`     | Model to query           |

## Repository layout

```
.
├── ollama_server/        # Ollama Modelfile for techcorp-financial
├── tritton_server/       # Triton Inference Server config (advanced option)
├── model_repository/     # Triton Python backend for the financial model
├── models/               # Inherited Phi-3.5-Financial LoRA adapter (Git LFS)
├── datasets/             # Inherited finance datasets (Git LFS)
├── medical_project/      # Experimental medical fine-tune (R&D)
├── scripts/              # Training / CLI chat scripts
├── logs/                 # Inherited logs & notes (audit material)
├── rendu/                # Deliverables, one folder per role
│   ├── infra/            #   inference deployment + helper scripts
│   ├── devweb/           #   Streamlit chat interface
│   ├── ia/               #   model evaluation + medical fine-tune
│   ├── data/             #   dataset analysis & cleaning
│   └── cyber/            #   security audit & robustness report
└── docs/                 # Project brief and reference docs
```

## Deliverables by role

| Role        | Deliverable                                              |
| ----------- | ------------------------------------------------------- |
| **Infra**   | [Ollama deployment runbook](rendu/infra/README.md)      |
| **Dev Web** | [Streamlit chat interface](rendu/devweb/README.md)      |
| **IA**      | [Model evaluation & medical fine-tune](rendu/ia/README.md) |
| **Data**    | [Dataset analysis & cleaning](rendu/data/README.md)     |
| **Cyber**   | [Security audit report](rendu/cyber/README.md)          |

Project pilot notes: [`rendu/00-pilotage.md`](rendu/00-pilotage.md) ·
Oral presentation: [`rendu/presentation.md`](rendu/presentation.md)

## Security

This repository was intentionally seeded with a compromised model/dataset as part
of the challenge. Inherited logs flag a probable backdoor and an associated trigger
phrase. **Do not present the inherited financial adapter as production-ready until
the Cyber and Data tracks have validated it.** Findings, evidence and recommendations
live in the [Cyber audit report](rendu/cyber/README.md). To report a new issue, see
[SECURITY.md](SECURITY.md).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the branch model, Conventional Commits
convention, and the local quality gates (ruff, pre-commit). All pull requests run
through [CI](.github/workflows/ci.yml).

## License

Released under the [MIT License](LICENSE).
