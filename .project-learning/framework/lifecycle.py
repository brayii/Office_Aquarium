from __future__ import annotations

import argparse
import json
import sys
import traceback

from bootstrap import bootstrap
from collect import add_observation, finish_task, record_task_file, start_task
from common import (
    CONFIG_PATH,
    RUNTIME_CONTEXT_PATH,
    connect,
    load_state,
    markdown_under_limit,
    read_json,
    save_state,
    update_status,
    utc_now,
)
from evaluate import evaluate
from registry import ensure_baseline, promote_if_better, record_challenger_result
from retrieve import retrieve
from train import train


def framework_health() -> dict:
    con = connect()
    schema = con.execute("SELECT MAX(version) FROM schema_migrations").fetchone()[0]
    completed = con.execute("SELECT COUNT(*) FROM tasks WHERE status='completed'").fetchone()[0]
    con.close()
    return {"ok": True, "schema_version": schema, "completed_tasks": completed}


def pre_task(task_text: str) -> dict:
    health = framework_health()
    task_id = start_task(task_text)
    packet = retrieve(task_text)
    add_observation(task_id, "pre_task", "Retrieved advisory learned context before inspecting repository evidence.", str(RUNTIME_CONTEXT_PATH), 0.8)
    return {"ok": True, "task_id": task_id, "health": health, "context": packet}


def post_task(args: argparse.Namespace) -> dict:
    modified_files = [item for item in (args.modified or "").split(";") if item]
    finish_task(args.task_id, args.success, args.verification or "", modified_files, args.limitations or "", {})
    for file_path in modified_files:
        record_task_file(args.task_id, file_path, "modified", True, True, True)
    lifecycle_result = lifecycle_check()
    return {"ok": True, "task_id": args.task_id, "lifecycle": lifecycle_result}


def lifecycle_check() -> dict:
    state = load_state()
    con = connect()
    completed = con.execute("SELECT COUNT(*) FROM tasks WHERE status='completed'").fetchone()[0]
    con.close()
    state["total_completed_tasks"] = completed
    state["usable_training_examples"] = completed
    threshold = int(read_json(CONFIG_PATH, {}).get("lifecycle", {}).get("reevaluate_every_new_tasks", 10))
    state["next_lifecycle_threshold"] = ((completed // threshold) + 1) * threshold
    result = {"checked_at": utc_now(), "completed_tasks": completed, "training_run": False, "evaluation_run": False}
    if completed > 0 and completed % threshold == 0:
        train_result = train("relevant_file_prediction")
        eval_result = evaluate("relevant_file_prediction")
        if train_result.get("model_type") == "lexical_baseline_snapshot":
            promoted = False
            record_challenger_result("relevant_file_prediction", train_result["model_id"], eval_result["metrics"], False, "baseline snapshot is not a distinct challenger")
        else:
            promoted = promote_if_better("relevant_file_prediction", train_result["model_id"], eval_result["metrics"], {"recall_at_5": 0.0})
        state["last_training_time"] = train_result.get("created_at") or utc_now()
        state["last_evaluation_time"] = eval_result.get("timestamp") or utc_now()
        result.update({"training_run": True, "evaluation_run": True, "promoted": promoted, "train": train_result, "evaluate": eval_result})
    save_state(state)
    update_status()
    return result


def rebuild_memory() -> dict:
    from bootstrap import export_memory

    con = connect()
    export_memory(con)
    con.close()
    return {"ok": True, "memory": str(RUNTIME_CONTEXT_PATH.parent.parent / "memory")}


def status() -> dict:
    state = load_state()
    con = connect()
    completed = con.execute("SELECT COUNT(*) FROM tasks WHERE status='completed'").fetchone()[0]
    con.close()
    threshold = int(read_json(CONFIG_PATH, {}).get("lifecycle", {}).get("reevaluate_every_new_tasks", 10))
    state["total_completed_tasks"] = completed
    state["usable_training_examples"] = completed
    state["next_lifecycle_threshold"] = ((completed // threshold) + 1) * threshold
    if state.get("last_error"):
        state["last_error"] = None
        save_state(state)
    else:
        save_state(state)
    update_status()
    return {"ok": True, "state": load_state()}


def rollback() -> dict:
    for objective in ["context_retrieval", "relevant_file_prediction", "task_classification", "failure_risk_prediction"]:
        ensure_baseline(objective)
    return {"ok": True, "message": "Rollback target is the lexical baseline for all objectives."}


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Office Aquarium project-learning lifecycle")
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("bootstrap")
    pre = sub.add_parser("pre-task")
    pre.add_argument("task", nargs="+")
    post = sub.add_parser("post-task")
    post.add_argument("--task-id", required=True)
    post.add_argument("--success", action="store_true")
    post.add_argument("--verification", default="")
    post.add_argument("--modified", default="")
    post.add_argument("--limitations", default="")
    train_parser = sub.add_parser("train")
    train_parser.add_argument("--objective", default="context_retrieval")
    eval_parser = sub.add_parser("evaluate")
    eval_parser.add_argument("--objective", default="relevant_file_prediction")
    sub.add_parser("status")
    sub.add_parser("rebuild-memory")
    sub.add_parser("rollback")
    args = parser.parse_args(argv)
    try:
        if args.command == "bootstrap":
            result = bootstrap()
        elif args.command == "pre-task":
            result = pre_task(" ".join(args.task))
        elif args.command == "post-task":
            result = post_task(args)
        elif args.command == "train":
            result = train(args.objective)
        elif args.command == "evaluate":
            result = evaluate(args.objective)
        elif args.command == "status":
            result = status()
        elif args.command == "rebuild-memory":
            result = rebuild_memory()
        elif args.command == "rollback":
            result = rollback()
        else:
            raise ValueError(args.command)
        state = load_state()
        if state.get("last_error"):
            state["last_error"] = None
            save_state(state)
            update_status()
        if not markdown_under_limit(__import__("common").STATUS_PATH):
            raise RuntimeError("STATUS.md exceeds the markdown size policy")
        print(json.dumps(result, indent=2))
        return 0
    except Exception as exc:
        state = load_state()
        state["last_error"] = {"time": utc_now(), "command": args.command, "error": str(exc), "traceback": traceback.format_exc(limit=4)}
        save_state(state)
        update_status()
        print(json.dumps({"ok": False, "error": str(exc)}, indent=2), file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
