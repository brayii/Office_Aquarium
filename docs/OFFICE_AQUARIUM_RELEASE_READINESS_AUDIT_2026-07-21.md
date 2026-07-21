# Office Aquarium Public Beta 0.9 Release Readiness Audit

**Audit date:** 2026-07-21  
**Audited commit:** `9eebdf3`  
**Application version:** `0.9.0`  
**Save version:** `41`  
**Private audit input:** `CODEX_RELEASE_READINESS_AUDIT_SPEC.md` was read locally and is ignored by `.gitignore` through `CODEX_*.md`.

## Executive Summary

**Overall recommendation: Not Ready for full public release. Web beta candidate is strong, but full release certification is incomplete.**

Office Aquarium is substantially stronger than the historical 2026-07-19 baseline audit. The source suite, constants ownership, save/recovery, package metadata, web package smoke, Windows package integrity, Handbook, message lifecycle, hiring, projects, social AI, emotional systems, Institutional Learning, crisis/loss paths, and release UI checks all pass on the audited source.

The game is suitable for a cautious web beta candidate if the owner accepts the remaining release caveats. It is not fully certified as a public release because the local environment still blocks the Windows install/launch/uninstall smoke and the full Day-365 20-seed matrix did not complete inside the local audit time budget.

The current release risk is no longer "missing simulation architecture." The risk is release proof: completing the slow long-run matrix in CI or a dedicated runner, certifying the Windows binary on a machine that allows unsigned apps to launch, and confirming asset ownership before broad distribution.

## Audit Evidence

Fresh checks performed during this audit:

| Check | Result | Evidence |
|---|---:|---|
| Private spec ignored | Pass | `git check-ignore -v CODEX_RELEASE_READINESS_AUDIT_SPEC.md` matched `.gitignore:48:CODEX_*.md` |
| Release metadata | Pass | `npm.cmd run verify:release-metadata` returned `ok: true` for `0.9.0`, offline, telemetry false |
| Constants ownership | Pass | `npm.cmd run test:constants` passed 211 checks across release, storage, validation, rooms, hiring, project, executive inbox, crisis, pipeline, and social ownership sections |
| Full source report | Pass | `npm.cmd run test:report` passed 51/51 groups in 380.7 seconds |
| Web package smoke | Pass | `npm.cmd run test:package-web` passed; ZIP had 26 files, 1,555,157 bytes, SHA-256 `193894326fa365f5288725ae56ba82121d7d5e491eeaa0beb7c899c180ab9650` |
| Windows package integrity | Pass | `npm.cmd run test:package-windows` passed after allowing the Tauri NSIS bundler; installer and portable EXE were produced and inspected |
| Windows launch/install smoke | Blocked | `npm.cmd run test:windows-launch` failed at `Start-Process` with `Access is denied` before install launch certification could run |
| Short deterministic projection | Pass | Default `npm.cmd run test:long-run` reached Day 60 for conservative, balanced, and growth-oriented strategies with zero system errors, timeouts, or false passes |
| Full Day-365 local matrix | Incomplete | 20 seeds x 3 strategies timed out after 20 minutes; 3 seeds x 3 strategies timed out after 10 minutes; neither produced a final local report |

Generated package evidence:

| Artifact | Size | SHA-256 |
|---|---:|---|
| `dist/Office_Aquarium_Public_Beta_0.9_itch_web.zip` | 1,555,157 bytes | `193894326fa365f5288725ae56ba82121d7d5e491eeaa0beb7c899c180ab9650` |
| `dist/windows/Office Aquarium_0.9.0_x64-setup.exe` | 3,304,526 bytes | `ef2d010d54c139cb0c51917a1d6e6cf7ccb9ec1ae3e94e5b7130e15a9bc29713` |
| `dist/windows/Office_Aquarium_0.9.0_windows_x64.exe` | 10,084,864 bytes | `8a900fc06c2acade2392aebaefba6b2c47259a35da188772e5dd255ad95de218` |

## Release Score

| Area | Score | Evidence-based explanation |
|---|---:|---|
| Onboarding | 92 | The Handbook, player guide, first-launch flow, restart confirmation, and package smoke all verify that a new player can start, read help, restart safely, and continue a save. |
| User Interface | 87 | Release UI, Handbook, package smoke, Inbox/archive, project reports, Paper, and mobile-tab behavior are covered. Remaining risk is normal beta polish and physical-device review. |
| Gameplay | 84 | Hiring, projects, blockers, customers, messages, loss paths, and crisis recovery pass targeted tests. Long first-year balance proof did not complete locally in this audit. |
| AI Systems | 92 | Work AI, Social Personality AI, emotional homeostasis, Institutional Learning, conversation presence, social organization, and ownership boundaries pass the current suite. |
| Simulation Quality | 88 | The simulation has active producers/consumers for operating health, project staffing, blockers, customer state, risk pillars, and learning evidence. |
| Balance | 78 | Short projection passes and previous hardening docs report a passing 20-seed matrix, but this audit could not reproduce the full Day-365 matrix locally inside the time budget. |
| Performance | 78 | The 51-group suite completes in about 6.3 minutes and the web package is small, but Day-365 local matrix throughput is now the largest release-proof concern. |
| Stability | 89 | Runtime recovery, save recovery, static structure, browser smoke, and package smoke pass. Windows launch certification is still blocked by the environment. |
| Polish | 84 | Release messages, newspaper clarity, accessible release UI, Handbook, audio wiring, and archive behavior are covered. Final player-facing polish should continue during beta. |
| Documentation | 90 | README, player guide, release notes, build certification, master spec, and historical audit/recheck docs are present and mostly current. |
| Testing | 86 | The source suite is broad and passes. The remaining gap is not unit coverage; it is completing long-run and Windows-launch release gates in an environment that allows them. |

**Overall release score: 84 / 100**

## Category Review

### 1. First-Time User Experience

The startup, Handbook, restart confirmation, save/recovery flow, package smoke, and player guide all support a new player beginning without external documentation. The Handbook remains important because the simulation is intentionally not a micromanagement game.

Verdict: **Beta-ready.**

### 2. User Interface

Release UI checks and package smoke cover the main Office, Handbook, Inbox/archive, project reports, Paper, hiring/onboarding, restart, and recovery flows. The design is readable enough for beta, though real user sessions should still watch for dense company-report sections and smaller-screen comfort.

Verdict: **Beta-ready with normal polish monitoring.**

### 3. Gameplay Balance

The default short projection reached Day 60 with all three strategies alive and no technical failures. The previous hardening recheck documents a passing 20-seed Day-365 matrix, but this audit could not reproduce that full matrix locally because both the 20-seed and 3-seed Day-365 runs timed out before producing reports.

Verdict: **Adequate for web beta, not enough fresh local proof for final release.**

### 4. Simulation Quality

The current test suite covers work AI, social familiarity, shared experiences, relationship interpretation, social preferences, reputation, emotional integration, conflict/repair, conversation presence, social organization, Institutional Learning, customer/product exposure, operating health, hidden state access, and ownership boundaries.

Verdict: **Strong.**

### 5. Player Feedback

The package smoke confirms Handbook, Inbox/archive, projects/reports/Paper, hiring/onboarding, and runtime/save recovery are visible enough to exercise. Memo clarity and newspaper clarity tests also pass. The CEO receives messages without the game silently mutating the live save during validation.

Verdict: **Beta-ready.**

### 6. Performance

The full source suite passed in 380.7 seconds. Web package size is 1.56 MB. The slow Day-365 matrix is the major performance/readiness caveat: it may be fine in CI, but locally it did not finish inside 10-20 minutes and provided no progress output while running.

Verdict: **Runtime looks stable; long-run validation throughput needs attention.**

### 7. Determinism

Release metadata, constants, daily pipeline, validation isolation, save/recovery, long-run contract, and default long-run all pass. The constants module owns random state, runtime IDs, horizon contracts, daily stage order, storage limits, hiring rules, and project lifecycle rules.

Verdict: **Release-ready.**

### 8. Save And Load

Save/recovery regression passes inside the 51-group suite. Package smoke covers save/resume and runtime/save recovery. The current docs and constants agree on Save Version 41 and compact save behavior.

Verdict: **Beta-ready.**

### 9. Documentation

README, release notes, player guide, player manual, master spec, build certification, hardening work log, save report, and historical audit docs are present. This audit adds current evidence without erasing the baseline.

Verdict: **Beta-ready.**

### 10. Code Quality

The constants file contains the reviewer rule requiring shared rules to live in one place, and the constants regression suite passed 211 checks. Static structure passed inside the full report. Large ordered modules remain a long-term maintainability cost, but the project now has source ownership boundaries and regression coverage.

Verdict: **Acceptable for beta.**

### 11. Testing

The local suite is broad and passed 51/51. Package tests pass for web and Windows integrity. The manual failure-test page is covered by automation. CI is configured to run the complete release suite, a web package smoke, and Rust check; release workflow includes the long-run gate and Windows package steps.

Verdict: **Strong, with two release-gate caveats.**

### 12. Visual And UX Polish

The UI has been cleaned for release: developer/debug tools are hidden from normal play, Handbook and release UI tests pass, and player-facing flows are covered by browser/package tests. Continue physical-device playtesting because automated browser checks cannot replace hand feel.

Verdict: **Beta-ready.**

### 13. Release Polish

The web package excludes tests, private plans, work logs, repository metadata, and developer archives. The private audit spec is ignored. License, asset attribution, third-party notices, release notes, player guide, manifests, and SHA files are included in packages.

Verdict: **Web beta-ready; Windows binary still needs launch certification.**

### 14. Fun Factor

The design remains distinct: the player leads, the employees act for themselves, projects create work, messages are interpreted through imperfect company information, and the office creates long-running stories. The current systems support the original "living organization" promise.

Verdict: **Good beta hook.**

## Findings

### RA-01 - Windows install/launch/uninstall certification is still blocked

- **Severity:** Major
- **Affected file(s):** `tests/windows-install-launch-smoke.ps1`, `tools/package-windows-release.ps1`, `dist/windows/`
- **Affected system:** Windows release certification
- **Evidence:** `npm.cmd run test:package-windows` passed and produced a valid installer plus portable EXE. `npm.cmd run test:windows-launch` failed before launch at `Start-Process` with `Access is denied`.
- **Player impact:** The Windows artifact exists and passes integrity checks, but this environment has not proven install, launch, save/continue, audio, close, and uninstall behavior.
- **Recommended fix:** Run `npm.cmd run test:windows-launch` on a Windows machine or CI runner that permits unsigned beta executables. Record the pass in build certification before broad Windows release.
- **Blocks release:** Blocks full Windows release certification; does not block web beta.

### RA-02 - Full Day-365 matrix did not complete locally during this audit

- **Severity:** Major
- **Affected file(s):** `tests/long-run-balance-test.js`, `tools/run-long-run-matrix.ps1`, `.github/workflows/long-run.yml`
- **Affected system:** Long-run balance validation
- **Evidence:** A 20-seed-per-strategy Day-365 run timed out after 20 minutes with no final output. A smaller 3-seed-per-strategy Day-365 run timed out after 10 minutes with no final output. The default Day-60 projection passed in 31.3 seconds.
- **Player impact:** The game may still be balanced, but this audit could not freshly reproduce the first-year matrix evidence locally. Lack of progress output also makes long runs hard to diagnose while they are running.
- **Recommended fix:** Use the GitHub long-run workflow or a dedicated local run with a larger timeout for release certification. Consider adding periodic progress output so a slow matrix does not look stuck.
- **Blocks release:** Blocks final release proof; does not block cautious web beta if previous matrix evidence is accepted.

### RA-03 - Asset ownership/provenance remains an owner confirmation item

- **Severity:** Minor
- **Affected file(s):** `assets/audio/game_music_loop.mp3`, `assets/audio/new_message_alert.mp3`, `ASSET_ATTRIBUTION.md`
- **Affected system:** Release legal/attribution
- **Evidence:** Packages include `ASSET_ATTRIBUTION.md`, `LICENSE`, and generated `THIRD_PARTY_NOTICES.md`. The automated audit cannot prove the owner's distribution rights for user-provided audio.
- **Player impact:** Low technical risk, but distribution rights should be clear before public upload.
- **Recommended fix:** Owner confirms audio/icon provenance and updates `ASSET_ATTRIBUTION.md` if any source, license, or credit needs to be more specific.
- **Blocks release:** No for private testing; should be confirmed before public distribution.

### RA-04 - Large runtime modules remain a maintainability risk

- **Severity:** Minor
- **Affected file(s):** `src/systems/executive-messages.js`, `src/systems/workforce-leadership.js`, `src/systems/social-organizational.js`, `src/core/state-startup.js`
- **Affected system:** Code maintainability
- **Evidence:** The package manifest shows several runtime files above 100 KB, including executive messages, workforce leadership, social organization, and startup state.
- **Player impact:** No current player-facing failure. Future changes may be harder to review safely.
- **Recommended fix:** Continue the existing modularization trend after beta by splitting long files around existing lifecycle ownership and preserving deterministic regression tests.
- **Blocks release:** No.

### RA-05 - Long-run matrix lacks live progress feedback

- **Severity:** Minor
- **Affected file(s):** `tests/long-run-balance-test.js`
- **Affected system:** Developer validation ergonomics
- **Evidence:** The Day-365 runs produced no console progress before timing out. The default short run prints only at completion.
- **Player impact:** None directly. Release engineers can mistake a slow matrix for a hang.
- **Recommended fix:** Add optional progress logging at worker/job completion, preferably gated by an environment variable or always concise enough for CI logs.
- **Blocks release:** No.

## Top 10 Release Blockers

1. **Windows launch certification is incomplete.** Integrity passes, but install/launch/uninstall is blocked by `Access is denied` in this environment.
2. **Fresh local Day-365 matrix evidence is incomplete.** The long-run matrix did not finish in this audit's local time budget.
3. **Asset provenance needs owner confirmation.** Package notices exist, but user-provided audio ownership is not machine-verifiable.
4. **Run the release workflow on GitHub before upload.** The configured workflow is the proper all-gates proof path.
5. **Run one physical Windows install session.** Automated local launch was blocked, so a permissive Windows machine should certify it.
6. **Run one physical mobile browser session.** Automated mobile-style checks pass, but actual mobile touch/audio behavior should be felt before public upload.
7. **Keep an eye on first-year memo pace.** Short projection shows roughly 9.5-12 memos/month in early play, which may be acceptable but should be watched in player testing.
8. **Keep long-run validation reports with the release.** The public beta should ship with the exact matrix evidence used to approve it.
9. **Confirm itch.io package launch after upload.** The local extracted ZIP passes; itch hosting should still be checked once uploaded.
10. **Do not label the Windows artifact fully certified until `test:windows-launch` passes.**

Only the first two are technical release gates. The others are publishing discipline and owner-certification items.

## Top 10 Nice-To-Have Improvements

1. Add progress output to the long-run matrix runner.
2. Add a one-command "release audit" script that runs metadata, constants, report, package web, package Windows, and summarizes known environment gates.
3. Add optional physical-device checklist documents for mobile and Windows release sessions.
4. Continue splitting the largest runtime modules after beta.
5. Add a lower-cost medium-run balance test between Day 60 and Day 365 for quicker local confidence.
6. Add release screenshots for itch.io and docs.
7. Add explicit audio provenance fields to `ASSET_ATTRIBUTION.md`.
8. Add optional reduced-motion preference handling if player feedback asks for it.
9. Add a small package manifest diff check that compares staged web and desktop frontend files.
10. Add a beta feedback template for players to report confusing messages, freezes, or save issues.

## Final Recommendation

DO NOT RELEASE YET

The web beta candidate is strong: the source, package, save, UI, simulation, and documentation evidence is in good shape. However, the requested release-readiness audit has to judge the full public release, not only the web ZIP.

Do not call the release fully ready until the Windows launch smoke passes on a permissive Windows environment and the Day-365 matrix is rerun successfully through the intended release workflow.
