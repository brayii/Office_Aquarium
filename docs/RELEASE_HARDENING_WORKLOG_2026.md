# Office Aquarium Release Hardening Work Log

**Target:** Office Aquarium Public Beta 0.9
**Date:** 2026-07-19
**Baseline commit:** `7ad5a966fd4b1a51c3a6316d5a6fdb35dcba5bd9`
**Application version:** `0.9.0`
**Current save version:** `41`

## Baseline

The baseline application was playable and its ordinary suite passed, but the
release audit found these blockers:

- the long-run validator could report success without reaching Day 365
- deterministic validation did not exercise meaningful CEO strategies
- mature saves approached the supported browser-storage budget
- corrupt saves lacked a production recovery path
- guarded runtime errors could look like a frozen office
- CI did not run the complete release suite or clean package smokes
- mobile navigation, reports, profiles, and dialogs needed release polish
- packaging could preserve stale artifacts and lacked complete legal metadata
- no final clean web or Windows launch certification existed

Baseline save measurements:

| Scenario | Serialized characters | Supported-budget use |
|---|---:|---:|
| Day 50 | 2,869,193 | 61.0% |
| Day 100 | 3,995,155 | 85.0% |
| 29 employees | 4,670,479 | 99.4% |

## Fixes Completed

### Long-run validation and balance

- Added explicit `completed`, `company_failed`, `timed_out`, and
  `system_error` result contracts.
- Derived tick budgets from the requested horizon and rejected false
  completion.
- Added deterministic conservative, balanced, growth-oriented, and
  recovery-focused validation controllers with decision logs.
- Kept validation isolated from the live save and browser storage.
- Added board, trust, investor, risk, project, blocker, backlog, customer, and
  financial trajectory evidence.
- Applied survival ranges only to the shared Day-365 first-year horizon;
  extended-horizon runs are stability smokes.
- Tuned growth strategy through shared constants so it accepts more expansion
  and spending risk without weakening critical-quality safety.

### Persistence and recovery

- Added compact-v2 repeated-string dictionaries and compression while
  retaining prior raw and compact-v1 reads.
- Added centralized warning, compaction, hard-limit, and reserved-margin
  rules.
- Added validated candidate writes, current saves, and last-known-good backup
  promotion.
- Distinguished no save, valid save, corruption, backup-only, migration,
  unavailable storage, and quota failure.
- Added restore, export, new-company, and cancel recovery actions.
- Added controlled 40-person Day-365 and 60-person save tests.

### Runtime recovery

- Guarded the minute cycle and every named daily-close stage.
- Failures pause the office, stop the current speed batch, record a
  player-safe stage, attempt an emergency save, and show recovery actions.
- Raw stacks remain developer-only.
- Injected failures pass for all 20 daily stages with a recoverable current and
  backup save pair.

### Simulation integrity

- Corrected Investor Confidence smoothing so stable fundamentals no longer
  drift incorrectly.
- Made organizational financial momentum consume authoritative net cash flow.
- Preserved board-governance object identity so a CEO PIP cannot restart each
  day or issue duplicate quarterly evaluations.
- Fixed contractor expiry, investor memo cadence, decision escalation cadence,
  project action classification, and first-year validation safety scoring.
- Kept persisted daily telemetry bounded while isolated validation retains its
  full trajectory.
- Required sustained social interaction before informal-group membership,
  while still preventing passive co-presence from creating groups.

### Release UI and accessibility

- Kept all five primary destinations visible at 320, 375, 390, 414, and
  768-pixel widths with 48-pixel primary targets.
- Replaced internal profile labels with player language and prose confidence.
- Added dialog semantics, focus trapping/restoration, visible focus, and
  Escape behavior.
- Changed reports to compact exception-first rows with progressive detail.
- Kept developer validation and audit data hidden in normal play.
- Added first-launch Handbook access and player-safe runtime/save notices.

### CI, security, and packaging

- Main CI runs syntax checks, the complete source suite, clean extracted web
  package smoke, current notices, and locked Rust check.
- Added scheduled/manual long-run and release-candidate workflows.
- Added clean allowlisted web and Windows packaging, versioned filenames,
  manifests, hashes, and stale-output removal.
- Added strict package integrity and Windows install/launch/uninstall checks.
- Enabled a local-only Tauri Content Security Policy.
- Added project license, asset attribution, and generated third-party notices.
- Public packages exclude tests, private plans, logs, `misc/`, repository
  metadata, and developer output.

## Validation Results

### Complete source suite

| Pass | Result | Runtime |
|---|---|---:|
| First final pass | 51/51, 100% | 326.6 seconds |
| Second final pass | 51/51, 100% | 316.1 seconds |

### First-year strategy matrix

The final 20-seed-per-strategy Day-365 matrix passed with zero system errors,
timeouts, or false passes.

| Strategy | Survival | Target | Median cash | Avg headcount | Main failure pattern |
|---|---:|---:|---:|---:|---|
| Conservative | 65% | 65-85% | $26.04M | 12.9 | Board/reputation |
| Balanced | 85% | 70-85% | $18.28M | 14.2 | Board/reputation |
| Growth-oriented | 55% | 45-75% | $9.39M | 13.8 | Mixed board, operations, insolvency |

A three-seed-per-strategy Day-730 smoke produced no technical failures and a
maximum save of 1,536,860 characters. Its survival results are descriptive;
the Day-365 bands are not reused as two-year acceptance criteria.

### Save measurements

| Scenario | Raw characters | Stored characters | Budget use |
|---|---:|---:|---:|
| New company | 121,769 | 66,096 | 1.4% |
| 40 employees, Day 365 | 296,621 | 122,192 | 2.6% |
| 60 employees | 392,038 | 146,220 | 3.1% |

The largest live first-year matrix save was 1,487,688 characters, below the
2,800,000-character warning threshold.

### Web package

| Item | Value |
|---|---|
| Archive | `Office_Aquarium_Public_Beta_0.9_itch_web.zip` |
| Size | 1,555,157 bytes |
| SHA-256 | `b237770b7003b85ec447cffb6c5a2fb9fe71bb0e1e527f884d9a9386921d1abb` |
| Manifest entries | 26 |
| Browser errors / failed requests | 0 / 0 |

The clean extracted smoke covers launch, restart, save/resume, Handbook,
recruiting, completed onboarding, projects, reports, Weekly Report, Inbox,
Old Messages, audio wiring, loss flow, runtime recovery, and backup restore.

## Environmental Limit

The final Windows package is not launch-certified. The managed environment
blocks newly built unsigned applications and its execution allowance prevented
a final rebuild/install/launch/uninstall cycle. The release workflow requires
that cycle on a normal Windows runner before publishing a Windows package.

This is an open certification gate, not a claimed pass.

## Remaining Risks

- Windows installation, launch, save/continue, audio, and uninstall still need
  certification from the final source.
- The unsigned Windows installer may trigger SmartScreen or organization
  policy.
- The owner should confirm distribution permission for the supplied audio and
  icon assets.
- The small Day-730 sample showed high cash in surviving balanced companies;
  larger second-year matrices should monitor compounding after beta.
- Several ordered runtime modules remain large. Their ownership tests reduce
  current risk, but modularization remains post-beta maintenance work.
