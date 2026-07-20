# Office Aquarium Save Size and Recovery Report

**Release target:** Public Beta 0.9
**Save version:** 41
**Test:** `npm run test:save-recovery`

## Executive Result

The persistence blocker from the baseline audit is fixed in the tested
representative cases.

- Current and last-known-good saves are stored separately.
- Candidate saves are parsed and validated before promotion.
- Corruption, migration failure, unavailable storage, and quota failure are
  distinguishable from a company with no save.
- Autosave failures are visible to the player.
- Recovery supports backup restore, raw current/backup export, starting a new
  company, and canceling.
- Compact saves preserve deterministic state and remain backward-compatible
  with prior raw and compact-v1 envelopes.

## Storage Rules

Persistence limits are owned by `src/core/constants.js`.

| Rule | Characters |
|---|---:|
| Soft warning | 2,800,000 |
| Compaction threshold | 3,290,000 |
| Hard write limit | 4,000,000 |
| Reserved margin | 700,000 |
| Supported analysis budget | 4,700,000 |

A rejected candidate cannot overwrite the prior valid save. The hard write
limit preserves margin for browser overhead and the last-known-good slot.

## Before And After

Baseline serialized sizes used the prior persistence format:

| Baseline scenario | Characters | Budget use |
|---|---:|---:|
| Day 50 | 2,869,193 | 61.0% |
| Day 100 | 3,995,155 | 85.0% |
| 29 employees | 4,670,479 | 99.4% |

Current deterministic fixtures:

| Hardened scenario | Raw characters | Stored characters | Budget use | Status |
|---|---:|---:|---:|---|
| New company, 8 employees | 121,769 | 66,096 | 1.4% | Healthy |
| 40 employees, Day 365 | 296,621 | 122,192 | 2.6% | Healthy |
| 60 employees | 392,038 | 146,220 | 3.1% | Healthy |

The 40- and 60-person cases are controlled mature-company fixtures used to
stress persistence structure. The separate first-year matrix recorded a
largest live simulation save of 1,487,688 characters, still below the soft
warning threshold.

## Recovery Coverage

The browser regression passed all of these cases:

1. Corrupt current save with a valid backup.
2. Missing current save with a valid backup.
3. Corrupt current and corrupt backup.
4. Quota failure without losing the previous current save.
5. Candidate cleanup after a failed write.
6. Unavailable local storage.
7. Older compatible save requiring migration.
8. Migration failure opening recovery UI and disabling unsafe Continue.
9. Current and backup export using the `.oasave` extension.
10. Successful backup restore.
11. New-company reset without retaining stale backup data.
12. Compact round-trip and deterministic-state preservation.
13. Warning, compaction, and hard-limit thresholds.

## Remaining Risk

Browser quotas differ by platform, privacy mode, embedded browser, and device.
The measured limits and backup protocol provide substantial headroom, but an
exported save remains the strongest protection when moving between devices or
clearing browser data.
