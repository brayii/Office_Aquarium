from __future__ import annotations

import json

from common import FRAMEWORK_DIR, connect, display_path, read_json, save_state, stable_id, utc_now, write_json
from dataset import build_dataset
from registry import ensure_baseline


def train(objective: str = "context_retrieval") -> dict:
    dataset = build_dataset(objective)
    model_id = stable_id("model", objective + dataset["dataset_id"])
    artifact = {
        "model_id": model_id,
        "objective": objective,
        "type": "lexical_baseline_snapshot",
        "dataset_id": dataset["dataset_id"],
        "created_at": utc_now(),
        "notes": "No supervised challenger trained yet; this snapshot preserves reproducible baseline metadata.",
    }
    path = FRAMEWORK_DIR / "models" / "challengers" / f"{model_id}.json"
    write_json(path, artifact)
    ensure_baseline(objective)
    con = connect()
    con.execute(
        "INSERT OR IGNORE INTO models(model_id,objective,version,artifact_path,training_data_version,metrics,status,created_at) VALUES(?,?,?,?,?,?,?,?)",
        (model_id, objective, "0.1.0", display_path(path), dataset["dataset_id"], "{}", "challenger", utc_now()),
    )
    con.commit()
    con.close()
    state = read_json(FRAMEWORK_DIR / "state.json", {})
    state["last_training_time"] = utc_now()
    save_state(state)
    return {"ok": True, "model_id": model_id, "model_type": artifact["type"], "created_at": artifact["created_at"], "artifact": str(path), "dataset_id": dataset["dataset_id"]}


if __name__ == "__main__":
    print(json.dumps(train(), indent=2))
