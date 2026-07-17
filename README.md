# Office Aquarium

Office Aquarium is a standalone offline organization simulation. Open `Office_Aquarium.html` in a browser to play, or build the packaged web and Windows desktop releases from this folder.

## Project Layout

- `Office_Aquarium.html` - main launch file and page markup/styles
- `src/core/` - startup state, save migration, employee creation, shared helpers
- `src/services/` - reusable runtime services such as saving, sound, timers, and validation sessions
- `src/systems/` - simulation systems such as projects, customers, workforce, executive messages, learning, and valuation
- `src/ui/` - rendering, debug views, validation tools, and timer startup
- `src/facades/` - OOP system facades used by newer code
- `src/bootstrap/` - browser event bindings and startup wiring
- `assets/audio/` - optional music and message-alert audio files
- `docs/` - product bible, master spec, architecture notes, and player manual
- `tests/` - browser and simulation regression tests
- `dist/` - generated web and desktop frontend packages; safe to delete and rebuild
- `src-tauri/` - Tauri Windows desktop wrapper and generated release build output
- `misc/` - user-managed folder; do not reorganize without explicit approval

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
- browser launch/startup
- the manual failure-test page and its generated save scenarios
- day rollover through daily close
- save/load continuation
- deterministic replay from a saved day-50 state to day 100
- workforce, hiring pipeline, and onboarding behavior
- staffing crisis, project allocation, and blocker reconciliation
- project health, backlog, blocker, archive, and timing behavior
- organizational friction, risk pillars, and loss/crisis paths
- customer/product exposure and hidden-state access boundaries
- employee personality boundaries, stress/morale-only reactions, and hidden social-state UI separation
- Stage 1 Social Personality AI familiarity records and pair-level encounter boundaries
- Stage 2 Social Personality AI shared-experience history, dedupe, tone, and intensity boundaries
- Stage 3 Social Personality AI relationship interpretation, hidden UI boundaries, and stress/morale-only output
- isolated balance validation that cannot mutate the live company save
- executive memo context and weekly newspaper clarity
- absence of recorded simulation errors during the regression run

GitHub Actions also runs these checks on push and pull request through `.github/workflows/ci.yml`.

Useful targeted checks:

```powershell
npm run test:staffing-crisis
npm run test:project
npm run test:workforce
npm run test:failure-page
npm run test:loss-paths
npm run test:risk
npm run test:crisis
npm run test:recovery
npm run test:validation-isolation
npm run test:long-run
npm run test:regression
npm run test:personality
npm run test:social-ai
npm run test:social-boundary
npm run test:social-experiences
npm run test:social-relationships
npm run test:social-emotional-long-run
```

The employee work AI and social/personality AI boundary is documented in `docs/architecture/employee_ai_boundaries.md`. Future changes that touch personality, relationships, morale, stress, or employee drama should preserve that boundary unless the design is explicitly revised.

Stage 1 social familiarity behavior is documented in `docs/specs/social_ai_stage_1_familiarity.md`.
Stage 2 shared-experience behavior is documented in `docs/specs/social_ai_stage_2_shared_experiences.md`.
Stage 3 relationship-interpretation behavior is documented in `docs/specs/social_ai_stage_3_relationship_interpretation.md`.

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

Do not delete `misc\` unless you explicitly intend to remove your own local files.

### Package for Itch.io Web

Run this from the project folder:

```powershell
powershell -ExecutionPolicy Bypass -File tools\package-itch-web.ps1
```

The script creates:

```text
dist\Office_Aquarium_itch_web.zip
```

Upload that ZIP to itch.io as an HTML game. The package renames `Office_Aquarium.html` to `index.html` inside the ZIP, which is what itch.io expects for browser-playable games.

The staged web package is also available at:

```text
dist\itch-web\
```

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

Build a Windows installer:

```powershell
npm run tauri:build
```

The build creates a raw desktop executable at:

```text
src-tauri\target\release\office-aquarium.exe
```

It also creates a Windows installer at:

```text
src-tauri\target\release\bundle\nsis\Office Aquarium_0.38.0_x64-setup.exe
```

If the build fails while downloading NSIS, rerun the build with network access available. The app executable may still compile successfully even if installer bundling fails.

The desktop wrapper uses the same offline game files as the browser version. `Office_Aquarium.html` remains the main source file.

## Current Release Outputs

After a successful clean build, the main release files are:

```text
dist\Office_Aquarium_itch_web.zip
dist\desktop\
src-tauri\target\release\office-aquarium.exe
src-tauri\target\release\bundle\nsis\Office Aquarium_0.38.0_x64-setup.exe
```

Use the ZIP for itch.io web upload. Use the NSIS setup EXE for a Windows desktop release.

## Simulation Notes

- The CEO leads through decisions, policy, staffing approval, and strategic memos; employees remain autonomous.
- Project staffing distinguishes department headcount from actual project allocation.
- A single short-staffed project is treated as a portfolio/workforce warning, not automatically a company crisis.
- Company staffing crisis requires broader sustained evidence such as multiple affected projects, major missing assignments, failed recruiting, or wider delivery impact.
- Normal play shows reported blocker awareness; exact hidden blocker truth is reserved for AI Debug.
