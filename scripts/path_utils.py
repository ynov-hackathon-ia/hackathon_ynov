from pathlib import Path


def resolve_model_path(model_path, repo_root=None):
    """Resolve a model path from the repository root and keep absolute paths intact."""
    path = Path(model_path).expanduser()
    if path.is_absolute():
        return path

    base_dir = (
        Path(repo_root).resolve()
        if repo_root is not None
        else Path(__file__).resolve().parents[1]
    )

    candidates = []
    if path.parts and path.parts[0] == "..":
        stripped_path = Path(*path.parts[1:])
        candidates.append((base_dir / stripped_path).resolve())
    candidates.append((base_dir / path).resolve())

    for candidate in candidates:
        if candidate.exists():
            return candidate

    return candidates[0]
