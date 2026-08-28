from __future__ import annotations

from common import MODEL_REGISTRY_PATH, read_json, utc_now, write_json


def registry() -> dict:
    return read_json(MODEL_REGISTRY_PATH, {"objectives": {}, "history": []})


def ensure_baseline(objective: str) -> dict:
    data = registry()
    objective_record = data.setdefault("objectives", {}).setdefault(objective, {})
    objective_record.setdefault("baseline", "lexical_baseline")
    objective_record.setdefault("champion", None)
    objective_record.setdefault("challengers", [])
    data.setdefault("history", []).append({"time": utc_now(), "objective": objective, "event": "baseline_checked"})
    write_json(MODEL_REGISTRY_PATH, data)
    return data


def promote_if_better(objective: str, challenger: str, metrics: dict, baseline_metrics: dict, min_improvement: float = 0.02) -> bool:
    primary = "recall_at_5"
    current = float(baseline_metrics.get(primary, 0.0))
    proposed = float(metrics.get(primary, 0.0))
    promoted = proposed > current * (1 + min_improvement) and metrics.get("examples", 0) >= 5
    data = registry()
    objective_record = data.setdefault("objectives", {}).setdefault(objective, {"baseline": "lexical_baseline"})
    objective_record.setdefault("challengers", []).append({"model_id": challenger, "metrics": metrics, "promoted": promoted, "time": utc_now()})
    if promoted:
        objective_record["champion"] = challenger
        objective_record["promotion_time"] = utc_now()
    data.setdefault("history", []).append({"time": utc_now(), "objective": objective, "event": "promoted" if promoted else "rejected", "model_id": challenger})
    write_json(MODEL_REGISTRY_PATH, data)
    return promoted


def record_challenger_result(objective: str, challenger: str, metrics: dict, promoted: bool, reason: str) -> None:
    data = registry()
    objective_record = data.setdefault("objectives", {}).setdefault(objective, {"baseline": "lexical_baseline", "champion": None, "challengers": []})
    objective_record.setdefault("challengers", []).append({"model_id": challenger, "metrics": metrics, "promoted": promoted, "reason": reason, "time": utc_now()})
    if promoted:
        objective_record["champion"] = challenger
        objective_record["promotion_time"] = utc_now()
    data.setdefault("history", []).append({"time": utc_now(), "objective": objective, "event": "promoted" if promoted else "rejected", "model_id": challenger, "reason": reason})
    write_json(MODEL_REGISTRY_PATH, data)
