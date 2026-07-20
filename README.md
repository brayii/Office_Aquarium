# Office Aquarium Public Beta 0.9

Office Aquarium is a standalone offline organization simulation. You lead as CEO
while employees choose their own work, communicate, learn, and escalate strategic
decisions. Open `Office_Aquarium.html` in a browser to play from the source tree,
or build the clean web and Windows release packages described below.

No account, network connection, API key, analytics service, or telemetry service is
required. Saves stay on the device unless the player exports one.

## Project Layout

- `Office_Aquarium.html` - main launch file and page markup/styles
- `src/core/` - shared constants, role definitions, startup state, save migration, employee creation, and shared helpers
- `src/services/` - reusable runtime services such as saving, sound, timers, and validation sessions
- `src/systems/` - simulation systems such as projects, customers, workforce, executive messages, learning, valuation, social organization, and the canonical daily pipeline
- `src/ui/` - rendering, the Simulation Handbook, debug views, validation tools, and timer startup
- `src/facades/` - OOP system facades used by newer code
- `src/bootstrap/` - browser event bindings and startup wiring
- `assets/audio/` - optional music and message-alert audio files
- `docs/` - product bible, master spec, architecture notes, player guide, and release evidence
- `tests/` - browser and simulation regression tests
- `dist/` - generated web and desktop frontend packages; safe to delete and rebuild
- `src-tauri/` - Tauri Windows desktop wrapper and generated release build output
- `misc/` - ignored local history; superseded specifications and old builds are preserved in `Office_Aquarium_Misc_Legacy_2026-07-17.zip`

## Quick Browser Check

After code changes, you can run a local browser smoke test from the project folder:

```powershell
powershell -ExecutionPolicy Bypass -File tests\run-browser-smoke-test.ps1
```

The check opens `Office_Aquarium.html` in a local Chrome or Edge browser, starts a new company, and confirms the main screen renders without browser errors.

## Test Suite

Run the full local validation suite:

```powershell
npm test
```

Run the same validation suite with a pass/fail-rate report:

```powershell
npm run test:report
```

The report runner executes each test group in order and prints:

- total test groups
- passed and failed groups
- pass rate
- runtime
- failed group names and the tail of their output

The suite checks:

- duplicate HTML IDs and duplicate named JavaScript functions
- shared constants and their room, calendar, hiring, project-lifecycle, and inbox consumers
- the exact authoritative daily-stage order and fail-fast rollover behavior
- Institutional, project, and workforce learning causality, review windows, independent evidence, and bounded influence
- valuation sensitivity, once-per-day updates, chronological chart ranges, and Investor Relations forecast deduplication
- browser launch/startup
- Simulation Handbook sections, search, navigation, cross-references, context opening, and responsive layout
- the manual failure-test page and its generated save scenarios
- day rollover through daily close
- save/load continuation
- deterministic replay from a saved day-50 state to day 100
- workforce, hiring pipeline, and onboarding behavior
- all 15 canonical roles reaching CEO approval, recruiting, onboarding, room assignment, and save/load
- staffing crisis, project allocation, and blocker reconciliation
- project health, backlog, blocker, archive, and timing behavior
- organizational friction, risk pillars, and loss/crisis paths
- customer/product exposure and hidden-state access boundaries
- employee personality boundaries, stress/morale-only reactions, and hidden social-state UI separation
- Stage 1 Social Personality AI familiarity records and pair-level encounter boundaries
- Stage 2 Social Personality AI shared-experience history, dedupe, tone, and intensity boundaries
- Stage 3 Social Personality AI relationship interpretation, hidden UI boundaries, and stress/morale-only output
- Stage 4 Social Personality AI opportunity-bound social preferences
- Stage 5 evidence-based multidimensional workplace reputation
- emotional homeostasis, personal baselines, anti-saturation, and visible positive/negative social reactions
- Social AI model v4 ownership, deterministic migration, read-path RNG safety, and Work/Social/Emotional/Institutional trace separation
- source-backed conflict, repair, bounded social memory, contextual recall, visible conversations, privacy, and overhearing
- source-backed 4-5 turn conversations, personality-specific wording, pair-level anti-repetition, smooth approach/resume movement, personal space, critical-work protection, and deterministic save/load
- evidence-backed culture, informal groups, team chemistry, bridges, and formal/informal leadership
- compact backward-compatible saves, transient-debug exclusion, and mature-workforce browser-storage budget checks
- isolated balance validation that cannot mutate the live company save
- executive memo context and weekly newspaper clarity
- absence of recorded simulation errors during the regression run

GitHub Actions runs the complete `npm test` suite, a clean extracted-web launch
smoke, and a locked Rust check on every push and pull request through
`.github/workflows/ci.yml`.

Two slower workflows are intentionally separate:

- `.github/workflows/long-run.yml` runs the deterministic first-year strategy
  matrix on a schedule or by manual request and uploads Markdown and JSON evidence.
- `.github/workflows/release.yml` requires a 20-seed-per-strategy Day-365 gate,
  reruns the complete suite, builds and launch-smokes the web package, builds and
  inspects the Windows package, and attempts a clean install/launch/uninstall smoke.

Useful release-hardening checks:

```powershell
npm run verify:release-metadata
npm run test:long-run-contract
npm run test:save-recovery
npm run test:runtime-recovery
npm run test:release-ui
npm run test:package-web
```

Run a local first-year matrix and write its reports to `dist\reports\`:

```powershell
powershell -ExecutionPolicy Bypass -File tools\run-long-run-matrix.ps1 -SeedCount 20 -HorizonDays 365 -WriteReports
```

Useful targeted checks:

```powershell
npm run test:staffing-crisis
npm run test:project
npm run test:workforce
npm run test:handbook
npm run test:constants
npm run test:daily-pipeline
npm run test:learning-causality
npm run test:market-valuation
npm run test:all-role-hiring
npm run test:failure-page
npm run test:loss-paths
npm run test:risk
npm run test:crisis
npm run test:recovery
npm run test:validation-isolation
npm run test:long-run
npm run test:regression
npm run test:personality
npm run test:ai-ownership
npm run test:social-ai
npm run test:social-boundary
npm run test:social-experiences
npm run test:social-relationships
npm run test:social-preferences
npm run test:social-reputation
npm run test:social-emotion
npm run test:social-conflict
npm run test:conversation-presence
npm run test:social-organization
npm run test:emotional-homeostasis
npm run test:social-emotional-long-run
npm run test:social-organization-long-run
```

On Windows systems that block the PowerShell `npm.ps1` shim, use `npm.cmd` in the same commands.

The employee work AI and social/personality AI boundary is documented in `docs/architecture/employee_ai_boundaries.md`. Future changes that touch personality, relationships, morale, stress, or employee drama should preserve that boundary unless the design is explicitly revised.

Stage 1 social familiarity behavior is documented in `docs/specs/social_ai_stage_1_familiarity.md`.
Stage 2 shared-experience behavior is documented in `docs/specs/social_ai_stage_2_shared_experiences.md`.
Stage 3 relationship-interpretation behavior is documented in `docs/specs/social_ai_stage_3_relationship_interpretation.md`.
Stage 4 opportunity-bound social preferences are documented in `docs/specs/social_ai_stage_4_social_preferences.md`.
Stage 5 evidence-based workplace reputation is documented in `docs/specs/social_ai_stage_5_workplace_reputation.md`.
Stage 6 conflict and repair are documented in `docs/specs/social_ai_stage_6_conflict_repair.md`.
Stage 7 bounded social memory and contextual recall are documented in `docs/specs/social_ai_stage_7_memory_recall.md`.
Stage 8 visible conversations and overhearing are documented in `docs/specs/social_ai_stage_8_visible_conversations.md`.
Culture, groups, team chemistry, bridges, and leadership are documented in `docs/specs/social_systems_feature_complete.md`.
Emotional baselines and homeostasis are documented in `docs/specs/emotional_homeostasis.md`.

Balance projection tools are developer validation tools, not CEO gameplay controls. In normal play they are hidden. To expose the Developer Tools validation panel in a local browser session, open the game with `?dev=1` or set `officeAquariumDeveloperMode` to `true` in browser storage. These tools run isolated companies in memory and must not reset, save, or mutate the active company.

### Manual Failure Test Page

The developer failure-test page is:

```text
tests\Office_Aquarium_Failure_Test.html
```

Open it in the same browser you use for the game when you want to create targeted test saves for:

- CEO removal by the board
- company failure
- day rollover at 7:55 PM
- project archive integrity
- near-complete project closeout
- hiring pipeline continuity
- CEO Inbox three-choice routing
- commercial revenue from completed projects

Use `Back Up Current Save` before creating a test save. After creating a scenario, open `Office_Aquarium.html`, choose `Continue Company`, and let the simulation run. The page also has `Run Local Checks` for quick save-shape checks.

Developers should also run the automated page check:

```powershell
npm run test:failure-page
```

That check confirms the failure-test page writes current-version saves and that every scenario button creates the expected save shape.

## Packaging

When moving the game to another PC or mobile device, keep the folder structure intact. The HTML file expects the JavaScript and audio files to remain in their current relative paths.

Generated packages can be cleaned safely by deleting:

```text
dist\
src-tauri\gen\
src-tauri\target\
```

`misc\Office_Aquarium_Misc_Legacy_2026-07-17.zip` is historical reference only. It is not a runtime or packaging dependency.

### Package for Itch.io Web

Run this from the project folder:

```powershell
powershell -ExecutionPolicy Bypass -File tools\package-itch-web.ps1
```

The script creates:

```text
dist\Office_Aquarium_Public_Beta_0.9_itch_web.zip
dist\Office_Aquarium_Public_Beta_0.9_itch_web.zip.sha256
```

Upload that ZIP to itch.io as an HTML game. The package renames `Office_Aquarium.html` to `index.html` inside the ZIP, which is what itch.io expects for browser-playable games.

The staged web package is also available at:

```text
dist\itch-web\
```

Build and launch-smoke the exact extracted ZIP:

```powershell
npm run test:package-web
```

The package contains only runtime source, audio assets, the player guide, release
notes, license, third-party notices, and SHA-256 manifests. Tests, private plans,
work logs, repository metadata, and developer archives are excluded.

### Desktop Binary

Office Aquarium includes a Tauri desktop wrapper for Windows builds.

Install the JavaScript and Tauri tooling once:

```powershell
npm install
```

Prepare the desktop frontend files:

```powershell
npm run package:desktop-assets
```

Run the desktop app in development mode:

```powershell
npm run tauri:dev
```

Build a raw Windows executable and NSIS installer:

```powershell
npm run test:package-windows
```

Clean, versioned release artifacts are copied to:

```text
dist\windows\Office_Aquarium_0.9.0_windows_x64.exe
dist\windows\Office Aquarium_0.9.0_x64-setup.exe
dist\windows\release-manifest.json
dist\windows\SHA256SUMS.txt
```

The Tauri build output remains available at:

```text
src-tauri\target\release\office-aquarium.exe
src-tauri\target\release\bundle\nsis\Office Aquarium_0.9.0_x64-setup.exe
```

If the build fails while downloading NSIS, rerun it with network access available.
The release packager deletes stale NSIS bundles before building, verifies the
version, and rejects old installer names.

On a Windows environment that permits newly built unsigned applications, run the
clean installation smoke:

```powershell
npm run test:windows-launch
```

That check silently installs to a temporary folder, launches the installed
application for eight seconds, closes it, and runs the uninstaller. A managed
environment may block an unsigned beta binary with `Access is denied`; that is a
failed launch certification, not a reason to mark the check as passed.

The desktop wrapper uses the same offline game files as the browser version. `Office_Aquarium.html` remains the main source file.

## Current Release Outputs

After a successful clean build, the main release files are:

```text
dist\Office_Aquarium_Public_Beta_0.9_itch_web.zip
dist\Office_Aquarium_Public_Beta_0.9_itch_web.zip.sha256
dist\desktop\
dist\windows\Office_Aquarium_0.9.0_windows_x64.exe
dist\windows\Office Aquarium_0.9.0_x64-setup.exe
dist\windows\SHA256SUMS.txt
```

Use the ZIP for itch.io web upload. Use the NSIS setup EXE for a Windows desktop release.

## Simulation Notes

- The CEO leads through decisions, policy, staffing approval, and strategic memos; employees remain autonomous.
- Project staffing distinguishes department headcount from actual project allocation.
- A single short-staffed project is treated as a portfolio/workforce warning, not automatically a company crisis.
- Company staffing crisis requires broader sustained evidence such as multiple affected projects, major missing assignments, failed recruiting, or wider delivery impact.
- Normal play shows reported blocker awareness; exact hidden blocker truth is reserved for AI Debug.
