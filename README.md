# Office Aquarium

Office Aquarium is a standalone offline organization simulation. Open `Office_Aquarium.html` in a browser to play.

## Project Layout

- `Office_Aquarium.html` - main launch file and page markup/styles
- `src/core/` - startup state, save migration, employee creation, shared helpers
- `src/services/` - reusable runtime services such as saving, sound, timers, and validation sessions
- `src/systems/` - simulation systems such as projects, customers, workforce, executive messages, learning, and valuation
- `src/ui/` - rendering, debug views, validation tools, and timer startup
- `src/facades/` - OOP system facades used by newer code
- `src/bootstrap/` - browser event bindings and startup wiring
- `assets/audio/` - optional music and message-alert audio files
- `docs/` - product bible, master spec, and player manual
- `tests/` - standalone test pages
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

The suite checks:

- duplicate HTML IDs and duplicate named JavaScript functions
- browser launch/startup
- day rollover through daily close
- save/load continuation
- absence of recorded simulation errors during the regression run

GitHub Actions also runs these checks on push and pull request through `.github/workflows/ci.yml`.

## Packaging

When moving the game to another PC or mobile device, keep the folder structure intact. The HTML file expects the JavaScript and audio files to remain in their current relative paths.

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

The desktop wrapper uses the same offline game files as the browser version. `Office_Aquarium.html` remains the main source file.
