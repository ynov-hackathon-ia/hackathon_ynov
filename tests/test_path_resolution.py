from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))

from simple_chat import resolve_model_path


def test_resolve_model_path_uses_repo_root() -> None:
    repo_root = Path(__file__).resolve().parents[1]  # tests/ -> hackathon_ynov/
    resolved = resolve_model_path("../models/phi3_financial", repo_root)

    assert resolved == repo_root / "models" / "phi3_financial"


def test_resolve_model_path_keeps_absolute_path() -> None:
    absolute_path = Path("/tmp/custom-model")

    assert resolve_model_path(absolute_path) == absolute_path
