from __future__ import annotations

import json

from common import classify_task, connect, current_revision, stable_id, utc_now


def start_task(request_text: str) -> str:
    now = utc_now()
    task_id = stable_id("task", request_text + now)
    con = connect()
    con.execute(
        "INSERT OR IGNORE INTO tasks(task_id,timestamp,request_text,task_type,status,commit_revision) VALUES(?,?,?,?,?,?)",
        (task_id, now, request_text, classify_task(request_text), "in_progress", current_revision()),
    )
    con.commit()
    con.close()
    return task_id


def record_task_file(task_id: str, file_path: str, relationship: str, inspected: bool, modified: bool, verified_relevant: bool) -> None:
    con = connect()
    con.execute(
        "INSERT OR REPLACE INTO task_files(task_id,file_path,relationship,inspected,modified,verified_relevant) VALUES(?,?,?,?,?,?)",
        (task_id, file_path, relationship, int(inspected), int(modified), int(verified_relevant)),
    )
    con.commit()
    con.close()


def add_observation(task_id: str | None, category: str, content: str, evidence: str = "", confidence: float = 0.7) -> str:
    now = utc_now()
    observation_id = stable_id("observation", f"{task_id}:{category}:{content}:{now}")
    con = connect()
    con.execute(
        "INSERT OR IGNORE INTO observations(observation_id,task_id,category,content,evidence,confidence,timestamp) VALUES(?,?,?,?,?,?,?)",
        (observation_id, task_id, category, content, evidence, confidence, now),
    )
    con.commit()
    con.close()
    return observation_id


def finish_task(task_id: str, success: bool, verification_summary: str, modified_files: list[str] | None = None, limitations: str = "", metrics: dict | None = None) -> None:
    now = utc_now()
    con = connect()
    con.execute(
        "UPDATE tasks SET status=?, verification_summary=?, commit_revision=? WHERE task_id=?",
        ("completed" if success else "failed", verification_summary, current_revision(), task_id),
    )
    con.execute(
        "INSERT OR IGNORE INTO outcomes(outcome_id,task_id,result,success,metrics,limitations,timestamp) VALUES(?,?,?,?,?,?,?)",
        (stable_id("outcome", task_id + now), task_id, verification_summary, int(success), json.dumps(metrics or {}, sort_keys=True), limitations, now),
    )
    for file_path in modified_files or []:
        con.execute(
            "INSERT OR REPLACE INTO task_files(task_id,file_path,relationship,inspected,modified,verified_relevant) VALUES(?,?,?,?,?,?)",
            (task_id, file_path, "modified", 1, 1, 1),
        )
    con.commit()
    con.close()
