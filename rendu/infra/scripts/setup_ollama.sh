#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
cd "$ROOT_DIR"

OLLAMA_BASE_MODEL="${OLLAMA_BASE_MODEL:-phi3.5}"
OLLAMA_MODEL="${OLLAMA_MODEL:-techcorp-financial}"
MODELDIR="${MODELDIR:-ollama_server/Modelfile}"

if ! command -v ollama >/dev/null 2>&1; then
  echo "ERROR: ollama is not installed or not available in PATH." >&2
  echo "Install Ollama from https://ollama.com/download, then rerun this script." >&2
  exit 1
fi

if [[ ! -f "$MODELDIR" ]]; then
  echo "ERROR: Modelfile not found at $MODELDIR" >&2
  exit 1
fi

echo "== Ollama version =="
ollama --version

echo
echo "== Pull base model: $OLLAMA_BASE_MODEL =="
ollama pull "$OLLAMA_BASE_MODEL"

echo
echo "== Create/update model: $OLLAMA_MODEL =="
ollama create "$OLLAMA_MODEL" -f "$MODELDIR"

echo
echo "== Available models =="
ollama list

echo
echo "Model '$OLLAMA_MODEL' is ready."
echo "Run: python3 rendu/infra/scripts/healthcheck.py"
