# Office Aquarium Public Beta 0.9

## What Office Aquarium Is

Office Aquarium is an offline, single-player organization simulation. You lead
as CEO while autonomous employees choose work, collaborate, communicate,
learn, form relationships, and escalate decisions that require executive
judgment.

The game is about shaping a company through strategy, staffing, policy, and
leadership rather than assigning every employee action.

## Public Beta Highlights

- Autonomous employees with role-specific skills, goals, beliefs, memories,
  relationships, emotional baselines, and outcome-based learning.
- Project portfolio planning, staffing allocation, blockers, backlogs,
  commercial paths, and archived project value.
- A staged hiring pipeline from headcount approval through recruiting and
  onboarding.
- Human-readable CEO email and memo decisions with evidence, competing
  department viewpoints, and delayed consequences.
- Customer, market, valuation, investor, board, workforce, culture, crisis,
  and failure systems.
- Company Story, History, Weekly Report, institutional lessons, and old-message
  archives.
- Local save protection with a last-known-good backup and recovery tools.
- Player-facing recovery when a simulation stage or autosave fails.
- Music and message alerts that can be enabled independently.

## Platforms

- Browser package for desktop and mobile browsers, including itch.io HTML play.
- Windows desktop installer built with Tauri.

The browser package must be extracted with its folder structure intact when it
is played outside itch.io.

## Save Compatibility

Public Beta 0.9 uses Save Version 41. Compatible older saves are migrated when
opened. The game keeps the current save and a protected last-known-good backup.
If a save cannot be read or migrated, the title screen offers recovery and
export options instead of treating it as a new company.

Browser and Windows saves are local to their respective application storage.
They are not synchronized automatically.

## Beta Limitations

- Long-run balance is still being refined. Different strategies can produce
  difficult first-year outcomes, including company failure or CEO removal.
- The simulation is intentionally indirect. You approve strategic actions, but
  employees and departments execute day-to-day work autonomously.
- Recruiting, project progress, and organizational learning unfold over
  simulated time and can be delayed by company conditions.
- Very old or unusually large saves may take longer to open while they are
  validated and compacted.
- Mobile browsers may suspend audio or simulation timers when the game is in
  the background.
- The Windows beta installer is not code-signed. Windows SmartScreen or an
  organizational application-control policy may warn or block it.
- Audio and icon provenance is recorded in `ASSET_ATTRIBUTION.md`. The
  copyright holder should confirm distribution permission before publishing.

## Privacy and Connectivity

Office Aquarium does not require an account, API key, or network connection.
Public Beta 0.9 contains no analytics or telemetry service and does not send
company or player data to a server. Saves remain on the device unless the
player explicitly exports one.

## Reporting Bugs

Include the following when reporting a problem:

- Public Beta version and platform.
- Simulated day and approximate company state.
- What you expected and what occurred.
- An exported diagnostic file when the recovery screen offers one.
- A save export only when you are comfortable sharing that simulated company.

Do not post personal information in bug reports.

## Known-Issue Policy

Public Beta releases may contain balance or presentation issues, but known data
loss, silent save failure, false validation passes, and repeatable simulation
freezes are treated as release blockers.
