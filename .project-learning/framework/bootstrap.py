from __future__ import annotations

import sqlite3
from pathlib import Path

from common import (
    CONFIG_PATH,
    DB_PATH,
    FRAMEWORK_DIR,
    MEMORY_CHUNKS_PATH,
    MEMORY_INDEX_PATH,
    MODEL_REGISTRY_PATH,
    ROOT,
    current_revision,
    load_state,
    read_json,
    save_state,
    stable_id,
    utc_now,
    write_json,
    connect,
    display_path,
    update_status,
)


SCHEMA = [
    """CREATE TABLE IF NOT EXISTS schema_migrations (
        version INTEGER PRIMARY KEY,
        applied_at TEXT NOT NULL
    )""",
    """CREATE TABLE IF NOT EXISTS tasks (
        task_id TEXT PRIMARY KEY,
        timestamp TEXT NOT NULL,
        request_text TEXT NOT NULL,
        task_type TEXT NOT NULL,
        status TEXT NOT NULL,
        duration REAL,
        verification_summary TEXT,
        commit_revision TEXT
    )""",
    """CREATE TABLE IF NOT EXISTS task_files (
        task_id TEXT NOT NULL,
        file_path TEXT NOT NULL,
        relationship TEXT,
        inspected INTEGER DEFAULT 0,
        modified INTEGER DEFAULT 0,
        verified_relevant INTEGER DEFAULT 0,
        PRIMARY KEY (task_id, file_path, relationship),
        FOREIGN KEY (task_id) REFERENCES tasks(task_id)
    )""",
    """CREATE TABLE IF NOT EXISTS observations (
        observation_id TEXT PRIMARY KEY,
        task_id TEXT,
        category TEXT NOT NULL,
        content TEXT NOT NULL,
        evidence TEXT,
        confidence REAL,
        timestamp TEXT NOT NULL,
        FOREIGN KEY (task_id) REFERENCES tasks(task_id)
    )""",
    """CREATE TABLE IF NOT EXISTS outcomes (
        outcome_id TEXT PRIMARY KEY,
        task_id TEXT,
        result TEXT NOT NULL,
        success INTEGER NOT NULL,
        metrics TEXT,
        limitations TEXT,
        timestamp TEXT NOT NULL,
        FOREIGN KEY (task_id) REFERENCES tasks(task_id)
    )""",
    """CREATE TABLE IF NOT EXISTS memory_chunks (
        chunk_id TEXT PRIMARY KEY,
        source TEXT NOT NULL,
        topic TEXT NOT NULL,
        content TEXT NOT NULL,
        active INTEGER NOT NULL DEFAULT 1,
        confidence REAL DEFAULT 0.7,
        evidence TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    )""",
    """CREATE TABLE IF NOT EXISTS failures (
        failure_id TEXT PRIMARY KEY,
        task_id TEXT,
        category TEXT NOT NULL,
        symptom TEXT NOT NULL,
        cause TEXT,
        fix TEXT,
        verification TEXT,
        status TEXT NOT NULL,
        FOREIGN KEY (task_id) REFERENCES tasks(task_id)
    )""",
    """CREATE TABLE IF NOT EXISTS decisions (
        decision_id TEXT PRIMARY KEY,
        task_id TEXT,
        decision TEXT NOT NULL,
        rationale TEXT,
        consequences TEXT,
        status TEXT NOT NULL,
        FOREIGN KEY (task_id) REFERENCES tasks(task_id)
    )""",
    """CREATE TABLE IF NOT EXISTS experiments (
        experiment_id TEXT PRIMARY KEY,
        objective TEXT NOT NULL,
        baseline TEXT,
        challenger TEXT,
        dataset_version TEXT,
        config TEXT,
        status TEXT NOT NULL,
        timestamp TEXT NOT NULL
    )""",
    """CREATE TABLE IF NOT EXISTS evaluations (
        evaluation_id TEXT PRIMARY KEY,
        experiment_id TEXT,
        model_id TEXT NOT NULL,
        metric TEXT NOT NULL,
        value REAL NOT NULL,
        split TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        FOREIGN KEY (experiment_id) REFERENCES experiments(experiment_id)
    )""",
    """CREATE TABLE IF NOT EXISTS models (
        model_id TEXT PRIMARY KEY,
        objective TEXT NOT NULL,
        version TEXT NOT NULL,
        artifact_path TEXT,
        training_data_version TEXT,
        metrics TEXT,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL
    )""",
]


INITIAL_MEMORY = [
    {
        "topic": "release-packaging",
        "content": "Itch.io web releases are built with npm run test:package-web. The package inlines CSS, JavaScript, and audio into dist/itch-web/index.html and validates zero browser errors and failed requests.",
        "source": "README.md",
        "evidence": "README Packaging section",
    },
    {
        "topic": "desktop-packaging",
        "content": "Windows releases are built with npm run test:package-windows and copied to dist/windows with a portable EXE, installer, manifest, and SHA256SUMS.",
        "source": "README.md",
        "evidence": "README Desktop Binary section",
    },
    {
        "topic": "test-suite",
        "content": "The project has many targeted npm tests plus npm test for full validation. Use targeted tests around changed systems before running broad checks.",
        "source": "package.json",
        "evidence": "package.json scripts",
    },
    {
        "topic": "project-layout",
        "content": "Office_Aquarium.html is the main launch file; simulation code is organized under src/core, src/services, src/systems, src/ui, src/facades, and src/bootstrap.",
        "source": "README.md",
        "evidence": "README Project Layout",
    },
]


def ensure_dirs() -> None:
    for rel in [
        "data/exports",
        "framework",
        "models/champion",
        "models/challengers",
        "evals/results",
        "experiments/results",
        "memory",
        "runtime",
        "tests",
    ]:
        (FRAMEWORK_DIR / rel).mkdir(parents=True, exist_ok=True)


def apply_schema(con: sqlite3.Connection) -> None:
    for statement in SCHEMA:
        con.execute(statement)
    con.execute("INSERT OR IGNORE INTO schema_migrations(version, applied_at) VALUES(?, ?)", (1, utc_now()))
    con.commit()


def seed_memory(con: sqlite3.Connection) -> None:
    now = utc_now()
    for item in INITIAL_MEMORY:
        chunk_id = stable_id("mem", item["topic"] + item["content"])
        con.execute(
            """INSERT OR IGNORE INTO memory_chunks
               (chunk_id, source, topic, content, active, confidence, evidence, created_at, updated_at)
               VALUES (?, ?, ?, ?, 1, 0.85, ?, ?, ?)""",
            (chunk_id, item["source"], item["topic"], item["content"], item["evidence"], now, now),
        )
    con.commit()


def export_memory(con: sqlite3.Connection) -> None:
    rows = con.execute("SELECT * FROM memory_chunks WHERE active=1 ORDER BY topic, chunk_id").fetchall()
    chunks = [dict(row) for row in rows]
    write_json(MEMORY_INDEX_PATH, {"chunks": [{"chunk_id": c["chunk_id"], "topic": c["topic"], "source": c["source"]} for c in chunks]})
    MEMORY_CHUNKS_PATH.write_text("\n".join(__import__("json").dumps(c, sort_keys=True) for c in chunks) + ("\n" if chunks else ""), encoding="utf-8")


def record_initialization(con: sqlite3.Connection) -> str:
    existing = con.execute("SELECT task_id FROM tasks WHERE task_type='framework_initialization' ORDER BY timestamp LIMIT 1").fetchone()
    if existing:
        return existing["task_id"]
    now = utc_now()
    task_id = stable_id("task", "initialize project learning framework " + now)
    con.execute(
        "INSERT OR IGNORE INTO tasks(task_id,timestamp,request_text,task_type,status,verification_summary,commit_revision) VALUES(?,?,?,?,?,?,?)",
        (task_id, now, "initialize project learning framework", "framework_initialization", "completed", "Schema, baseline memory, registry, and smoke-test tooling created.", current_revision()),
    )
    con.execute(
        "INSERT OR IGNORE INTO outcomes(outcome_id,task_id,result,success,metrics,limitations,timestamp) VALUES(?,?,?,?,?,?,?)",
        (stable_id("outcome", task_id), task_id, "Framework initialized with standard-library baselines.", 1, "{}", "No external ML packages installed.", now),
    )
    con.commit()
    return task_id


def bootstrap() -> dict:
    ensure_dirs()
    config = read_json(CONFIG_PATH, {})
    con = connect()
    apply_schema(con)
    seed_memory(con)
    export_memory(con)
    previous_state = load_state()
    task_id = record_initialization(con)
    if not MODEL_REGISTRY_PATH.exists():
        write_json(MODEL_REGISTRY_PATH, {"objectives": {}, "history": []})
    registry_objectives = read_json(MODEL_REGISTRY_PATH, {"objectives": {}}).get("objectives", {})
    champions = {objective: meta.get("champion") for objective, meta in registry_objectives.items() if meta.get("champion")}
    completed = con.execute("SELECT COUNT(*) FROM tasks WHERE status='completed'").fetchone()[0]
    threshold = config.get("lifecycle", {}).get("reevaluate_every_new_tasks", 10)
    state = {
        "initialized": True,
        "schema_version": config.get("schema_version", 1),
        "framework_version": config.get("framework_version", "0.1.0"),
        "total_completed_tasks": completed,
        "usable_training_examples": completed,
        "active_objectives": ["context_retrieval", "relevant_file_prediction", "task_classification", "failure_risk_prediction"],
        "current_champions": champions,
        "last_training_time": previous_state.get("last_training_time"),
        "last_evaluation_time": previous_state.get("last_evaluation_time"),
        "next_lifecycle_threshold": ((completed // threshold) + 1) * threshold,
        "limitations": [
            "Uses standard-library lexical baselines until enough labeled data exists.",
            "No external ML packages are required or installed.",
        ],
        "last_error": None,
    }
    save_state(state)
    update_status()
    con.close()
    return {"ok": True, "task_id": task_id, "database": display_path(DB_PATH)}


if __name__ == "__main__":
    print(__import__("json").dumps(bootstrap(), indent=2))
