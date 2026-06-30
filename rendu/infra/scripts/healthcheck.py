#!/usr/bin/env python3
import json
import os
import sys
import urllib.error
import urllib.request

BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434").rstrip("/")
MODEL = os.getenv("OLLAMA_MODEL", "techcorp-financial")
TIMEOUT_SECONDS = float(os.getenv("OLLAMA_HEALTHCHECK_TIMEOUT", "30"))


def fail(message: str, code: int = 1) -> None:
    print(f"ERROR: {message}", file=sys.stderr)
    sys.exit(code)


def request_json(method: str, path: str, payload: dict | None = None) -> dict:
    body = None
    headers = {"Accept": "application/json"}

    if payload is not None:
        body = json.dumps(payload).encode("utf-8")
        headers["Content-Type"] = "application/json"

    request = urllib.request.Request(
        f"{BASE_URL}{path}",
        data=body,
        headers=headers,
        method=method,
    )

    try:
        with urllib.request.urlopen(request, timeout=TIMEOUT_SECONDS) as response:
            raw = response.read().decode("utf-8")
    except urllib.error.URLError as exc:
        fail(f"cannot reach Ollama at {BASE_URL}: {exc}")

    try:
        return json.loads(raw)
    except json.JSONDecodeError as exc:
        fail(f"Ollama returned invalid JSON on {path}: {exc}")


def main() -> None:
    print(f"Checking Ollama at {BASE_URL}")
    tags = request_json("GET", "/api/tags")
    models = [item.get("name", "") for item in tags.get("models", [])]

    if not models:
        fail("Ollama is reachable but no models are installed.", 2)

    if MODEL not in models and not any(name.startswith(f"{MODEL}:") for name in models):
        print("Installed models:")
        for name in models:
            print(f"  - {name}")
        fail(
            f"model '{MODEL}' is not installed. Run ./rendu/infra/scripts/setup_ollama.sh",
            3,
        )

    print(f"Model found: {MODEL}")

    payload = {
        "model": MODEL,
        "stream": False,
        "messages": [
            {
                "role": "user",
                "content": "Explique le ROI en deux phrases.",
            }
        ],
    }
    chat = request_json("POST", "/api/chat", payload)
    answer = chat.get("message", {}).get("content", "").strip()

    if not answer:
        fail("chat endpoint responded without message.content", 4)

    print("Chat endpoint OK")
    print("--- Sample answer ---")
    print(answer)


if __name__ == "__main__":
    main()
