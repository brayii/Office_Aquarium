from __future__ import annotations

import json
from pathlib import Path

from common import (
    RUNTIME_CONTEXT_PATH,
    ROOT,
    connect,
    lexical_score,
    repo_files,
    tokenize,
    write_json,
)


def likely_files(task_text: str, limit: int = 12) -> list[dict]:
    results = []
    query_tokens = set(tokenize(task_text))
    for path in repo_files():
        rel = str(path.relative_to(ROOT)).replace("\\", "/")
        if path.stat().st_size > 250_000:
            score = lexical_score(task_text, rel)
        else:
            try:
                text = path.read_text(encoding="utf-8", errors="ignore")[:20_000]
            except OSError:
                text = ""
            score = lexical_score(task_text, rel + " " + text)
        if score > 0:
            bonus = 0.2 if query_tokens & set(tokenize(rel)) else 0
            results.append({"file_path": rel, "score": round(score + bonus, 4), "reason": "lexical/path match"})
    return sorted(results, key=lambda item: (-item["score"], item["file_path"]))[:limit]


def retrieve(task_text: str, memory_limit: int = 8, file_limit: int = 12) -> dict:
    con = connect()
    memory = []
    for row in con.execute("SELECT * FROM memory_chunks WHERE active=1").fetchall():
        score = lexical_score(task_text, f"{row['topic']} {row['content']} {row['source']}")
        if score > 0:
            memory.append({
                "chunk_id": row["chunk_id"],
                "topic": row["topic"],
                "content": row["content"],
                "source": row["source"],
                "confidence": row["confidence"],
                "score": round(score * float(row["confidence"] or 0.7), 4),
            })
    failures = []
    for row in con.execute("SELECT * FROM failures WHERE status!='stale'").fetchall():
        score = lexical_score(task_text, f"{row['category']} {row['symptom']} {row['cause']} {row['fix']}")
        if score > 0:
            failures.append({"failure_id": row["failure_id"], "category": row["category"], "symptom": row["symptom"], "score": round(score, 4)})
    decisions = []
    for row in con.execute("SELECT * FROM decisions WHERE status!='stale'").fetchall():
        score = lexical_score(task_text, f"{row['decision']} {row['rationale']} {row['consequences']}")
        if score > 0:
            decisions.append({"decision_id": row["decision_id"], "decision": row["decision"], "score": round(score, 4)})
    similar = []
    for row in con.execute("SELECT task_id, request_text, task_type, verification_summary FROM tasks WHERE status='completed'").fetchall():
        score = lexical_score(task_text, f"{row['request_text']} {row['task_type']} {row['verification_summary']}")
        if score > 0:
            similar.append({"task_id": row["task_id"], "task_type": row["task_type"], "request_text": row["request_text"], "score": round(score, 4)})
    packet = {
        "task": task_text,
        "relevant_memory": sorted(memory, key=lambda item: -item["score"])[:memory_limit],
        "likely_files": likely_files(task_text, file_limit),
        "known_failures": sorted(failures, key=lambda item: -item["score"])[:5],
        "related_decisions": sorted(decisions, key=lambda item: -item["score"])[:5],
        "similar_tasks": sorted(similar, key=lambda item: -item["score"])[:5],
        "confidence": {"method": "lexical_baseline", "score": "advisory"},
    }
    write_json(RUNTIME_CONTEXT_PATH, packet)
    con.close()
    return packet


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument("task", nargs="*", default=[""])
    args = parser.parse_args()
    print(json.dumps(retrieve(" ".join(args.task)), indent=2))
