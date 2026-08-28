from __future__ import annotations

import datetime as _dt
import hashlib
import json
import os
import re
import sqlite3
import subprocess
from pathlib import Path
from typing import Any


FRAMEWORK_DIR = Path(os.environ.get("PROJECT_LEARNING_HOME", Path(__file__).resolve().parents[1])).resolve()
ROOT = Path(os.environ.get("PROJECT_LEARNING_REPO_ROOT", FRAMEWORK_DIR.parent)).resolve()
DATA_DIR = FRAMEWORK_DIR / "data"
DB_PATH = DATA_DIR / "learning.db"
CONFIG_PATH = FRAMEWORK_DIR / "config.json"
STATE_PATH = FRAMEWORK_DIR / "state.json"
STATUS_PATH = FRAMEWORK_DIR / "STATUS.md"
MEMORY_INDEX_PATH = FRAMEWORK_DIR / "memory" / "index.json"
MEMORY_CHUNKS_PATH = FRAMEWORK_DIR / "memory" / "chunks.jsonl"
RUNTIME_CONTEXT_PATH = FRAMEWORK_DIR / "runtime" / "context.json"
MODEL_REGISTRY_PATH = FRAMEWORK_DIR / "models" / "registry.json"
EXPERIMENT_REGISTRY_PATH = FRAMEWORK_DIR / "experiments" / "registry.jsonl"


def utc_now() -> str:
    return _dt.datetime.now(_dt.UTC).replace(microsecond=0).isoformat()


def read_json(path: Path, default: Any) -> Any:
    if not path.exists():
        return default
    text = path.read_text(encoding="utf-8").strip()
    if not text:
        return default
    return json.loads(text)


def write_json(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def append_jsonl(path: Path, data: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(data, sort_keys=True) + "\n")


def connect() -> sqlite3.Connection:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    con.execute("PRAGMA foreign_keys = ON")
    return con


def run_git(args: list[str]) -> str | None:
    try:
        result = subprocess.run(["git", *args], cwd=ROOT, text=True, capture_output=True, check=False)
    except OSError:
        return None
    if result.returncode != 0:
        return None
    return result.stdout.strip()


def current_revision() -> str | None:
    return run_git(["rev-parse", "--short", "HEAD"])


def tokenize(text: str) -> list[str]:
    return re.findall(r"[a-z0-9]+", (text or "").lower())


def classify_task(text: str) -> str:
    tokens = set(tokenize(text))
    if {"bug", "fix", "broken", "error", "issue"} & tokens:
        return "debugging"
    if {"review", "audit", "check"} & tokens:
        return "code_review"
    if {"build", "package", "release", "dist", "exe"} & tokens:
        return "release"
    if {"test", "validation", "regression"} & tokens:
        return "testing"
    if {"doc", "docs", "readme", "manual", "guide"} & tokens:
        return "documentation"
    return "feature_work"


def stable_id(prefix: str, content: str) -> str:
    digest = hashlib.sha256(content.encode("utf-8")).hexdigest()[:16]
    return f"{prefix}-{digest}"


def repo_files() -> list[Path]:
    excluded = {".git", "node_modules", "dist", "target", ".agents", ".codex"}
    excluded_prefixes = (
        ".project-learning/data/",
        ".project-learning/evals/results/",
        ".project-learning/experiments/results/",
        ".project-learning/models/challengers/",
        ".project-learning/models/champion/",
        ".project-learning/runtime/",
    )
    files: list[Path] = []
    for path in ROOT.rglob("*"):
        if not path.is_file():
            continue
        rel = path.relative_to(ROOT)
        rel_text = str(rel).replace("\\", "/")
        parts = set(rel.parts)
        if parts & excluded:
            continue
        if "__pycache__" in parts or path.suffix == ".pyc":
            continue
        if rel_text.startswith(excluded_prefixes):
            continue
        files.append(path)
    return files


def lexical_score(query: str, text: str) -> float:
    q = tokenize(query)
    if not q:
        return 0.0
    t = tokenize(text)
    if not t:
        return 0.0
    t_counts: dict[str, int] = {}
    for token in t:
        t_counts[token] = t_counts.get(token, 0) + 1
    overlap = sum(min(t_counts.get(token, 0), 2) for token in set(q))
    return overlap / max(1, len(set(q)))


def markdown_under_limit(path: Path, limit: int = 32768) -> bool:
    if not path.exists() or path.suffix.lower() != ".md":
        return True
    return len(path.read_bytes()) <= limit


def display_path(path: Path) -> str:
    try:
        return str(path.relative_to(ROOT))
    except ValueError:
        return str(path)


def load_state() -> dict[str, Any]:
    return read_json(STATE_PATH, {})


def save_state(state: dict[str, Any]) -> None:
    write_json(STATE_PATH, state)


def update_status() -> None:
    state = load_state()
    registry = read_json(MODEL_REGISTRY_PATH, {"objectives": {}})
    champions = {}
    for objective, meta in registry.get("objectives", {}).items():
        champion = meta.get("champion")
        if champion:
            champions[objective] = champion
    lines = [
        "# Project Learning Status",
        "",
        f"Framework initialized: {'yes' if state.get('initialized') else 'no'}",
        "",
        f"Schema version: {state.get('schema_version', 1)}",
        "",
        f"Total completed tasks: {state.get('total_completed_tasks', 0)}",
        "",
        f"Total usable training examples: {state.get('usable_training_examples', 0)}",
        "",
        "Active objectives: " + ", ".join(state.get("active_objectives", [])),
        "",
        "Current champions: " + (", ".join(f"{k}={v}" for k, v in champions.items()) or "none"),
        "",
        f"Last training time: {state.get('last_training_time') or 'never'}",
        "",
        f"Last evaluation time: {state.get('last_evaluation_time') or 'never'}",
        "",
        f"Next lifecycle threshold: {state.get('next_lifecycle_threshold', 10)} completed tasks",
        "",
        "Known limitations: " + "; ".join(state.get("limitations", [])),
        "",
    ]
    STATUS_PATH.write_text("\n".join(lines), encoding="utf-8")
