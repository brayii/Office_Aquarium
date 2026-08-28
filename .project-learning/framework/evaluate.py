from __future__ import annotations

import json

from common import FRAMEWORK_DIR, append_jsonl, connect, stable_id, utc_now, write_json
from dataset import build_dataset
from retrieve import likely_files


def recall_at_k(expected: set[str], ranked: list[str], k: int) -> float:
    if not expected:
        return 0.0
    return len(expected & set(ranked[:k])) / len(expected)


def reciprocal_rank(expected: set[str], ranked: list[str]) -> float:
    for index, item in enumerate(ranked, start=1):
        if item in expected:
            return 1 / index
    return 0.0


def evaluate(objective: str = "relevant_file_prediction") -> dict:
    dataset = build_dataset(objective)
    validation = dataset["validation"] or dataset["train"]
    scores = []
    for example in validation:
        expected = {f["file_path"] for f in example.get("files", []) if f.get("verified_relevant")}
        ranked = [item["file_path"] for item in likely_files(example["request_text"], limit=5)]
        scores.append({
            "task_id": example["task_id"],
            "recall_at_5": recall_at_k(expected, ranked, 5),
            "mrr": reciprocal_rank(expected, ranked),
        })
    metrics = {
        "examples": len(validation),
        "recall_at_5": sum(s["recall_at_5"] for s in scores) / len(scores) if scores else 0.0,
        "mrr": sum(s["mrr"] for s in scores) / len(scores) if scores else 0.0,
    }
    experiment_id = stable_id("experiment", objective + dataset["dataset_id"] + utc_now())
    result = {"experiment_id": experiment_id, "objective": objective, "dataset_id": dataset["dataset_id"], "model_id": "lexical_baseline", "metrics": metrics, "scores": scores, "timestamp": utc_now()}
    out = FRAMEWORK_DIR / "evals" / "results" / f"{experiment_id}.json"
    write_json(out, result)
    append_jsonl(FRAMEWORK_DIR / "experiments" / "registry.jsonl", {"experiment_id": experiment_id, "objective": objective, "baseline": "lexical_baseline", "challenger": None, "dataset_version": dataset["dataset_id"], "config": "standard_library", "status": "evaluated", "timestamp": result["timestamp"]})
    con = connect()
    con.execute(
        "INSERT OR IGNORE INTO experiments(experiment_id,objective,baseline,challenger,dataset_version,config,status,timestamp) VALUES(?,?,?,?,?,?,?,?)",
        (experiment_id, objective, "lexical_baseline", None, dataset["dataset_id"], "standard_library", "evaluated", result["timestamp"]),
    )
    for metric, value in metrics.items():
        if metric == "examples":
            continue
        con.execute("INSERT OR IGNORE INTO evaluations(evaluation_id,experiment_id,model_id,metric,value,split,timestamp) VALUES(?,?,?,?,?,?,?)", (stable_id("evaluation", experiment_id + metric), experiment_id, "lexical_baseline", metric, float(value), "validation", utc_now()))
    con.commit()
    con.close()
    return result


if __name__ == "__main__":
    print(json.dumps(evaluate(), indent=2))
