# AGENTS.md — Adaptive Project Learning Framework

## Objective

Maintain an executable, persistent machine-learning framework inside this repository.

The framework must learn from coding work performed in the repository, turn that work into structured training and evaluation data, train project-specific models when sufficient data exists, evaluate them against baselines, promote only models that improve measured performance, and use promoted models to improve future coding-agent context and decisions.

The framework is part of the development environment. It must evolve with the repository.

Core lifecycle:

```text
project task
    ↓
retrieve learned context
    ↓
inspect current repository evidence
    ↓
perform work
    ↓
test / review / measure
    ↓
record task + observations + outcome
    ↓
update dataset
    ↓
train challenger when eligible
    ↓
evaluate against champion + baseline
    ↓
promote only if better
    ↓
future tasks use improved model
```

---

# 1. Mandatory Behavior

For every coding task:

1. Load the project-learning framework.
2. Retrieve relevant learned context for the task.
3. Inspect current repository code, tests, configuration, and documentation.
4. Perform the requested work.
5. Verify the result when practical.
6. Record the task, relevant files, observations, verification, and outcome.
7. Update persistent project knowledge.
8. Run the framework lifecycle check.
9. If new data makes training or reevaluation eligible, run it automatically.
10. Use the promoted model on later tasks.

Do not wait for a separate user request to train, evaluate, or promote a model when the configured lifecycle conditions are satisfied.

Do not claim a model improved unless evaluation demonstrates improvement.

Current repository evidence always overrides stale learned memory.

---

# 2. Initialization

Treat requests such as these as initialization commands:

- `initialize project`
- `initialize the project`
- `initialize learning framework`
- `bootstrap project`
- `set up project learning`

Initialization must create a working framework, not only documentation.

Initialization must:

1. inspect the repository;
2. detect available runtimes and dependency management;
3. create the framework layout;
4. create the data store;
5. create executable collection, dataset, retrieval, training, evaluation, registry, and lifecycle tools;
6. create tests for the framework;
7. capture the initial repository state;
8. build the initial retrieval baseline;
9. run a framework smoke test;
10. record initialization as the first framework event.

If equivalent infrastructure already exists, integrate with it rather than duplicating it.

---

# 3. Framework Location

Keep framework code and state under:

```text
.project-learning/
├── config.json
├── state.json
├── STATUS.md
├── data/
│   ├── learning.db
│   └── exports/
├── framework/
│   ├── __init__.py
│   ├── bootstrap.py
│   ├── collect.py
│   ├── dataset.py
│   ├── features.py
│   ├── retrieve.py
│   ├── train.py
│   ├── evaluate.py
│   ├── registry.py
│   ├── lifecycle.py
│   └── common.py
├── models/
│   ├── registry.json
│   ├── champion/
│   └── challengers/
├── evals/
│   ├── definitions.json
│   └── results/
├── experiments/
│   ├── registry.jsonl
│   └── results/
├── memory/
│   ├── index.json
│   └── chunks.jsonl
├── runtime/
│   └── context.json
└── tests/
```

Adapt filenames when necessary for the environment, but preserve the responsibilities.

Do not store project-specific learning in the root `AGENTS.md`.

---

# 4. Runtime and Dependencies

Prefer an isolated Python implementation for the project-learning framework because it provides a portable ML/data toolchain.

Use the newest Python version already supported by the development environment when practical.

Keep framework dependencies isolated from the host application's runtime dependencies.

Prefer this progression:

1. Python standard library for bootstrap, SQLite, configuration, logging, and baseline retrieval.
2. `numpy` and `scikit-learn` for classical ML when dependency installation is permitted.
3. embedding libraries or model runtimes only when evaluation justifies them.
4. heavier deep-learning libraries only when a measured task requires them.

Do not introduce a heavy ML dependency before a simpler baseline exists.

If a dependency cannot be installed, keep the framework functional at the highest available stage and record the limitation in `state.json`.

---

# 5. Canonical Data Store

Use SQLite at:

```text
.project-learning/data/learning.db
```

as the canonical structured learning store.

The database should include tables equivalent to:

## tasks

- task_id
- timestamp
- request_text
- task_type
- status
- duration when measurable
- verification_summary
- repository_revision
- lifecycle_run_id

## task_files

- task_id
- file_path
- relationship
- inspected
- modified
- verified_relevant
- discovery_source
- retrieved_rank when applicable

## observations

- observation_id
- task_id
- category
- content
- evidence
- confidence
- timestamp

## outcomes

- outcome_id
- task_id
- result
- success
- metrics
- limitations
- timestamp

## memory_chunks

- chunk_id
- source
- topic
- content
- active
- evidence_revision
- valid_from_revision
- last_verified_revision
- invalidated_revision
- created_at
- updated_at

## failures

- failure_id
- task_id
- category
- symptom
- cause
- fix
- verification
- status

## decisions

- decision_id
- task_id
- decision
- rationale
- consequences
- status

## experiments

- experiment_id
- objective
- baseline
- challenger
- dataset_version
- config
- status
- timestamp

## evaluations

- evaluation_id
- experiment_id
- model_id
- metric
- value
- split
- timestamp

## models

- model_id
- objective
- version
- artifact_path
- training_data_version
- metrics
- status
- created_at

Schema migrations must be versioned and backward-compatible when practical.

Do not place large source files or raw logs directly in the database.

---

# 6. Task Data Collection

Every completed task should produce structured learning data when useful.

Record:

- the user's task;
- task category;
- files inspected;
- files modified;
- files confirmed relevant;
- commands executed;
- tests or checks performed;
- important observations;
- failures encountered;
- fixes applied;
- outcome;
- measurable results;
- limitations.

Do not record secrets, credentials, tokens, private keys, or sensitive environment values.

Do not store entire conversations.

Store concise task text and project-relevant evidence.

---

# 7. Automatic Labels

Derive training labels only from defensible evidence and retain provenance.

## Relevant-file prediction

Input:
- task text
- repository metadata

Strong positive labels:
- files independently verified as necessary to understand, fix, test, or complete the task

Weak labels:
- inspected files
- modified files
- files suggested by retrieval

Store how each file was discovered:

```text
user_provided
repository_search
dependency_graph
test_failure
lexical_baseline
model_retrieval
independent_agent_discovery
```

Do not silently treat exposure as relevance.

## Memory relevance

Use graded relevance:

```text
0 = irrelevant or misleading
1 = related but not useful
2 = useful during the task
3 = directly contributed to a verified decision or outcome
```

Store both `relevance_grade` and `relevance_source`.

Possible sources:

```text
human_review
verification
repository_evidence
agent_explicit_use
weak_heuristic
```

For retrieved candidates, record whether the candidate was exposed, its rank, retriever version, whether it was used, and whether it was verified useful.

## Failure-risk prediction

Input:
- task text
- affected subsystem
- repository-state features

Target:
- observed failure categories

## Task classification

Input:
- task request

Target:
- task category derived from completed work

Track label provenance, confidence, repository revision, and exposure source.

Do not train on labels whose origin cannot be explained.

---

# 8. Initial Baselines

The framework must establish simple baselines before training more complex models.

Required initial baselines:

## Context Retrieval Baseline

Start with deterministic lexical retrieval using available project memory and repository metadata.

Use methods such as:

- token overlap;
- BM25-style scoring;
- TF-IDF cosine similarity;
- path and symbol matches;
- recency and confidence weighting.

## Relevant-File Baseline

Use repository-native signals such as:

- filename/path token matching;
- symbol search;
- import/include relationships;
- recent task associations.

## Failure Baseline

Use simple frequency and subsystem history when enough failures exist.

Baselines must be reproducible and evaluated using the same test data as challengers.

---

# 9. Dataset Construction

`dataset.py` must build versioned datasets from the canonical store.

Each dataset version must record:

- dataset ID;
- creation time;
- objective;
- included task IDs;
- repository revision range;
- label rules;
- feature rules;
- exclusions;
- split strategy;
- random seed where applicable;
- duplicate/near-duplicate policy.

Prefer chronological splits:

```text
older tasks → training
newer tasks → validation/test
```

Features and memory for a historical task must reflect only information available at or before that task's repository revision when practical.

Never evaluate on examples used for training.

Training eligibility must consider information diversity, not only raw sample count. Track when applicable:

- distinct task families;
- distinct repository revisions;
- positive and negative coverage;
- class coverage;
- duplicate or near-duplicate fraction;
- evaluation-query count.

---

# 10. ML Objectives

The framework may train separate models for different objectives.

Priority order:

## Objective A — Context Retrieval / Ranking

Given a task, rank project memory that is most likely to help.

This is the primary learned component.

## Objective B — Relevant-File Prediction

Given a task, rank files or subsystems likely to matter.

## Objective C — Task Classification

Classify task type to improve routing, retrieval, and evaluation.

## Objective D — Failure-Risk Prediction

Estimate likely failure categories from task and subsystem history.

## Objective E — Strategy Ranking

Rank previously successful approaches for similar tasks.

Only activate an objective when sufficient usable data and an evaluation target exist.

---

# 11. Training Progression

Use the simplest model that can improve the objective.

Recommended progression:

## Retrieval

1. lexical baseline;
2. TF-IDF / nearest-neighbor retrieval;
3. embedding retrieval;
4. learned reranker if enough labeled relevance data exists.

## Relevant Files

1. lexical/path baseline;
2. TF-IDF or linear multilabel model;
3. learned ranker when enough examples exist.

## Task Classification

1. rules or keyword baseline;
2. logistic regression / linear SVM;
3. more complex model only if justified.

## Failure Risk

1. historical-frequency baseline;
2. logistic regression / tree model;
3. more complex model only if justified.

Prefer interpretable, inexpensive models until evidence supports additional complexity.

---

# 12. Automatic Training Eligibility

Store thresholds and resource limits in `config.json`.

Provide conservative defaults such as:

```json
{
  "lifecycle": {
    "reevaluate_every_new_tasks": 10,
    "min_tasks_for_tfidf": 10,
    "min_tasks_for_supervised_model": 30,
    "min_positive_examples_per_class": 5,
    "min_distinct_task_families": 3,
    "max_near_duplicate_fraction": 0.25
  },
  "resources": {
    "allow_dependency_install": false,
    "allow_network": false,
    "max_training_seconds": 300
  }
}
```

Thresholds are eligibility gates, not guarantees of statistical sufficiency.

At task completion, `lifecycle.py` must check:

- number of new usable examples;
- label quality;
- diversity and duplicate rate;
- class coverage;
- repository revision changes;
- dataset changes;
- evaluation staleness;
- configured resource policy.

When eligible and within policy:

1. build a new dataset version;
2. train a challenger;
3. evaluate it;
4. compare with baseline and champion;
5. record results;
6. promote only if promotion rules pass.

If eligible work exceeds configured resource, dependency, network, or execution limits, record it as pending rather than blocking normal coding work.

Do not wait for an additional user prompt when eligible lifecycle work is permitted by policy.

---

# 13. Evaluation Metrics

Use metrics appropriate to each objective.

## Context Retrieval

Prefer:

- Recall@K
- MRR
- nDCG@K
- Precision@K when meaningful

## Relevant-File Prediction

Prefer:

- Recall@K
- Precision@K
- MRR

## Classification

Prefer:

- macro F1
- per-class precision/recall
- confusion matrix

## Failure Risk

Prefer:

- macro F1
- precision/recall
- calibration when probabilities are used

Also track framework-level operational metrics when measurable:

- useful-context hit rate;
- stale or misleading-context rate;
- repeated-error rate;
- average retrieved context size;
- retrieval latency;
- unnecessary file inspections;
- setup/rediscovery effort;
- percentage of tasks using prior learned knowledge.

Treat operational utility as a promotion guardrail. A model that improves ranking metrics while materially increasing stale context, latency, context size, or unnecessary inspection may be rejected.

Do not rely on training loss as the primary promotion metric.

---

# 13A. Evaluation and Promotion Statistics

Promotion comparisons must account for uncertainty.

For ranking/retrieval objectives, prefer paired evaluation over the same held-out tasks and use a paired bootstrap or equivalent resampling method when enough examples exist.

Store promotion configuration such as:

```json
{
  "promotion": {
    "primary_metric": "ndcg@5",
    "min_absolute_improvement": 0.01,
    "confidence_level": 0.95,
    "bootstrap_samples": 2000,
    "max_secondary_regression": 0.02
  }
}
```

A tiny numerical win is not sufficient evidence.

When the evaluation set is too small for a stable uncertainty estimate, keep the challenger unpromoted and record the result as exploratory.

Frozen or versioned evaluation sets must be identifiable and must not silently change between champion/challenger comparisons.

---

# 14. Champion / Challenger Model Registry

Maintain:

```text
.project-learning/models/registry.json
```

For each objective, track:

- baseline version;
- current champion;
- challengers;
- dataset version;
- evaluation metrics;
- artifact path;
- creation date;
- promotion date;
- rollback target.

Never overwrite the current champion before a challenger passes evaluation.

Keep rollback possible.

---

# 15. Promotion Rules

A challenger may become champion only when:

1. it is evaluated on held-out data;
2. it beats the required baseline;
3. improvement over the current champion meets the configured minimum effect;
4. paired uncertainty analysis supports improvement or configured non-regression;
5. important secondary and operational metrics stay within tolerance;
6. evaluation coverage and diversity are sufficient;
7. results are reproducible when randomness materially affects training;
8. no leakage or provenance defect is identified.

If evidence is weak, keep the existing champion and record the challenger result.

Promotion must be atomic and rollback must remain possible.

---

# 16. Retrieval Before Every Task

Before coding work begins, generate a context packet.

`retrieve.py` should accept task text and return structured results such as:

```json
{
  "task": "",
  "repository_revision": "",
  "relevant_memory": [],
  "likely_files": [],
  "known_failures": [],
  "related_decisions": [],
  "similar_tasks": [],
  "retriever_versions": {},
  "confidence": {}
}
```

Use the current champion for each available objective.

Fall back to deterministic baselines when no promoted model exists.

Store the latest packet at:

```text
.project-learning/runtime/context.json
```

The coding agent must use this packet as advisory context, then verify it against current repository evidence.

Model predictions are not authoritative facts.

---

# 17. Memory Extraction

Project memory should be generated from verified structured data, not free-form speculation.

Maintain concise active memory chunks describing:

- architecture;
- subsystem behavior;
- commands;
- invariants;
- conventions;
- recurring failures;
- verified fixes;
- decisions;
- performance constraints;
- dependency quirks;
- important file relationships.

Each chunk should include:

- unique ID;
- topic;
- content;
- evidence reference;
- confidence;
- active/stale status;
- valid-from repository revision;
- last-verified repository revision;
- invalidated revision when applicable;
- last verified time.

When new evidence contradicts a chunk:

1. mark the old chunk stale;
2. create or update the current chunk;
3. preserve provenance.

---

# 18. Experiments

Every framework experiment must have:

- experiment ID;
- hypothesis;
- objective;
- baseline;
- challenger;
- dataset version;
- feature configuration;
- model configuration;
- seed where applicable;
- metrics;
- result;
- limitations;
- decision.

Record experiments in:

```text
.project-learning/experiments/registry.jsonl
```

Do not delete failed experiments.

Failed experiments are training and engineering evidence.

---

# 19. Framework Evaluation

Evaluate both model metrics and real coding utility.

Periodically sample completed tasks and ask:

- Was retrieved memory relevant?
- Were predicted files useful?
- Did known failures prevent repeated mistakes?
- Did the framework surface a prior decision?
- Did stale memory mislead the agent?
- Did learned retrieval outperform lexical retrieval?
- Did the framework reduce unnecessary repository search?
- Did it increase irrelevant context or latency?

Monitor promoted models after deployment.

Track when practical:

- tasks since promotion;
- post-promotion utility;
- stale-context rate;
- feature/label distribution drift;
- repository path/symbol churn;
- major dependency or architecture changes.

Trigger reevaluation after material repository drift, sharp utility regression, or configured task intervals.

Automatically demote or roll back a champion when configured post-promotion guardrails fail and evidence is sufficient.

Use these results to improve features, labels, retrieval, and training.

---

# 20. Self-Improvement Rule

The framework must improve itself from measured evidence.

When accumulated data suggests a better representation, model, feature set, retrieval method, labeling rule, or evaluation method:

1. create an experiment;
2. preserve the current baseline/champion;
3. implement the challenger;
4. evaluate on held-out data;
5. promote only if better;
6. record the result;
7. update configuration and registry;
8. keep rollback possible.

Do not change the framework merely because a more advanced technique exists.

Measured improvement is required.

---

# 21. Code Review, Debugging, and Feature Work

All development activity can produce learning data.

## Code Review

Record:

- verified defects;
- architectural findings;
- dangerous patterns;
- missing tests;
- relevant files;
- confirmed invariants.

## Debugging

Record:

- symptom;
- root cause;
- failed hypotheses;
- successful fix;
- verification;
- affected subsystem.

## Feature Work

Record:

- affected subsystems;
- new architecture facts;
- new tests;
- new commands;
- new decisions;
- verified outcome.

## Refactoring

Record:

- moved responsibilities;
- changed file relationships;
- retired memory;
- preserved behavior;
- verification.

Do not store an entire review or conversation as training data.

Store concise structured evidence.

---

# 22. Tests for the Learning Framework

The framework itself must have automated tests where practical.

Test at least:

- database creation and migration;
- task collection;
- dataset construction;
- deterministic splitting;
- baseline retrieval;
- feature generation;
- model save/load;
- registry updates;
- champion rollback;
- evaluation calculations;
- context packet generation;
- stale-memory handling;
- lifecycle eligibility.

Training code must be smoke-testable on a tiny synthetic dataset.

---

# 23. Reproducibility

Record:

- framework version;
- configuration;
- dataset version;
- dependency versions;
- feature version;
- model parameters;
- random seeds where applicable;
- evaluation split;
- training repository revision range;
- evaluation repository revision range;
- metrics;
- artifact hashes when useful.

A promoted model must be reproducible enough to investigate regressions.

---

# 23A. Atomicity, Concurrency, and Crash Recovery

Every lifecycle execution must have a unique `lifecycle_run_id`.

Use SQLite transactions for canonical metadata changes.

Model artifacts and registry changes must follow an atomic sequence:

```text
write immutable challenger artifact
→ hash artifact
→ persist evaluation
→ mark challenger eligible
→ atomically update registry/champion pointer
→ record promotion event
```

Use temporary files plus atomic rename for registry/state files where supported.

Lifecycle operations must be idempotent. Re-running after a crash must not duplicate tasks, experiments, evaluations, or promotions.

When multiple coding agents may operate concurrently, use database transactions and a repository-local lock for lifecycle operations that mutate shared framework state.

---

# 24. Data Quality and Leakage

Before training:

- remove invalid records;
- detect duplicate and near-duplicate tasks when practical;
- validate labels;
- preserve chronological and repository-revision boundaries;
- avoid using future outcomes or future memory as features for earlier tasks;
- avoid training and evaluation overlap;
- record weak-label provenance;
- record model/baseline exposure that may bias later labels;
- distinguish independently discovered evidence from model-suggested evidence;
- exclude secrets and sensitive values.

If leakage or exposure-bias defects invalidate an evaluation, mark it invalid and retrain/re-evaluate.

---

# 24A. Data Governance

Store only information required for project learning.

Do not store:

- secrets;
- credentials;
- access tokens;
- private keys;
- sensitive environment values;
- unnecessary conversation content.

Support deletion or redaction of task records and derived learning data when requested.

When deleting source records, invalidate or rebuild datasets/models whose provenance depends on those records when practical.

Define retention for bulky exports, temporary evaluation data, and generated artifacts in `config.json`.

Record licensing or privacy constraints when repository data imposes them.

---

# 25. Performance and Cost

The learning framework must not make normal coding work unreasonably slow.

Track when useful:

- retrieval latency;
- training time;
- model size;
- context packet size;
- database size;
- memory/index build time.

Prefer incremental updates.

Respect configured CPU, GPU, elapsed-time, storage, network, API-cost, and dependency-installation limits.

Do not launch resource-heavy work merely because a sample threshold was crossed.

Use configured lifecycle thresholds and resource policy.

---

# 26. Persistence

Keep lightweight framework code, configuration, schema, memory metadata, experiment records, evaluation definitions, and small model artifacts versioned when practical.

Do not add the entire `.project-learning/` directory to `.gitignore`.

Large or environment-specific artifacts may be ignored, including:

- caches;
- temporary indexes;
- large model binaries;
- large generated datasets;
- raw logs;
- temporary evaluation output.

Record enough metadata to rebuild ignored artifacts.

---

# 27. Root AGENTS.md Stability

Treat the root `AGENTS.md` as the stable bootstrap and operating specification.

Do not use it as project memory.

Project-specific state belongs under:

```text
.project-learning/
```

Modify the root `AGENTS.md` only when:

- the framework specification requires correction;
- a repository-wide operating rule changes;
- the user explicitly requests a framework change.

Preserve its generic behavior.

---

# 28. Markdown Size Policy

No Markdown file created or materially maintained by this framework may exceed:

```text
32 KiB = 32768 bytes
```

Use actual encoded byte size.

Treat:

```text
28 KiB = 28672 bytes
```

as the soft limit.

When a Markdown file approaches the soft limit:

1. split details into focused files;
2. keep the original file as an index or concise summary;
3. link to the split files;
4. verify every resulting Markdown file remains below 32 KiB.

Prefer SQLite, JSON, JSONL, CSV, or other structured formats for growing machine data.

Never intentionally leave a Markdown file above 32768 bytes.

---

# 29. Status File

Maintain:

```text
.project-learning/STATUS.md
```

as a concise human-readable summary.

Include:

- framework initialized: yes/no;
- schema version;
- total completed tasks;
- total usable training examples;
- active objectives;
- current champions;
- last training time;
- last evaluation time;
- next lifecycle threshold;
- pending lifecycle work;
- drift/monitoring status;
- known framework limitations.

Do not store detailed history in `STATUS.md`.

Keep machine-readable truth in the database and registries.

---

# 30. Lifecycle Command

Create a single lifecycle entry point:

```text
python .project-learning/framework/lifecycle.py
```

Support operations equivalent to:

```text
bootstrap
pre-task
post-task
train
evaluate
status
rebuild-memory
rollback
```

Exact CLI syntax may adapt to the implementation.

The lifecycle command must orchestrate framework behavior rather than requiring coding agents to manually coordinate every internal script.

---

# 31. Pre-Task Procedure

Before each task:

1. confirm framework health;
2. record task start;
3. retrieve learned context;
4. write `runtime/context.json`;
5. inspect current repository evidence;
6. perform the task.

If the framework is temporarily unavailable, continue using repository evidence and record the framework failure for repair.

---

# 32. Post-Task Procedure

After each task:

1. record files inspected and modified;
2. record verification;
3. record observations;
4. record outcome;
5. update active memory;
6. close the task record;
7. check dataset eligibility and diversity;
8. run permitted training/evaluation or record it as pending;
9. promote, reject, or retain challengers using statistical promotion rules;
10. run post-promotion/drift checks when due;
11. update `STATUS.md`.

This procedure is automatic when tooling access and configured resource policy permit it.

---

# 33. Framework Failure Handling

The learning framework must never block essential repository work solely because its own model or data pipeline fails.

If framework execution fails:

1. preserve the host-project work;
2. record the framework error;
3. fall back to deterministic retrieval or direct repository inspection;
4. repair the framework when practical;
5. do not corrupt the champion registry or canonical database.

---

# 34. Completion Criteria

A coding task is complete when applicable requirements are satisfied:

- requested work is complete;
- relevant verification is complete;
- the task outcome is recorded;
- useful observations are stored;
- stale memory discovered during work is corrected;
- lifecycle eligibility is checked;
- eligible training/evaluation has run;
- model promotion decisions are recorded;
- changed Markdown files remain under 32 KiB.

Do not fabricate learning events just to satisfy the framework.

---

# 35. Guiding Principle

Every completed task should make the project-learning system better informed.

Every trained model must have a baseline.

Every promoted model must earn promotion through evaluation.

Every prediction is advisory until verified against the repository.

Every useful outcome should become reusable evidence.

**Collect → Build Dataset → Train → Evaluate → Promote → Retrieve → Work → Learn → Repeat.**
