from __future__ import annotations

import json

from common import FRAMEWORK_DIR, connect, stable_id, utc_now, write_json


def build_dataset(objective: str = "context_retrieval") -> dict:
    con = connect()
    rows = con.execute("SELECT task_id,timestamp,request_text,task_type,verification_summary FROM tasks WHERE status='completed' ORDER BY timestamp").fetchall()
    examples = []
    for row in rows:
        files = [dict(file_row) for file_row in con.execute("SELECT file_path,relationship,verified_relevant FROM task_files WHERE task_id=?", (row["task_id"],)).fetchall()]
        examples.append({**dict(row), "files": files})
    dataset_id = stable_id("dataset", objective + json.dumps([e["task_id"] for e in examples]))
    split_index = max(1, int(len(examples) * 0.8)) if examples else 0
    dataset = {
        "dataset_id": dataset_id,
        "created_at": utc_now(),
        "objective": objective,
        "included_task_ids": [e["task_id"] for e in examples],
        "label_rules": "completed tasks with explicitly recorded task_files as weak relevance labels",
        "feature_rules": "task text tokens, task type, path tokens",
        "exclusions": "secrets, raw conversations, large source text",
        "split_strategy": "chronological",
        "train": examples[:split_index],
        "validation": examples[split_index:],
    }
    out = FRAMEWORK_DIR / "data" / "exports" / f"{dataset_id}.json"
    write_json(out, dataset)
    con.close()
    return dataset


if __name__ == "__main__":
    print(json.dumps(build_dataset(), indent=2))
