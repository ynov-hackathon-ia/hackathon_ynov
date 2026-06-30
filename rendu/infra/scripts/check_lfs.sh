#!/usr/bin/env bash
set -u

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
cd "$ROOT_DIR" || exit 1

FILES=(
  "datasets/finance_dataset_final.json"
  "datasets/test_dataset_16000.json"
  "models/phi3_financial/adapter_config.json"
  "models/phi3_financial/adapter_model.safetensors"
  "models/phi3_financial/tokenizer.json"
  "models/phi3_financial/tokenizer_config.json"
)

echo "== Git LFS status =="

if ! git lfs version >/dev/null 2>&1; then
  echo "WARN: git lfs is not installed or not available in PATH."
  echo "Install it, then run:"
  echo "  git lfs install"
  echo "  git lfs pull"
else
  git lfs version
fi

echo
echo "== Tracked large-file checks =="

missing=0
pointers=0
materialized=0

for file in "${FILES[@]}"; do
  if [[ ! -f "$file" ]]; then
    echo "MISSING  $file"
    missing=$((missing + 1))
    continue
  fi

  if head -n 1 "$file" | grep -q "version https://git-lfs.github.com/spec/v1"; then
    echo "POINTER  $file"
    pointers=$((pointers + 1))
  else
    bytes="$(wc -c < "$file" | tr -d ' ')"
    echo "OK       $file (${bytes} bytes)"
    materialized=$((materialized + 1))
  fi
done

echo
echo "Summary: ${materialized} materialized, ${pointers} LFS pointers, ${missing} missing."

if [[ "$pointers" -gt 0 || "$missing" -gt 0 ]]; then
  echo "ACTION: resolve Git LFS before validating inherited datasets/adapters."
  exit 2
fi

echo "All checked LFS files are materialized."
