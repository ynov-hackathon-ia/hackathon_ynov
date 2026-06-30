#!/usr/bin/env python3
"""Cross-platform launcher for the local TechCorp AI Chat app."""

from __future__ import annotations

import argparse
import json
import os
import platform
import shlex
import shutil
import signal
import subprocess
import sys
import time
import urllib.error
import urllib.request
from collections.abc import Sequence
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[1]
DEVWEB_DIR = ROOT_DIR / "rendu" / "devweb"
WEB_DIR = DEVWEB_DIR / "web"
VENV_DIR = DEVWEB_DIR / ".venv"
REQUIREMENTS_FILE = DEVWEB_DIR / "requirements.txt"
MODELFILE = ROOT_DIR / "ollama_server" / "Modelfile"

MIN_PYTHON = (3, 10)
DEFAULT_OLLAMA_URL = "http://localhost:11434"
DEFAULT_MODEL = "techcorp-financial"
DEFAULT_BASE_MODEL = "phi3.5"
DEFAULT_FRONTEND_HOST = "127.0.0.1"
DEFAULT_FRONTEND_PORT = "5173"


class LauncherError(RuntimeError):
    """Raised when a prerequisite or command blocks local startup."""


def format_cmd(cmd: Sequence[str]) -> str:
    if os.name == "nt":
        return subprocess.list2cmdline(list(cmd))
    return " ".join(shlex.quote(part) for part in cmd)


def print_step(message: str) -> None:
    print(f"\n== {message} ==")


def run(
    cmd: Sequence[str],
    cwd: Path = ROOT_DIR,
    env: dict[str, str] | None = None,
    check: bool = True,
) -> subprocess.CompletedProcess[str]:
    print(f"$ {format_cmd(cmd)}")
    result = subprocess.run(
        list(cmd),
        cwd=str(cwd),
        env=env,
        text=True,
        check=False,
    )
    if check and result.returncode != 0:
        raise LauncherError(f"Command failed with exit code {result.returncode}.")
    return result


def popen(
    cmd: Sequence[str],
    cwd: Path = ROOT_DIR,
    env: dict[str, str] | None = None,
) -> subprocess.Popen[str]:
    print(f"$ {format_cmd(cmd)}")
    kwargs: dict[str, object] = {
        "cwd": str(cwd),
        "env": env,
        "text": True,
    }
    if os.name == "nt":
        kwargs["creationflags"] = subprocess.CREATE_NEW_PROCESS_GROUP
    else:
        kwargs["start_new_session"] = True
    return subprocess.Popen(list(cmd), **kwargs)


def install_hint(tool: str) -> str:
    system = platform.system().lower()
    if tool == "python":
        if system == "darwin":
            return "Install Python 3.10+: brew install python@3.11"
        if system == "windows":
            return "Install Python 3.10+: winget install Python.Python.3.12"
        return "Install Python 3.10+ and venv, for example: sudo apt install python3.11 python3.11-venv"
    if tool == "node":
        if system == "darwin":
            return "Install Node.js 20+: brew install node"
        if system == "windows":
            return "Install Node.js 20+: winget install OpenJS.NodeJS.LTS"
        return "Install Node.js 20+ and npm, for example: sudo apt install nodejs npm"
    if tool == "git-lfs":
        if system == "darwin":
            return "Install Git LFS: brew install git-lfs && git lfs install"
        if system == "windows":
            return "Install Git LFS: winget install GitHub.GitLFS && git lfs install"
        return (
            "Install Git LFS, for example: sudo apt install git-lfs && git lfs install"
        )
    if tool == "ollama":
        if system == "darwin":
            return "Install Ollama: brew install --cask ollama or https://ollama.com/download"
        if system == "windows":
            return "Install Ollama: winget install Ollama.Ollama or https://ollama.com/download"
        return "Install Ollama: curl -fsSL https://ollama.com/install.sh | sh"
    return f"Install {tool} and make sure it is available in PATH."


def parse_version(text: str) -> tuple[int, ...]:
    cleaned = text.strip().lstrip("v")
    parts: list[int] = []
    for part in cleaned.split("."):
        digits = "".join(ch for ch in part if ch.isdigit())
        if digits == "":
            break
        parts.append(int(digits))
    return tuple(parts)


def command_output(cmd: Sequence[str]) -> str | None:
    try:
        result = subprocess.run(
            list(cmd),
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            check=False,
        )
    except OSError:
        return None
    if result.returncode != 0:
        return None
    return result.stdout.strip()


def python_candidates() -> list[list[str]]:
    candidates: list[list[str]] = [[sys.executable]]
    if os.name == "nt":
        candidates.extend(
            [
                ["py", "-3.12"],
                ["py", "-3.11"],
                ["py", "-3.10"],
                ["python"],
                ["python3"],
            ]
        )
    else:
        candidates.extend(
            [
                ["python3.12"],
                ["python3.11"],
                ["python3.10"],
                ["python3"],
                ["python"],
            ]
        )

    seen: set[str] = set()
    unique: list[list[str]] = []
    for cmd in candidates:
        key = "\0".join(cmd)
        if key not in seen:
            seen.add(key)
            unique.append(cmd)
    return unique


def python_version(cmd: Sequence[str]) -> tuple[int, ...] | None:
    output = command_output(
        list(cmd)
        + [
            "-c",
            "import sys; print('.'.join(map(str, sys.version_info[:3])))",
        ]
    )
    if output is None:
        return None
    return parse_version(output.splitlines()[-1])


def find_python() -> tuple[list[str], tuple[int, ...]] | None:
    for cmd in python_candidates():
        version = python_version(cmd)
        if version is not None and version >= MIN_PYTHON:
            return list(cmd), version
    return None


def venv_python() -> Path:
    if os.name == "nt":
        return VENV_DIR / "Scripts" / "python.exe"
    return VENV_DIR / "bin" / "python"


def executable_version(cmd: Sequence[str]) -> tuple[int, ...] | None:
    output = command_output(list(cmd) + ["--version"])
    if output is None:
        return None
    return parse_version(output.splitlines()[0].split()[-1])


def ensure_python_deps(force: bool = False) -> None:
    selected = find_python()
    if selected is None:
        raise LauncherError(install_hint("python"))

    python_cmd, version = selected
    py_in_venv = venv_python()
    existing_version = (
        python_version([str(py_in_venv)]) if py_in_venv.exists() else None
    )

    if force and VENV_DIR.exists():
        print_step("Recreate Python virtualenv")
        shutil.rmtree(VENV_DIR)

    if existing_version is not None and existing_version < MIN_PYTHON:
        print_step("Recreate Python virtualenv with Python 3.10+")
        print(
            "Existing virtualenv uses "
            f"Python {'.'.join(map(str, existing_version))}; "
            f"using {format_cmd(python_cmd)}."
        )
        shutil.rmtree(VENV_DIR)

    if not py_in_venv.exists():
        print_step(
            f"Create Python virtualenv with Python {'.'.join(map(str, version))}"
        )
        run(python_cmd + ["-m", "venv", str(VENV_DIR)])

    import_check = command_output(
        [str(py_in_venv), "-c", "import requests, streamlit; print('ok')"]
    )
    if force or import_check != "ok":
        print_step("Install Python dependencies")
        run([str(py_in_venv), "-m", "pip", "install", "-r", str(REQUIREMENTS_FILE)])
    else:
        print("Python dependencies already available.")


def node_version() -> tuple[int, ...] | None:
    return executable_version(["node"])


def ensure_node() -> None:
    version = node_version()
    if version is None:
        raise LauncherError(install_hint("node"))
    if version < (20, 0, 0):
        pretty = ".".join(map(str, version))
        raise LauncherError(f"Node.js {pretty} is too old. {install_hint('node')}")
    if shutil.which("npm") is None:
        raise LauncherError(install_hint("node"))


def ensure_frontend_deps(force: bool = False) -> None:
    ensure_node()
    node_modules = WEB_DIR / "node_modules"
    if force and node_modules.exists():
        print_step("Remove existing frontend dependencies")
        shutil.rmtree(node_modules)

    if node_modules.exists() and not force:
        print("Frontend dependencies already available.")
        return

    print_step("Install frontend dependencies")
    if (WEB_DIR / "package-lock.json").exists():
        run(["npm", "ci"], cwd=WEB_DIR)
    else:
        run(["npm", "install"], cwd=WEB_DIR)


def ollama_base_url() -> str:
    return (
        os.getenv("OLLAMA_BASE_URL")
        or os.getenv("VITE_OLLAMA_BASE_URL")
        or DEFAULT_OLLAMA_URL
    ).rstrip("/")


def http_json(path: str, timeout: float = 3.0) -> dict[str, object] | None:
    url = f"{ollama_base_url()}{path}"
    try:
        with urllib.request.urlopen(url, timeout=timeout) as response:
            return json.loads(response.read().decode("utf-8"))
    except (OSError, urllib.error.URLError, json.JSONDecodeError):
        return None


def ollama_running() -> bool:
    return http_json("/api/tags") is not None


def ensure_ollama_cli() -> None:
    if shutil.which("ollama") is None:
        raise LauncherError(install_hint("ollama"))


def wait_for_ollama(process: subprocess.Popen[str], timeout: float = 20.0) -> None:
    deadline = time.time() + timeout
    while time.time() < deadline:
        if process.poll() is not None:
            raise LauncherError(f"ollama serve exited with code {process.returncode}.")
        if ollama_running():
            return
        time.sleep(0.5)
    raise LauncherError("Ollama did not become ready on time.")


def start_ollama_if_needed() -> subprocess.Popen[str] | None:
    ensure_ollama_cli()
    if ollama_running():
        print(f"Ollama already running at {ollama_base_url()}.")
        return None

    print_step("Start Ollama backend")
    process = popen(["ollama", "serve"])
    wait_for_ollama(process)
    print(f"Ollama is ready at {ollama_base_url()}.")
    return process


def model_names() -> set[str]:
    data = http_json("/api/tags", timeout=5)
    if not data:
        return set()
    models = data.get("models")
    if not isinstance(models, list):
        return set()
    names = set()
    for item in models:
        if isinstance(item, dict) and isinstance(item.get("name"), str):
            names.add(item["name"].split(":")[0])
    return names


def terminate_process(process: subprocess.Popen[str]) -> None:
    if process.poll() is not None:
        return
    if os.name == "nt":
        process.terminate()
    else:
        try:
            os.killpg(os.getpgid(process.pid), signal.SIGTERM)
        except ProcessLookupError:
            return


def stop_process(process: subprocess.Popen[str]) -> None:
    terminate_process(process)
    try:
        process.wait(timeout=5)
    except subprocess.TimeoutExpired:
        process.kill()


def ensure_model(
    model: str,
    base_model: str,
    stop_started_server: bool = False,
) -> None:
    process = start_ollama_if_needed()
    try:
        if model in model_names():
            print(f"Ollama model '{model}' already available.")
            return
        if not MODELFILE.exists():
            raise LauncherError(f"Modelfile not found: {MODELFILE}")

        print_step(f"Prepare Ollama model {model}")
        run(["ollama", "pull", base_model])
        run(["ollama", "create", model, "-f", str(MODELFILE)])
    finally:
        if stop_started_server and process is not None:
            stop_process(process)


def wait_for_processes(processes: Sequence[subprocess.Popen[str]]) -> int:
    try:
        while True:
            for process in processes:
                code = process.poll()
                if code is not None:
                    for other in processes:
                        if other is not process:
                            terminate_process(other)
                    return code
            time.sleep(0.5)
    except KeyboardInterrupt:
        print("\nStopping local processes...")
        for process in processes:
            terminate_process(process)
        return 130


def frontend_env() -> dict[str, str]:
    env = os.environ.copy()
    env.setdefault("VITE_OLLAMA_BASE_URL", ollama_base_url())
    return env


def streamlit_env() -> dict[str, str]:
    env = os.environ.copy()
    env.setdefault("OLLAMA_BASE_URL", ollama_base_url())
    env.setdefault("MODEL_NAME", DEFAULT_MODEL)
    return env


def frontend_command(args: argparse.Namespace) -> list[str]:
    return [
        "npm",
        "run",
        "dev",
        "--",
        "--host",
        args.host,
        "--port",
        args.port,
    ]


def command_doctor(_args: argparse.Namespace) -> int:
    print_step("Doctor")

    selected_python = find_python()
    if selected_python is None:
        print(f"[MISSING] Python 3.10+: {install_hint('python')}")
    else:
        cmd, version = selected_python
        print(f"[OK] Python {'.'.join(map(str, version))}: {format_cmd(cmd)}")

    node = node_version()
    if node is None:
        print(f"[MISSING] Node.js 20+: {install_hint('node')}")
    elif node < (20, 0, 0):
        print(f"[MISSING] Node.js {'.'.join(map(str, node))}: {install_hint('node')}")
    else:
        print(f"[OK] Node.js {'.'.join(map(str, node))}")

    npm = executable_version(["npm"])
    if npm is None:
        print(f"[MISSING] npm: {install_hint('node')}")
    else:
        print(f"[OK] npm {'.'.join(map(str, npm))}")

    git_lfs = command_output(["git", "lfs", "version"])
    if git_lfs is None:
        print(f"[MISSING] Git LFS: {install_hint('git-lfs')}")
    else:
        print(f"[OK] {git_lfs}")

    ollama_version = command_output(["ollama", "--version"])
    if ollama_version is None:
        print(f"[MISSING] Ollama: {install_hint('ollama')}")
    else:
        version_line = next(
            (
                line
                for line in reversed(ollama_version.splitlines())
                if "version" in line.lower()
            ),
            ollama_version.splitlines()[-1],
        )
        version_line = version_line.removeprefix("Warning: ").strip()
        print(f"[OK] Ollama CLI: {version_line}")
        if ollama_running():
            names = model_names()
            model_status = "available" if DEFAULT_MODEL in names else "missing"
            print(f"[OK] Ollama server: {ollama_base_url()}")
            print(f"[INFO] Model {DEFAULT_MODEL}: {model_status}")
            if DEFAULT_MODEL not in names:
                print("       Run: python scripts/dev.py model")
        else:
            print("[INFO] Ollama server is not running.")
            print("       Run: python scripts/dev.py backend")

    print("\nRecommended first run:")
    print("  python scripts/dev.py setup")
    print("  python scripts/dev.py model")
    print("  python scripts/dev.py all")
    return 0


def command_setup(args: argparse.Namespace) -> int:
    ensure_python_deps(force=args.force)
    ensure_frontend_deps(force=args.force)

    if command_output(["git", "lfs", "version"]) is None:
        print(f"\n[MISSING] Git LFS: {install_hint('git-lfs')}")
    else:
        print_step("Configure Git LFS")
        run(["git", "lfs", "install"])

    if args.with_model:
        ensure_model(args.model, args.base_model, stop_started_server=True)
    elif shutil.which("ollama") is None:
        print(f"\n[MISSING] Ollama: {install_hint('ollama')}")
    elif not ollama_running():
        print("\n[INFO] Ollama is installed but not running.")
        print("       Run: python scripts/dev.py backend")
    elif args.model not in model_names():
        print(f"\n[INFO] Ollama model '{args.model}' is missing.")
        print("       Run: python scripts/dev.py model")

    print("\nSetup complete.")
    return 0


def command_model(args: argparse.Namespace) -> int:
    ensure_model(args.model, args.base_model, stop_started_server=True)
    return 0


def command_backend(args: argparse.Namespace) -> int:
    process = start_ollama_if_needed()
    if args.with_model:
        ensure_model(args.model, args.base_model)
    elif args.model not in model_names():
        print(f"\n[INFO] Ollama model '{args.model}' is missing.")
        print("       Run: python scripts/dev.py model")

    if process is None:
        return 0
    print("\nBackend is running. Press Ctrl+C to stop it.")
    return wait_for_processes([process])


def command_frontend(args: argparse.Namespace) -> int:
    if not args.no_install:
        ensure_frontend_deps(force=False)
    print_step("Start React frontend")
    process = popen(frontend_command(args), cwd=WEB_DIR, env=frontend_env())
    return wait_for_processes([process])


def command_streamlit(args: argparse.Namespace) -> int:
    if not args.no_install:
        ensure_python_deps(force=False)
    print_step("Start Streamlit UI")
    process = popen(
        [str(venv_python()), "-m", "streamlit", "run", "app.py"],
        cwd=DEVWEB_DIR,
        env=streamlit_env(),
    )
    return wait_for_processes([process])


def command_all(args: argparse.Namespace) -> int:
    if not args.no_install:
        if args.ui in {"streamlit", "both"}:
            ensure_python_deps(force=False)
        if args.ui in {"react", "both"}:
            ensure_frontend_deps(force=False)

    backend = start_ollama_if_needed()
    if args.with_model:
        ensure_model(args.model, args.base_model)
    elif args.model not in model_names():
        print(f"\n[INFO] Ollama model '{args.model}' is missing.")
        print("       Run: python scripts/dev.py model")

    processes: list[subprocess.Popen[str]] = []
    if backend is not None:
        processes.append(backend)

    if args.ui in {"react", "both"}:
        print_step("Start React frontend")
        processes.append(popen(frontend_command(args), cwd=WEB_DIR, env=frontend_env()))

    if args.ui in {"streamlit", "both"}:
        print_step("Start Streamlit UI")
        processes.append(
            popen(
                [str(venv_python()), "-m", "streamlit", "run", "app.py"],
                cwd=DEVWEB_DIR,
                env=streamlit_env(),
            )
        )

    print("\nLocal app is running. Press Ctrl+C to stop managed processes.")
    return wait_for_processes(processes)


def add_model_args(parser: argparse.ArgumentParser) -> None:
    parser.add_argument(
        "--model",
        default=os.getenv("MODEL_NAME", DEFAULT_MODEL),
        help=f"Ollama model name (default: {DEFAULT_MODEL})",
    )
    parser.add_argument(
        "--base-model",
        default=os.getenv("OLLAMA_BASE_MODEL", DEFAULT_BASE_MODEL),
        help=f"Base model used by ollama pull (default: {DEFAULT_BASE_MODEL})",
    )


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Start and prepare the local TechCorp AI Chat app."
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    doctor = subparsers.add_parser("doctor", help="Check local prerequisites.")
    doctor.set_defaults(func=command_doctor)

    setup = subparsers.add_parser(
        "setup",
        help="Install Python and frontend dependencies.",
    )
    setup.add_argument("--force", action="store_true", help="Recreate local deps.")
    setup.add_argument(
        "--with-model",
        action="store_true",
        help="Also pull/create the Ollama model.",
    )
    add_model_args(setup)
    setup.set_defaults(func=command_setup)

    model = subparsers.add_parser("model", help="Pull/create the Ollama model.")
    add_model_args(model)
    model.set_defaults(func=command_model)

    backend = subparsers.add_parser("backend", help="Start the Ollama backend.")
    backend.add_argument(
        "--with-model",
        action="store_true",
        help="Pull/create the model if it is missing.",
    )
    add_model_args(backend)
    backend.set_defaults(func=command_backend)

    frontend = subparsers.add_parser("frontend", help="Start the React frontend.")
    frontend.add_argument(
        "--no-install",
        action="store_true",
        help="Skip dependency checks/installation.",
    )
    frontend.add_argument(
        "--host",
        default=os.getenv("VITE_HOST", DEFAULT_FRONTEND_HOST),
        help=f"Vite host (default: {DEFAULT_FRONTEND_HOST}).",
    )
    frontend.add_argument(
        "--port",
        default=os.getenv("VITE_PORT", DEFAULT_FRONTEND_PORT),
        help=f"Vite port (default: {DEFAULT_FRONTEND_PORT}).",
    )
    frontend.set_defaults(func=command_frontend)

    streamlit = subparsers.add_parser(
        "streamlit",
        help="Start the legacy Streamlit UI.",
    )
    streamlit.add_argument(
        "--no-install",
        action="store_true",
        help="Skip dependency checks/installation.",
    )
    streamlit.set_defaults(func=command_streamlit)

    all_cmd = subparsers.add_parser(
        "all",
        help="Start backend and UI together.",
    )
    all_cmd.add_argument(
        "--no-install",
        action="store_true",
        help="Skip dependency checks/installation.",
    )
    all_cmd.add_argument(
        "--with-model",
        action="store_true",
        help="Pull/create the model if it is missing.",
    )
    all_cmd.add_argument(
        "--ui",
        choices=["react", "streamlit", "both"],
        default="react",
        help="UI to start with the backend (default: react).",
    )
    all_cmd.add_argument(
        "--host",
        default=os.getenv("VITE_HOST", DEFAULT_FRONTEND_HOST),
        help=f"Vite host (default: {DEFAULT_FRONTEND_HOST}).",
    )
    all_cmd.add_argument(
        "--port",
        default=os.getenv("VITE_PORT", DEFAULT_FRONTEND_PORT),
        help=f"Vite port (default: {DEFAULT_FRONTEND_PORT}).",
    )
    add_model_args(all_cmd)
    all_cmd.set_defaults(func=command_all)

    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    try:
        return args.func(args)
    except LauncherError as exc:
        print(f"\nERROR: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
