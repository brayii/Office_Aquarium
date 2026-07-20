# Office Aquarium First-Release Readiness Audit

> **Historical baseline:** This document records the pre-hardening `0.40.0`
> assessment. Release fixes are evaluated separately in
> `OFFICE_AQUARIUM_RELEASE_READINESS_RECHECK_2026-07-19.md`; baseline findings
> below are intentionally preserved as evidence.

**Audit date:** 2026-07-19
**Audited commit:** `15ef37b` (`main`)
**Application version:** `0.40.0`
**Save version:** `40`
**Overall recommendation:** Not Ready

## Executive Summary

Office Aquarium already has a distinctive product identity, a large and unusually
well-connected simulation, strong player documentation, deterministic replay, and
successful browser, web-package, and Windows-package builds. The full local automated
suite passed. Desktop and mobile browser checks also completed without JavaScript errors,
including a short 12x-speed run.

The application should not be called a finished 1.0 release yet. The strongest blockers
are not missing simulation systems. They are release-proof and recovery problems:

1. The long-run test can pass without reaching its requested 365-day target.
2. When that test's surviving seeds were allowed to continue, all five validation seeds
   eventually failed before Day 365 under the test's own highest-scored decision policy.
3. A 29-person save is only 29,521 characters below the project's 4,700,000-character
   safety limit.
4. Production saves have no automatic backup or player recovery path for corrupt data.
5. A guarded simulation error pauses the game but leaves the Office saying that the
   company is running, which can still look like an unexplained freeze.
6. GitHub Actions runs only a small subset of the local release suite.

These are fixable. The underlying simulation is much closer to release quality than the
final recommendation may sound, but a public release needs credible long-run evidence
and protection for a player's long-lived company.

## Audit Scope And Evidence

The audit reviewed all 101 tracked files, including:

- `Office_Aquarium.html`
- all runtime files under `src/`
- all automated checks and the manual failure harness under `tests/`
- `README.md`
- all canonical documents under `docs/`
- web and desktop packaging scripts under `tools/`
- Tauri configuration and Rust wrapper under `src-tauri/`
- audio and icon assets
- the shared rules in `src/core/constants.js`

The private instruction file `CODEX_RELEASE_READINESS_AUDIT_SPEC.md` was read locally,
remained ignored by `.gitignore`, and was not included in either release package.

Validation performed:

- Full `npm test`: passed.
- Repeated `npm run test:report`: 46 of 46 test groups passed (100 percent).
- Web package build: passed.
- Generated `dist/itch-web/index.html` direct launch: passed with Save Version 40,
  eight starting employees, hidden developer UI, and no browser errors.
- Desktop frontend package build: passed.
- Tauri Windows executable and NSIS installer build: passed.
- Compiled Windows executable launch: not certified; the audit environment returned
  Access Denied when asked to start the GUI binary.
- Desktop browser audit at 1440 x 900: passed without browser errors.
- Mobile browser audit at 390 x 844: passed without browser errors or horizontal page
  overflow.
- Short 12x-speed desktop and mobile runs: no recorded simulation errors.
- Deterministic save/load regression: passed, including matching continuation hashes.
- Extended deterministic balance runs: no system errors, but all five validation seeds
  failed before Day 365.

## Release Scores

| Area | Score | Evidence-based explanation |
|---|---:|---|
| Onboarding | 84 | The startup choice is clear and the Simulation Handbook is excellent. The first launch does not directly offer the Handbook or a visible first-run walkthrough. |
| User Interface | 74 | The main Office is coherent and responsive. The Company reports surface is dense, the employee profile exposes internal-looking labels, and one mobile destination begins off-screen. |
| Gameplay | 72 | CEO decisions, projects, hiring, customers, crises, and social behavior are connected. Long-term viability has not yet been demonstrated by a valid strategy matrix. |
| AI Systems | 91 | Work, social, emotional, communication, and Institutional Learning boundaries are implemented and heavily tested. The architecture remains explainable and offline. |
| Simulation Quality | 85 | Staffing, work items, blockers, projects, market state, leadership, and organizational outcomes are causally connected. The extended validation policy still ends in universal failure. |
| Balance | 55 | Short and medium runs execute, but the advertised 365-day test stops early and its own policy fails all five seeds when extended. |
| Performance | 80 | Short 12x runs were stable on desktop and mobile, and major histories have caps. Save growth and very large global modules remain scaling concerns. |
| Stability | 72 | Syntax, browser, deterministic, rollover, hiring, project, communication, and social tests pass. Save recovery and player-facing fatal-error handling are not release-safe. |
| Polish | 72 | The visual language is consistent and the Office is pleasant to watch. Reports, employee details, mobile discovery, modal accessibility, and release packaging need a final pass. |
| Documentation | 88 | The README, player manual, release guide, master specification, and in-game Handbook are extensive and current. The README overstates what CI runs. |
| Testing | 68 | Local coverage is broad and valuable. The long-run oracle is invalid, CI omits most tests, and packaged artifacts are built but not launched by an automated check. |

**Overall release score: 76 / 100**

## Category Review

### 1. First-Time User Experience

What works:

- Startup clearly distinguishes continuing a save from starting a new company.
- The opening copy correctly explains that this is an autonomous company.
- The Handbook includes Quick Start, interface guidance, hiring, projects, messages,
  winning, loss paths, mobile play, and sound.
- The starting eight roles match the initial flagship project's required role set.

Remaining concern:

- The first-launch overlay offers only Continue or Start. The complete player guide is
  available only after entering the simulation and opening the gear menu.

### 2. User Interface

What works:

- The main desktop Office, communications rail, and People rail are visually coherent.
- Side lists scroll without forcing the opened memo itself into a short reading viewport.
- Reports, History, and Weekly Report tabs work in browser checks.
- The normal release UI hides developer tools.

Remaining concerns:

- The reports screen is much denser and longer than the Office.
- Employee profiles expose raw belief keys and unexplained counters.
- Mobile navigation requires a hidden horizontal scroll to reach Paper.

### 3. Gameplay Balance

What works:

- Hiring, onboarding, project staffing, blockers, workload, stress, morale, crises,
  revenue, and board pressure all have active producers and consumers.
- The validation controller scores choices rather than always choosing the first option.
- Loss paths and crisis recovery have focused regression coverage.

Remaining concern:

- The current long-run evidence does not establish a viable first-year strategy.

### 4. Simulation Quality

What works:

- Work AI owns work decisions.
- Social Personality AI owns familiarity, relationships, memories, conflict, repair,
  conversation, groups, culture, and informal leadership.
- Emotional state changes remain bounded and return toward personal baselines.
- Institutional Learning requires attributable evidence and review.
- Project health uses actual allocation rather than department headcount alone.

Remaining concern:

- The scale and global-function style make behavior harder to reason about manually even
  though automated boundary tests currently pass.

### 5. Player Feedback

What works:

- Project cards show staffing, missing coverage, backlog, blockers, timing, risk,
  confidence, and commercial state.
- CEO communications preserve messages, choices, recorded decisions, and later outcomes.
- Weekly reports and Company History explain consequences over different time scales.

Remaining concerns:

- A fatal simulation error is not surfaced in the active Office view.
- Employee belief labels are implementation identifiers rather than player language.

### 6. Performance

What works:

- Desktop and mobile 12x checks ran without browser errors.
- Social memory, reports, histories, queues, and runtime diagnostics have explicit caps.
- Generated package size is modest: approximately 1.48 MB for the web ZIP.

Remaining concerns:

- Persistent state is already close to the declared storage budget at 29 employees.
- Several runtime modules exceed 100 KB and perform broad global-state work.

### 7. Determinism

What works:

- Simulation randomness routes through `simulationRandom()`.
- The only native `Math.random()` is the intentional no-company fallback.
- Runtime IDs are deterministic.
- Save-at-Day-50 continuation to Day 100 produces matching hashes and authoritative state.
- Daily pipeline ordering has a dedicated test and a constants-owned stage list.

Verdict:

- Determinism is release-ready.

### 8. Save And Load

What works:

- Compact and legacy raw formats are supported.
- Save migration supplies defaults for current employee and company fields.
- Transient debug state is excluded.
- New-game reset removes the old save before creating a fresh company.

Remaining concerns:

- Corrupt JSON is silently treated as no save.
- There is no production backup slot or recovery UI.
- Save capacity has insufficient margin for a growing organization.

### 9. Documentation

What works:

- Canonical documentation matches Save Version 40 and the split source layout.
- The in-game Handbook is a complete gameplay reference rather than developer
  documentation.
- Packaging instructions match the successful web and Windows builds.

Remaining concern:

- The README says GitHub Actions runs "these checks," but CI runs only static, smoke,
  regression, and Rust checks rather than the full listed suite.

### 10. Code Quality

What works:

- Shared constants are deeply frozen and include an explicit reviewer rule.
- Role definitions, runtime services, systems, UI, bootstrap, and packaging are separated.
- Static checks reject duplicate IDs, duplicate named functions, forbidden network APIs,
  and several boundary violations.

Remaining concerns:

- A few shared values still bypass the constants file.
- Several system files remain very large and rely on ordered globals.
- The facade layer is currently a thin registry, not a strong ownership boundary.

### 11. Testing

What works:

- The local suite covers startup, save/load, deterministic continuation, all 15 roles,
  hiring, onboarding, projects, staffing, crises, loss paths, customer state, messages,
  newspaper, Handbook, AI boundaries, social systems, and emotional homeostasis.
- The failure test page creates targeted current-version saves.
- Validation-isolation tests protect the live save from developer projections.

Remaining concerns:

- The long-run pass condition does not require reaching its target day.
- The CI workflow omits most release tests.
- No automated test opens the generated web ZIP staging output or desktop executable.

### 12. Visual And UX Polish

What works:

- Office movement, bubbles, rooms, status colors, cards, and history views form a
  consistent visual language.
- Speech is readable for longer than the original implementation.
- Desktop and mobile layouts avoid incoherent overlap in the tested viewports.

Remaining concerns:

- Mobile valuation range controls and several command buttons are only 30-38 pixels high.
- Employee and conversation modals lack the dialog semantics used by the Handbook.
- The Reports layout has avoidable blank space beside small card sets.

### 13. Release Polish

What works:

- No product TODO/FIXME markers, online API calls, API keys, or missing runtime assets were
  found.
- Developer tools are hidden in normal play.
- The web ZIP excludes tests, private specifications, and generated developer output.
- Current web and Windows packages build successfully.

Remaining concerns:

- Tauri disables Content Security Policy.
- Old installer versions remain beside the current installer unless build output is
  cleaned.
- The repository has no tracked license or third-party notice document.

### 14. Fun Factor

What works:

- The product has a clear hook: lead people who act for themselves.
- Employees move, talk, disagree, form relationships, learn, and create executive issues.
- Hiring, project growth, market response, newspapers, and company history create
  meaningful long-term goals.

Risk:

- Players are unlikely to enjoy a long company if saves approach failure at ordinary
  workforce scale or if every validated first-year path ends in loss. Long-run strategy
  variety needs proof before release.

## Detailed Findings

### RR-01 - Fatal simulation errors still look like an unexplained pause

- **Severity:** Major
- **Affected files:** `src/systems/workforce-leadership.js:2349-2359`,
  `src/ui/rendering-validation.js:421-427`, `Office_Aquarium.html`
- **Affected system:** Runtime error handling and player feedback
- **Evidence:** `recordSimulationError()` records the error and sets
  `company.paused=true`, but it only appends text to `company.log`. A browser injection
  check confirmed the game was paused while `#officeHeadline` still read "The company is
  running." The detailed error is otherwise developer-facing.
- **Player impact:** A player can believe the game froze again, with no clear explanation,
  recovery instruction, or report action.
- **Recommended fix:** Show a release-safe error notice in the active Office with the
  failed stage, autosave status, and Restart/Export Diagnostics actions. Do not expose a
  raw stack trace outside developer mode.
- **Blocks release:** Yes

### RR-02 - The 365-day test can pass without reaching Day 365

- **Severity:** Major
- **Affected file:** `tests/long-run-balance-test.js:18-46`
- **Affected system:** Long-run validation
- **Evidence:** Each seed stops after 25,000 ticks even if `company.day < targetDay`.
  The result's `ok` condition checks only system errors and a failure rate below 0.8. It
  never requires `report.day >= targetDay`.
- **Player impact:** A green release check can falsely claim long-run stability and
  balance.
- **Recommended fix:** Fail any non-terminal run that does not reach the target day, use
  a calculated tick budget, report timeout separately, and require all intended horizons
  to complete.
- **Blocks release:** Yes

### RR-03 - The validation policy fails all five seeds before one year

- **Severity:** Major
- **Affected files:** `tests/long-run-balance-test.js`,
  `src/systems/executive-messages.js:2290-2316`
- **Affected system:** Gameplay balance and validation strategy
- **Evidence:** The normal long-run run produced early failures for seeds 202 (Day 138)
  and 505 (Day 124). Extending the three nominal survivors produced failures for seed 101
  on Day 197, seed 404 on Day 282, and seed 303 on Day 329. All runs reported zero system
  errors. Validation mode automatically selected the highest `validationDecisionScore()`
  choice.
- **Player impact:** The project has no automated evidence that a coherent, recommended
  strategy can survive the first year. This may reflect balance, the validation policy,
  or both.
- **Recommended fix:** Add at least three named deterministic CEO strategies, run enough
  ticks to completion, establish target survival distributions, and tune only after the
  matrix identifies the dominant failure causes.
- **Blocks release:** Yes

### RR-04 - Mature workforce saves have less than one percent safety margin

- **Severity:** Major
- **Affected files:** `src/core/constants.js:18-29`,
  `tests/simulation-regression-test.js:286-378`
- **Affected system:** Save persistence and long-term scalability
- **Evidence:** The 29-person regression save serialized to 4,670,479 characters against
  `maxPersistedCharacters: 4,700,000`, leaving 29,521 characters (0.63 percent). The
  Day-100 save was already about 3.99 million characters.
- **Player impact:** A long-lived company can stop autosaving after modest additional
  hiring, messages, memories, or project history.
- **Recommended fix:** Set a much lower warning threshold, reduce the largest persistent
  sections, test 40- and 60-person organizations, and implement quota-aware compaction
  before writing.
- **Blocks release:** Yes

### RR-05 - Corrupt or failed saves have no production recovery path

- **Severity:** Major
- **Affected files:** `src/services/runtime-services.js:49-63`,
  `src/core/state-startup.js:1139-1140`
- **Affected system:** Save and load
- **Evidence:** `SaveRepository.read()` catches all parse errors and returns `null`.
  `write()` replaces the only production save directly. `saveGame()` reduces any write
  failure to "Autosave unavailable." Backup/restore exists only in the developer failure
  page.
- **Player impact:** A corrupt or over-quota save can make a long company appear missing,
  without an automatic backup, export, or recovery explanation.
- **Recommended fix:** Maintain a last-known-good backup, validate before replacing it,
  distinguish corrupt from absent saves, and offer recovery/export in the startup UI.
- **Blocks release:** Yes

### RR-06 - CI does not run the release suite described by the README

- **Severity:** Major
- **Affected files:** `.github/workflows/ci.yml:27-47`, `README.md:20-88`,
  `package.json`
- **Affected system:** Continuous integration
- **Evidence:** CI runs syntax, static, browser smoke, simulation regression, and
  `cargo check`. The local `npm test` also runs dozens of hiring, project, crisis,
  communication, Handbook, AI, and social regressions.
- **Player impact:** A change can pass GitHub checks while breaking a release-critical
  system that is covered locally but omitted from CI.
- **Recommended fix:** Make CI run `npm test` or a documented equivalent release suite,
  then place the slower long-run matrix in a scheduled or release workflow.
- **Blocks release:** Yes

### RR-07 - The Windows artifact is not launch-certified by the release process

- **Severity:** Major
- **Affected files:** `tools/package-itch-web.ps1`,
  `tools/package-tauri-frontend.ps1`, `.github/workflows/ci.yml`
- **Affected system:** Release packaging
- **Evidence:** The generated web staging package passed a direct browser launch during
  this audit. The Windows executable and NSIS installer built, but the audit environment
  returned Access Denied when asked to start the GUI binary. The repository has no
  automated check that inspects the final ZIP or launches the compiled desktop
  executable.
- **Player impact:** The current web artifact has direct evidence, but a desktop-wrapper
  or installer-only regression can still reach Windows players despite a green source
  test.
- **Recommended fix:** Add the successful packaged-web smoke as a repeatable test and run
  a Windows release smoke step in an environment allowed to start the executable. Verify
  the main window, assets, save location, and clean exit before upload.
- **Blocks release:** Yes

### RR-08 - The mobile Paper destination begins completely off-screen

- **Severity:** Major
- **Affected file:** `Office_Aquarium.html:194-196`, `291-335`, `793-796`
- **Affected system:** Mobile navigation
- **Evidence:** At 390 pixels wide, `.mobile-tabs` has a 372-pixel client width and a
  455-pixel scroll width. The Paper button begins at x=382 and is not visible until the
  tab bar is horizontally scrolled. The scrollbar is intentionally hidden.
- **Player impact:** A new mobile player can miss the Weekly Report entirely.
- **Recommended fix:** Fit all primary destinations, use a More menu, or expose a clear
  overflow cue while preserving touch targets.
- **Blocks release:** Yes

### RR-09 - Employee profiles expose implementation labels and incomplete meaning

- **Severity:** Major
- **Affected file:** `src/ui/rendering-validation.js:331-363`
- **Affected system:** Employee detail and player feedback
- **Evidence:** Beliefs render direct object keys such as `launchReadiness`, `cashRisk`,
  and `qualityRisk`. Milestones render a bare numeric `achievements` value. Personality
  copy can join clauses awkwardly. The modal also lacks the dialog metadata used by the
  Handbook.
- **Player impact:** A core screen feels developer-facing and leaves players unsure what
  an employee knows or has accomplished.
- **Recommended fix:** Map belief keys to natural labels, explain confidence in prose,
  name milestones, polish personality sentences, and add proper dialog/focus behavior.
- **Blocks release:** Yes

### RR-10 - The Reports surface is too dense for routine executive reading

- **Severity:** Major
- **Affected files:** `Office_Aquarium.html:373`, `900-947`,
  `src/systems/executive-messages.js:1168-1188`,
  `src/systems/workforce-leadership.js`
- **Affected system:** Company reports and portfolio UI
- **Evidence:** A 1440 x 900 browser review showed a very long Reports page with dense
  paragraph-like operational summaries. Four-column grids leave large blank regions when
  only one project exists, while Workforce and Financial Pressure still carries many
  semicolon-separated values.
- **Player impact:** Players must scan too much text to identify the decision-relevant
  changes, weakening the core CEO fantasy.
- **Recommended fix:** Lead with changes and exceptions, use compact labeled rows, adapt
  card columns to item count, and move detail behind disclosure controls.
- **Blocks release:** Yes

### RR-11 - The README overstates GitHub Actions coverage

- **Severity:** Minor
- **Affected file:** `README.md:20-88`
- **Affected system:** Developer documentation
- **Evidence:** The README presents the full suite and then says GitHub Actions also runs
  "these checks," while the workflow runs only a subset.
- **Player impact:** Indirect. Maintainers may overestimate release confidence.
- **Recommended fix:** List the exact CI subset or expand CI first.
- **Blocks release:** No, once RR-06 is addressed

### RR-12 - Shared constant ownership still has a few violations

- **Severity:** Minor
- **Affected files:** `src/core/state-startup.js:1140,1168`,
  `src/ui/rendering-validation.js:37,253`,
  `src/systems/executive-messages.js:419`
- **Affected system:** Determinism, reporting, and maintainability
- **Evidence:** The default random state `2463534242` and unknown-future sentinel `999`
  are repeated outside `src/core/constants.js`, despite the constants file's explicit
  reviewer rule.
- **Player impact:** No current visible failure, but future tuning can make migrations,
  validation, and labels disagree.
- **Recommended fix:** Replace the duplicates with
  `OFFICE_AQUARIUM_CONSTANTS.determinism.defaultRandomState` and
  `OFFICE_AQUARIUM_CONSTANTS.time.unknownFutureDay`; retain regression coverage.
- **Blocks release:** No

### RR-13 - Desktop Content Security Policy is disabled

- **Severity:** Minor
- **Affected file:** `src-tauri/tauri.conf.json`
- **Affected system:** Desktop security hardening
- **Evidence:** The Tauri configuration sets `"csp": null`.
- **Player impact:** The offline app has less defense in depth than a public desktop build
  should have.
- **Recommended fix:** Define a least-privilege local-content CSP and verify all offline
  scripts, styles, and audio still work.
- **Blocks release:** No for a private beta; recommended before a broad public binary

### RR-14 - Employee and conversation modals lack complete dialog semantics

- **Severity:** Minor
- **Affected files:** `Office_Aquarium.html:978-979`,
  `src/bootstrap/events-and-bindings.js:11-17,37-40`
- **Affected system:** Accessibility
- **Evidence:** The Handbook modal has `role="dialog"`, `aria-modal`, a labelled heading,
  and focus handling. Employee and conversation modals do not expose the same semantics
  or a focus trap.
- **Player impact:** Keyboard and assistive-technology users can lose context or move
  focus behind an open modal.
- **Recommended fix:** Reuse one accessible modal controller for all three dialogs.
- **Blocks release:** No

### RR-15 - Several mobile command targets are shorter than 44 pixels

- **Severity:** Minor
- **Affected file:** `Office_Aquarium.html`
- **Affected system:** Mobile ergonomics
- **Evidence:** Browser measurement found valuation ranges at 30 pixels high, project
  commands at 36 pixels, time controls at 38 pixels, and the settings control at
  38 x 40 pixels.
- **Player impact:** Controls are usable but less forgiving on small touch screens.
- **Recommended fix:** Increase touch hit areas without enlarging the visible type.
- **Blocks release:** No

### RR-16 - Old installer output remains beside the current installer

- **Severity:** Minor
- **Affected files:** generated `src-tauri/target/release/bundle/nsis/`,
  release process documentation
- **Affected system:** Release operations
- **Evidence:** The build folder contains both 0.38.0 and 0.40.0 NSIS installers. Tauri's
  build does not clean old versioned output automatically.
- **Player impact:** A publisher can upload the wrong installer.
- **Recommended fix:** Add a release-clean command and generate a manifest with the exact
  files and hashes to upload.
- **Blocks release:** No

### RR-17 - Large ordered global modules remain a maintenance risk

- **Severity:** Minor
- **Affected files:** `src/systems/executive-messages.js`,
  `src/systems/workforce-leadership.js`, `src/systems/social-organizational.js`,
  `src/core/state-startup.js`
- **Affected system:** Code architecture
- **Evidence:** The largest modules range from roughly 159 KB to 248 KB and depend on
  script order and shared globals. `src/facades/simulation-systems.js` is only a thin
  registry.
- **Player impact:** No observed runtime failure, but future fixes have a high regression
  surface.
- **Recommended fix:** After release blockers are resolved, split by lifecycle ownership
  and pass explicit context into system APIs while preserving the single offline build.
- **Blocks release:** No

### RR-18 - Release ownership and third-party notices are absent

- **Severity:** Minor
- **Affected files:** repository root and packaged README
- **Affected system:** Release metadata
- **Evidence:** No tracked `LICENSE`, `COPYING`, `NOTICE`, or credits file was found.
- **Player impact:** Players and distributors do not have a clear statement of usage
  rights or bundled dependency attribution.
- **Recommended fix:** Add the owner's chosen license/copyright statement and generated
  third-party notices before publishing.
- **Blocks release:** No, subject to the owner's distribution plan

### RR-19 - First launch does not directly offer the Handbook

- **Severity:** Minor
- **Affected file:** `Office_Aquarium.html:728-738`
- **Affected system:** Onboarding
- **Evidence:** The startup overlay has Continue and Start only. The Handbook is available
  later inside the gear menu.
- **Player impact:** A new player can enter a complex simulation without seeing the
  two-minute Quick Start.
- **Recommended fix:** Add a non-blocking "How to Play" action on first launch or
  automatically highlight the gear after entry.
- **Blocks release:** No

## Top 10 Release Blockers

1. **RR-01:** Surface guarded simulation errors clearly in normal play.
2. **RR-02:** Make the long-run test require its requested horizon.
3. **RR-03:** Prove at least one coherent first-year strategy across a seed matrix.
4. **RR-04:** Create safe save-size headroom for mature companies.
5. **RR-05:** Add last-known-good save backup and corrupt-save recovery.
6. **RR-06:** Run the real release suite in CI.
7. **RR-07:** Smoke-test the artifacts that players actually download.
8. **RR-08:** Make every primary mobile destination discoverable.
9. **RR-09:** Replace employee-profile implementation labels with player language.
10. **RR-10:** Simplify the Reports surface for routine CEO scanning.

## Top 10 Nice-To-Have Improvements

1. Give every modal the Handbook's keyboard and assistive-technology behavior.
2. Increase mobile hit areas while preserving the compact visual design.
3. Add a first-launch Handbook action.
4. Add a clean release command and upload manifest with hashes.
5. Enable a tested least-privilege desktop Content Security Policy.
6. Add release ownership and third-party notice documents.
7. Replace remaining duplicated sentinel/default values with shared constants.
8. Split the largest global modules along existing system ownership boundaries.
9. Add a subtle mobile-tab overflow cue even after the navigation is reworked.
10. Add optional reduced-motion and independent music/alert volume controls.

## Required Release Gate

Before calling the build 1.0-ready:

1. Fix RR-01 through RR-07.
2. Run the corrected strategy matrix across at least 25 seeds to Day 365 and 10 seeds to
   Day 1,000.
3. Demonstrate save/load success with the largest workforce the game can naturally reach,
   with meaningful storage headroom.
4. Complete one 30-60 minute desktop session and one mobile session from first launch
   through multiple CEO decisions, hiring, onboarding, project completion, save/load, and
   a loss/restart path.
5. Rebuild and launch-test the final web ZIP and Windows installer from a clean output
   directory.

## Final Recommendation

DO NOT RELEASE YET
