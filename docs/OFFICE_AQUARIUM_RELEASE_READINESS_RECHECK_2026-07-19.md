# Office Aquarium Public Beta 0.9 Readiness Recheck

**Recheck date:** 2026-07-19
**Baseline commit:** `7ad5a966fd4b1a51c3a6316d5a6fdb35dcba5bd9`
**Application version:** 0.9.0
**Save version:** 41

## Executive Summary

**Not Ready**

The hardening pass fixed the measured simulation, persistence, recovery, CI,
web packaging, mobile navigation, accessibility, report readability, and
release-metadata blockers. The complete 51-group source suite passes twice.
The required 60-company Day-365 strategy matrix also passes every
constants-owned survival range with zero system errors, timeouts, or false
passes. A clean extracted web package passes its expanded player-flow smoke
with no browser or asset errors.

One release gate remains open: the final Windows package has not completed a
clean install, launch, save/continue, audio, and uninstall certification. The
managed environment blocks newly built unsigned applications and did not allow
a final rebuild cycle. The web package is certified for distribution testing,
but the complete cross-platform Public Beta cannot be approved yet.

## Fixes Completed

| Finding | Resolution | Evidence | Remaining risk |
|---|---|---|---|
| RR-01 runtime failures looked frozen | Fixed | All 20 daily stages pause, emergency-save, and open player recovery | Device-specific storage failure remains possible |
| RR-02 Day-365 false pass | Fixed | Exact horizon/result contract rejects timeout and system error | None known |
| RR-03 no viable first-year proof | Fixed | 20 seeds x 3 strategies pass survival ranges | Continue post-beta balance monitoring |
| RR-04 save size lacked headroom | Fixed | 40-person fixture 2.6%; 60-person fixture 3.1% of budget | Browser quotas vary |
| RR-05 no production save recovery | Fixed | Candidate/current/backup protocol and recovery UI | External storage deletion cannot be prevented |
| RR-06 CI omitted release suite | Fixed | Main, long-run, and release workflows cover source and packages | Hosted workflows must run on the pushed commit |
| RR-07 artifacts not launch-tested | Partially fixed | Clean web package launch-smoked; strict Windows workflow exists | Final Windows launch remains uncertified |
| RR-08 mobile Paper hidden | Fixed | Five 48-pixel destinations verified at five widths | Physical-device testing remains useful |
| RR-09 profile exposed internals | Fixed | Player labels, prose confidence, dialog/focus/Escape checks | Content can continue to be polished |
| RR-10 reports too dense | Improved | Exception-first rows and progressive disclosure | Mature companies still contain substantial detail |
| RR-11 README overstated CI | Fixed | README names exact workflows and Windows limit | None known |
| RR-12 copied constants | Fixed | Shared release, storage, validation, cadence, governance, and UI rules; 211 checks | Keep enforcing ownership |
| RR-13 desktop CSP disabled | Fixed | Local-only CSP, no remote sources | Inline script/style remain due current architecture |
| RR-14 modal semantics incomplete | Fixed | Shared dialog labels, focus trap/restore, and Escape | Full assistive-technology session recommended |
| RR-15 mobile targets small | Fixed | Primary targets measure 48 CSS pixels | Dense secondary text remains compact |
| RR-16 stale installers | Fixed in tooling | Packaging cleans output and writes hashes/manifests | Final Windows artifact still needs execution |
| RR-17 large ordered modules | Deferred | Ownership and order regressions reduce release risk | Post-beta maintainability work remains |
| RR-18 no license/notices | Fixed with owner follow-up | License, generated notices, and attribution | Confirm audio/icon distribution permission |
| RR-19 no first-launch Handbook | Fixed | First-launch action opens the Handbook | None known |

## Balance Results

The final matrix ran 20 deterministic seeds for each Day-365 strategy.

| Strategy | Survival | Target | Median failure day | Median cash | Avg headcount |
|---|---:|---:|---:|---:|---:|
| Conservative | 65% | 65-85% | 219 | $26.04M | 12.9 |
| Balanced | 85% | 70-85% | 213 | $18.28M | 14.2 |
| Growth-oriented | 55% | 45-75% | 248 | $9.39M | 13.8 |

Cross-matrix integrity:

- system errors: 0
- timeouts: 0
- false passes: 0
- deterministic terminal results: 60
- maximum save: 1,487,688 characters

Failure causes are meaningfully different. Conservative failures are mostly
board/reputation related. Balanced has the highest reliability. Growth accepts
more expansion and spending risk and fails through a mix of board pressure,
operational collapse, and insolvency.

A three-seed-per-strategy Day-730 smoke produced no technical failure or false
pass. First-year ranges are intentionally enforced only at Day 365.

## Save Results

| Scenario | Raw characters | Stored characters | Budget use |
|---|---:|---:|---:|
| New company | 121,769 | 66,096 | 1.4% |
| 40 employees, Day 365 | 296,621 | 122,192 | 2.6% |
| 60 employees | 392,038 | 146,220 | 3.1% |

Recovery tests cover corrupt current data, valid backup restore, backup-only
startup, corrupt current and backup, quota rejection, unavailable storage,
migration failure, candidate cleanup, raw export, new-company reset, and
deterministic compact round-trip.

## CI Results

Main CI runs:

- JavaScript syntax and release metadata
- all 51 source regression groups
- clean extracted web-package smoke
- generated-notice consistency
- locked Rust/Tauri check
- tested web artifact upload

The long-run workflow runs the deterministic Day-365 matrix and uploads JSON
and Markdown evidence. The release workflow requires the matrix, full suite,
web package smoke, Windows package integrity, Windows install/launch/uninstall,
and artifact uploads.

## Build Certification

### Web

**Passed.**

- Archive: `Office_Aquarium_Public_Beta_0.9_itch_web.zip`
- Size: 1,555,157 bytes
- SHA-256:
  `b237770b7003b85ec447cffb6c5a2fb9fe71bb0e1e527f884d9a9386921d1abb`
- Manifest entries: 26
- Browser errors: 0
- Failed requests: 0
- Launch, restart, save/resume, Handbook, Inbox/archive, hiring/onboarding,
  projects/reports/Paper, audio wiring, loss, runtime recovery, and backup
  restore: passed

### Windows

**Final build and launch certification pending.**

The release scripts and strict integrity/launch tests exist. This managed
environment could not execute the required final unsigned build and installed
application. No final Windows hash or launch pass is claimed.

## Category Review

### 1. First-Time User Experience

First launch offers the Handbook. Startup distinguishes all save/recovery
states in plain language. **Beta-ready.**

### 2. User Interface

All primary mobile destinations remain visible, side rails scroll correctly,
dialogs are keyboard-operable, and developer tools remain hidden in normal
play. **Beta-ready, with physical-device polish still useful.**

### 3. Gameplay Balance

All three first-year strategies meet their measured ranges. The game remains
fallible and strategy-dependent without making every failure inevitable.
**Beta-ready.**

### 4. Simulation Quality

Hiring, projects, blockers, customers, social behavior, Institutional Learning,
executive advice, governance, and failure paths retain deterministic coverage.
**Beta-ready.**

### 5. Player Feedback

Runtime and save failures are visible and recoverable. Reports prioritize
changes, exceptions, and required decisions. **Beta-ready.**

### 6. Performance

Two complete source-suite passes finish in about five to six minutes. Save
headroom is substantial and the web package is 1.56 MB. **Beta-ready with
lower-end mobile monitoring.**

### 7. Determinism

Randomness, IDs, validation strategy, save continuation, and horizon contracts
are deterministic. **Release-ready.**

### 8. Save And Load

Candidate/current/backup promotion, corruption classification, restore/export,
and mature-workforce budgets pass. **Beta-ready.**

### 9. Documentation

README, release notes, Product Bible, master specification, player guide,
manual, Handbook, work log, matrix report, save report, build certificate, and
this recheck agree on Public Beta 0.9 and Save Version 41. **Beta-ready.**

### 10. Code Quality

Shared behavioral values live in the constants module and ownership tests
reject copied sentinels and major duplicated rules. Large ordered modules remain
a post-beta concern. **Acceptable for beta.**

### 11. Testing

Both final source-suite passes are 51/51. The 60-company matrix and clean web
package pass. Windows execution remains open. **Not fully certified.**

### 12. Visual And UX Polish

Profiles, reports, navigation, focus behavior, and touch targets pass the
release UI checks. **Beta-ready.**

### 13. Release Polish

Versioned web artifacts, manifests, hashes, CSP, license, notices, privacy
wording, and package allowlists are present. Windows remains unsigned and
launch-uncertified. **Not fully certified.**

### 14. Fun Factor

The autonomous-company premise remains intact. Balanced leadership is viable,
while conservative and growth strategies create different pressures and
failure stories. **Suitable for beta observation.**

## Remaining Known Issues

1. The final Windows build has not passed clean install, launch, continue,
   audio, and uninstall certification.
2. The unsigned Windows installer may trigger SmartScreen or organization
   policy.
3. Audio and icon distribution permission should be confirmed by the owner.
4. The small Day-730 sample suggests second-year cash growth deserves a larger
   post-beta matrix.
5. Large ordered runtime modules remain a post-beta maintainability risk.

## Final Recommendation

DO NOT RELEASE YET
