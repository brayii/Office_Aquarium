# Office Aquarium Long-Run Strategy Matrix Report

**Release target:** Public Beta 0.9
**Validation date:** 2026-07-21
**First-year horizon:** Day 365
**First-year sample:** 20 seeds per strategy, 60 companies total
**Command:** `OFFICE_AQUARIUM_SEED_COUNT=20`, `OFFICE_AQUARIUM_HORIZON_DAYS=365`, `OFFICE_AQUARIUM_STRATEGIES=conservative,balanced,growth-oriented`, `OFFICE_AQUARIUM_CONCURRENCY=30`, `OFFICE_AQUARIUM_WRITE_REPORTS=1`, then `npm run test:long-run`

## Executive Result

**First-year balance gate: passed. Runtime-integrity gate: passed.**

Every run reached Day 365 or a legitimate company-failure state. The matrix
reported:

- 0 system errors
- 0 timeouts
- 0 false passes
- 60 deterministic terminal results
- all three strategy survival rates inside their constants-owned target ranges

| Strategy | Runs | Survival | Target | Median failure day | Main failure pattern |
|---|---:|---:|---:|---:|---|
| Conservative | 20 | 65% | 65-85% | 219 | Six board/reputation failures; one insolvency |
| Balanced | 20 | 85% | 70-85% | 213 | Three board/reputation failures |
| Growth-oriented | 20 | 55% | 45-75% | 248 | Three each from board/reputation, operations, and insolvency |

## Operating Results

| Strategy | Median cash | Avg headcount | Avg completions | Avg hires | Avg active projects | Final blockers | Final backlog |
|---|---:|---:|---:|---:|---:|---:|---:|
| Conservative | $26.04M | 12.9 | 0.7 | 5.2 | 0.3 | 2.9 | 13.8 |
| Balanced | $18.28M | 14.2 | 0.9 | 6.3 | 0.2 | 1.4 | 13.4 |
| Growth-oriented | $9.39M | 13.8 | 0.8 | 6.3 | 0.7 | 4.8 | 15.0 |

| Strategy | Avg stress | Avg morale | Final investor confidence | Final board | Final company risk | Decisions/month | Memos/month | Max save chars |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Conservative | 32 | 64 | 58 | 72 | 40 | 6.2 | 9.7 | 1,386,984 |
| Balanced | 32 | 64 | 71 | 72 | 36 | 6.2 | 9.7 | 1,465,596 |
| Growth-oriented | 32 | 64 | 49 | 66 | 46 | 7.0 | 10.7 | 1,487,720 |

## Failure Analysis

The result shows meaningful strategy differences without making one approach
perfect:

- Conservative companies preserve more cash and hire fewer people, but can
  lose board support when caution fails to produce enough visible progress.
- Balanced companies are the most reliable first-year operators, with lower
  final risk and fewer unresolved blockers.
- Growth-oriented companies accept more portfolio and spending risk. They
  produce the highest Inbox load and end with less cash, more blockers, and a
  wider mix of insolvency, operational, and board failures.
- Average stress and morale remain similar because all strategies still obey
  the critical quality and burnout guardrails. The strategy distinction comes
  from portfolio, hiring, and financial choices rather than privileged future
  knowledge.

The growth-oriented validation controller was tuned through shared constants.
It accepts more expansion and spending risk than the balanced controller but
does not weaken the rule against accelerating through critical quality.

## Day-730 Smoke

A separate three-seed-per-strategy smoke reached Day 730 or a legitimate
company failure with:

- 0 system errors
- 0 timeouts
- 0 false passes
- maximum save size of 1,536,860 characters

Observed survival was 33% conservative, 67% balanced, and 33% growth-oriented.
These are descriptive smoke results, not failures against the Day-365 target
bands. The validator now applies first-year survival ranges only when the
requested horizon is exactly the shared first-year horizon.

The two surviving balanced companies produced a high median final cash figure
in this very small extended sample. Post-beta tuning should continue to watch
second-year cash growth, project throughput, and long-lived backlog using
larger Day-730 samples.

## Evidence

The matrix runner writes ignored development evidence to:

- `dist/reports/long-run-strategy-matrix.json`
- `dist/reports/long-run-strategy-matrix.md`

The scheduled and release workflows rerun the same deterministic first-year
gate. They fail on a system error, timeout, false completion, or survival
outside the ranges in `src/core/constants.js`.

The local runner now writes partial checkpoints while the matrix is in
progress. If a long local certification run is interrupted, rerunning the same
seed count, horizon, and strategy list resumes completed seed reports instead
of starting over.
