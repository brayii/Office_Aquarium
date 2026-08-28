from __future__ import annotations

import json
import os
import sqlite3
import subprocess
import sys
import tempfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
PYTHON = sys.executable
LIFECYCLE = ROOT / ".project-learning" / "framework" / "lifecycle.py"


def run_lifecycle(*args: str, env: dict[str, str] | None = None) -> dict:
    test_env = os.environ.copy()
    if env:
        test_env.update(env)
    result = subprocess.run([PYTHON, str(LIFECYCLE), *args], cwd=ROOT, text=True, capture_output=True, check=False, env=test_env)
    if result.returncode != 0:
        raise AssertionError(result.stderr or result.stdout)
    return json.loads(result.stdout)


def assert_true(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def real_task_count() -> int | None:
    db = ROOT / ".project-learning" / "data" / "learning.db"
    if not db.exists():
        return None
    con = sqlite3.connect(db)
    try:
        return con.execute("SELECT COUNT(*) FROM tasks").fetchone()[0]
    finally:
        con.close()


def main() -> None:
    real_count_before = real_task_count()
    temp_dir = tempfile.TemporaryDirectory(prefix="office-aquarium-learning-test-")
    framework_home = Path(temp_dir.name) / ".project-learning"
    env = {"PROJECT_LEARNING_HOME": str(framework_home), "PROJECT_LEARNING_REPO_ROOT": str(ROOT)}
    boot = run_lifecycle("bootstrap", env=env)
    assert_true(boot["ok"], "bootstrap should succeed")
    db = framework_home / "data" / "learning.db"
    assert_true(db.exists(), "learning.db should be created")
    con = sqlite3.connect(db)
    tables = {row[0] for row in con.execute("SELECT name FROM sqlite_master WHERE type='table'")}
    required = {"tasks", "task_files", "observations", "outcomes", "memory_chunks", "failures", "decisions", "experiments", "evaluations", "models"}
    assert_true(required.issubset(tables), f"missing tables: {sorted(required - tables)}")
    con.close()
    packet = run_lifecycle("pre-task", "fix", "itch", "audio", "packaging", env=env)
    assert_true(packet["ok"], "pre-task should succeed")
    assert_true(packet["context"]["relevant_memory"], "retrieval should find baseline memory")
    excluded_prefixes = (".project-learning/data/", ".project-learning/evals/results/", ".project-learning/models/challengers/", ".project-learning/runtime/")
    likely_paths = [item["file_path"] for item in packet["context"]["likely_files"]]
    assert_true(not any(path.startswith(excluded_prefixes) or "__pycache__" in path for path in likely_paths), f"retrieval should exclude generated learning artifacts: {likely_paths}")
    task_id = packet["task_id"]
    done = run_lifecycle("post-task", "--task-id", task_id, "--success", "--verification", "framework smoke verification", "--modified", ".project-learning/framework/lifecycle.py", env=env)
    assert_true(done["ok"], "post-task should succeed")
    eval_result = run_lifecycle("evaluate", env=env)
    assert_true(eval_result["metrics"]["examples"] >= 1, "evaluation should have examples")
    os.environ.update(env)
    sys.path.insert(0, str(ROOT / ".project-learning" / "framework"))
    from registry import promote_if_better

    assert_true(not promote_if_better("relevant_file_prediction", "equal-baseline-test", {"examples": 10, "recall_at_5": 0.5}, {"recall_at_5": 0.5}), "equal baseline metrics must not promote")
    status = (framework_home / "STATUS.md").read_bytes()
    assert_true(len(status) < 32768, "STATUS.md should stay under the markdown size limit")
    real_count_after = real_task_count()
    assert_true(real_count_before == real_count_after, "framework smoke test must not write to the real learning database")
    print(json.dumps({"ok": True, "task_id": task_id, "tables": sorted(tables)}, indent=2))


if __name__ == "__main__":
    main()
