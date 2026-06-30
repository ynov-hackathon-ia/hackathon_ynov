#!/usr/bin/env bash
set -u

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
cd "$ROOT_DIR" || exit 1

echo "== Git LFS status =="

has_lfs=0
if ! git lfs version >/dev/null 2>&1; then
  echo "WARN: git lfs is not installed or not available in PATH."
  echo "Install it, then run:"
  echo "  git lfs install"
  echo "  git lfs pull"
else
  has_lfs=1
  git lfs version
fi

# Discover the tracked large files dynamically so the list never drifts as
# files are added. Prefer LFS's own view; fall back to the .gitattributes
# filter so the check still works when git-lfs is missing. (bash 3.2 safe:
# no mapfile.)
FILES=()
if [[ "$has_lfs" -eq 1 ]]; then
  while IFS= read -r f; do
    [[ -n "$f" ]] && FILES+=("$f")
  done < <(git lfs ls-files -n 2>/dev/null)
fi

if [[ "${#FILES[@]}" -eq 0 ]]; then
  while IFS= read -r f; do
    [[ -n "$f" ]] && FILES+=("$f")
  done < <(git ls-files | git check-attr --stdin filter | sed -n 's/: filter: lfs$//p')
fi

if [[ "${#FILES[@]}" -eq 0 ]]; then
  echo
  echo "WARN: no LFS-tracked files found to check."
  exit 0
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
