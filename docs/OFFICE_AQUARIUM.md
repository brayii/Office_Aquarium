# OFFICE AQUARIUM --- FINAL PRODUCT BIBLE (FOR CODEX)

> **Audience:** Autonomous coding agents (Codex)
>
> **Purpose:** This document defines the *final intended product*, not
> merely the current implementation. When implementation and this
> document differ, treat this document as the long-term design target
> unless a newer revision explicitly supersedes it.

------------------------------------------------------------------------

# Mission

Office Aquarium is a **living technology company simulator**.

The player is **always the CEO**.

The player leads the company but **never directly controls employees**.

Employees are autonomous people with personalities, memories, goals,
relationships, careers, and evolving behavior.

The company should feel alive whether the player is actively making
decisions or simply watching the office work.

------------------------------------------------------------------------

# Product Philosophy

This is **NOT**:

-   a spreadsheet tycoon
-   a factory game
-   a city builder
-   The Sims with direct control
-   an online-model-driven simulation

This **IS**:

-   a living organization simulator
-   a CEO simulation
-   an emergent story generator
-   a hardware and software company simulation

The simulation itself is the source of truth.

AI enriches the simulation but does not replace it.

------------------------------------------------------------------------

# Player Role

The player is always the CEO.

The player may:

-   approve strategy
-   approve launches
-   respond to executive communications
-   manage company direction
-   respond to crises
-   influence culture
-   allocate high-level priorities

The player never:

-   moves employees
-   assigns desks
-   orders individuals to work
-   chooses individual employee actions
-   edits employee emotions directly

------------------------------------------------------------------------

# Employee Design

Employees are autonomous agents.

Every employee has:

-   personality
-   role
-   skills
-   goals
-   memories
-   relationships
-   opinion of the CEO
-   career history
-   energy
-   morale
-   stress
-   focus
-   achievements

Employees must:

-   think independently
-   choose actions independently
-   collaborate
-   disagree
-   complain
-   mentor
-   learn
-   improve
-   make mistakes
-   become sick
-   recover
-   burn out
-   resign
-   be fired
-   be promoted
-   be hired
-   return from leave
-   influence company success

Employees are never puppets.

------------------------------------------------------------------------

# AI Architecture

## Layer 1 --- Rule-Based Simulation

Owns:

-   finance
-   projects
-   product lifecycle
-   manufacturing
-   customers
-   board
-   Investor Confidence
-   crises
-   revenue
-   valuation

Must work completely offline.

## Layer 2 --- Utility AI

Owns:

-   action selection
-   priorities
-   daily routines
-   collaboration
-   meetings
-   breaks
-   work selection

Must remain explainable.

## Layer 3 --- Adaptive Learning

Employees adapt from experience.

Examples:

-   avoid burnout
-   become mentors
-   become risk taking
-   become cautious
-   strengthen habits
-   evolve professionally

Learning is lightweight and persistent.

## Layer 4 --- Offline Communication Text

The current build is fully offline and does not use an online service.

All language is generated from rule-based templates and actual simulation state.

Examples:

-   CEO communications
-   weekly newspaper
-   board letters
-   employee thoughts
-   resignation letters
-   promotion announcements
-   earnings summaries
-   customer summaries

Any future language layer must remain optional and must not control simulation rules.

## Layer 5 --- Real World Intelligence

Optional.

When online:

-   download industry data
-   update market conditions
-   update customer demand
-   update supply chain
-   update AI industry trends
-   update competitor activity

When offline:

continue using the last known snapshot.

The simulation must never require internet access.

------------------------------------------------------------------------

# Company Brain

Maintain a structured historical memory.

Every significant event becomes permanent history.

Used by:

-   employees
-   newspaper
-   CEO communications
-   board
-   future decisions
-   statistics
-   long-term storytelling

------------------------------------------------------------------------

# CEO Communications

Executive communications are the primary interaction surface.

Each communication is based on real simulation events.

Every communication contains:

-   summary
-   recommendation
-   expected impact
-   decision choices
-   archived outcome

Communications survive save/load.

------------------------------------------------------------------------

# Newspaper

Publish every simulated week.

Generated from real events.

Never invent company history.

Purpose:

-   summarize performance
-   reinforce company identity
-   create long-term history
-   celebrate employees
-   explain trends

------------------------------------------------------------------------

# Internet Integration

Internet data modifies the world, not the simulation rules.

Examples:

-   semiconductor demand
-   AI demand
-   tariffs
-   interest rates
-   supply shortages
-   competitor launches

These become bounded market modifiers.

------------------------------------------------------------------------

# Non-Negotiable Simulation Rules

The following must always remain true.

1.  Player is always CEO.
2.  Employees remain autonomous.
3.  Employees may quit.
4.  Employees may be fired.
5.  Employees may be hired.
6.  Employees may be promoted.
7.  Employees may become sick.
8.  Employees may recover.
9.  Employees may burn out.
10. Employees form relationships.
11. Employees remember events.
12. Employees adapt over time.
13. Company can succeed.
14. Company can fail.
15. Board can remove the CEO.
16. Save compatibility must be preserved.
17. Offline play must always work.
18. Online mode enhances realism only.
19. The simulation remains explainable.
20. Rule-based simulation remains the authority.

------------------------------------------------------------------------

# Coding Rules

When implementing features:

-   preserve existing gameplay
-   patch instead of rewrite
-   maintain save migration
-   keep deterministic business logic
-   keep AI explainable
-   validate syntax
-   avoid duplicate timers
-   maintain mobile support
-   avoid external dependencies unless approved

------------------------------------------------------------------------

# Success Criteria

The finished product should make players say:

"I wasn't controlling employees.

I was leading a living company."


------------------------------------------------------------------------

# Current implementation note

`Office_Aquarium.html` is now on save version 38. It includes employee CEO opinions, career history, explicit employee skills, structured company history, culture and market modifiers, AI Debug mode, market-pressure events, broader performance-review decisions, manufacturing, Investor Confidence, team cohesion, customer sentiment, need-aware collaboration, supply-chain decisions, completion-based employee learning, and quality mistakes produced by actual simulation outcomes, per-event scheduler cooldowns, cash runway rearming, sustained performance-review risk, weighted event selection, and proactive opportunity events, generated work items, richer team operational state, employee beliefs, daily briefings, department objectives, information sources, and structured issue records, work-aware utility scoring, short employee intentions, belief-informed action choices, and employee-generated internal communications including help requests, status reports, risk reports, opportunity proposals, rumors, and suppressed reports, and a report-escalation engine that routes internal messages into executive info memos or CEO decision memos, and contextual employee learning for actions, reporting, suppression, help seeking, testing, initiative, and recovery, plus long-run simulation telemetry, seeded balance projection runs, multi-seed balance aggregation, player-facing department briefings, an internal Executive Intelligence Snapshot that improves memos, stories, project reviews, board pressure, newspapers, and learning without showing a separate Company Intelligence panel, evidence-based CEO memos, richer generated content libraries, causal story threads, visible playtest checks, Phase 8 balance projection tuning with simulated CEO decisions, Phase 9 presentation dashboards and internal report views, Phase 10 richer employee thoughts, rumors, and newspaper continuity, and Phase 11 release readiness checks, Company History legacy timeline, Institutional Learning, connected work-item progression, workflow stages, owner assignment, blocker generation/resolution, clearer help/request reporting, a Strategic CEO Inbox with context-sensitive choices, department recommendations, confidence, uncertainty, risks, benefits, variable outcomes, and delayed consequences, Leadership and Organizational Dynamics with leadership footprint, organizational momentum, quarterly reviews, retention risk, retirement, annual reviews, and sustained crisis trajectories, Workforce, Economy, Board Pressure, Layoffs, and Real Failure, and the Project Portfolio system with seeded hidden project reality, project proposals, project work, project staffing demand, portfolio health, CEO-requested project memos, constrained CEO initiative proposals, project review/pause/cancel controls, project merge/split/reduce/expand/validate decisions, delayed cancellation consequences, and board portfolio reviews. Version 34 added the completed deep rollover and stuck-project fix: guarded simulation ticks, guarded daily close, error capture, timer batch break-on-error, closeout-ready project completion, explicit project FTE allocation, canonical staffing coverage, functional collaboration and meeting outcomes, load-time determinism, render batching, decision-thread consequence isolation, project causal ledgers, and finance output that improves efficiency rather than directly minting cash. Version 35 adds dynamic market sentiment, imperfect external perception, valuation quality, valuation history and shocks, company identity labels, board profiles, board valuation interpretation, fundraising terms with dilution and control pressure, valuation-aware recruiting and customer survivability signals, project market visibility, board market learning, and AI Debug diagnostics for hidden market state. Version 36 adds Investor Relations, hidden investor sentiment, Investor Confidence as a distinct operating metric, non-compounding valuation shocks, day-based valuation history lookups, Board interpretation of investor concerns, workload realism, project capacity pressure, and AI Debug visibility for investor and valuation integrity. Version 37 refines executive messages, action-first CEO choices, finance-style valuation ranges, and player-facing email/memo readability. Version 38 adds causal learning integrity, message integrity, customer and market intelligence, stronger attribution for learning, explicit communication links, and deterministic continuation validation. The game remains offline and does not use an online service.

The runtime has now been split for maintainability: `Office_Aquarium.html` remains the main launch file and contains the page markup/styles, while the ordered JavaScript source tree under `src/` contains services, core startup, simulation systems, UI rendering, facades, and browser bindings. Audio assets live under `assets/audio`. Keep the folder structure together for offline play.

End of Product Bible.


















## Version 23 completion pass

Version 23 addresses the remaining four major phases without adding an online dependency:

* Content variety: broader generated work titles, blockers, report subjects, opportunity subjects, and risk categories.
* Causal continuity: story chains now connect work items, blockers, issue detection, employee reports, CEO memos, and CEO choices.
* PC/mobile playtesting support: story threads, department briefings, modal sizing, an AI Debug-only executive intelligence snapshot, and AI Debug playtest checklist make long runs easier to inspect.
* Code consolidation path: `src/README.md`, `src/release-manifest.json`, and `build/README.md` define the future module split while keeping `Office_Aquarium.html` as the playable standalone release.


## Version 24 Phase 8 balance tuning

Version 24 begins the final polish sequence with Balance & Tuning. The Balance Projection Runner now includes simulated CEO decision-making instead of suppressing CEO events during validation. Projection runs can therefore measure memo frequency, escalation pressure, cash recovery, stress, quality mistakes, employee turnover, and long-run survival as a connected system. The Balance Matrix summary now reports minimum cash, maximum final stress, and early-ended runs in addition to averages.


## Version 25 final polish phases

Version 25 implements a full pass across the remaining final polish phases:

* Phase 8 Balance & Tuning: adds player-visible balance notes driven by telemetry and matrix results.
* Phase 9 Presentation & UI: adds operational dashboard cards, small trend charts, internal report views, and clearer employee work/belief/message visibility.
* Phase 10 Content & Emergent Storytelling: expands employee thoughts, rumors, newspaper story leads, and weekly story-chain reporting.
* Phase 11 Playtesting, Polish & Release: adds release readiness checks covering PC layout, mobile layout, save/load version, offline play, long-run validation, and story continuity. These checks were later moved out of the normal Company screen and are now shown only in AI Debug under Release Validation.


## Version 26 company history

Version 26 adds a player-facing Company History panel. It summarizes major milestones from company history and story chains into a selective long-term biography, so long-running companies can look back on their legacy without exposing every low-level event. It also retains more history entries and adds major milestones for cash reserves, positive launched revenue, and 100 customers.


## Version 27 institutional learning

Version 27 adds Institutional Learning. The company now forms lessons from major events and repeated patterns, including CEO decisions, pilot and launch choices, coaching, firing, burnout resignations, quality mistakes, successful collaboration, and long-term historical patterns. Lessons influence departments, veterans, new hires, and Utility AI through bounded behavior bias. The current UI exposes only meaningful strong lessons in the Company Lessons section, while deeper validation lives in AI Debug.


## Version 28 work item lifecycle fix

Version 28 connects generated work items more directly to employee activity and player-facing reports. Open work now receives real owners, employees advance the same active work shown in briefings, blockers can be generated and resolved through work, and visible status uses workflow stages such as Investigation, Requirements, Implementation, Testing, Blocked, Ready for review, and Complete. Help requests now require a real reason and no longer present "Help needed" messaging for work with no blocker; non-blocker collaboration requests are shown as peer-review requests.


## Version 29 Strategic CEO Inbox

Version 29 upgrades CEO memos into context-sensitive strategic decisions. Each memo draws three plausible choices from a broader pool, shows potential benefits, risks, uncertainty, and estimated confidence, and allows departments to recommend different paths based on their priorities. Decision outcomes now vary with company conditions such as cash, quality, integration, stress, morale, manufacturing readiness, customer sentiment, competitor pressure, and market demand. CEO choices can also create delayed consequences that later appear in Company Story, the weekly newspaper, Company History, Institutional Learning, and archived communications.


## Version 30 Leadership and Organizational Dynamics

Version 30 adds persistent leadership values, organizational momentum, quarterly and annual reviews, employee retention risk, job-search behavior, retirement readiness, and sustained crisis trajectories. CEO decisions now leave a leadership footprint that shapes trust, culture, retention, and future outcomes over time. Operating Health includes an Organizational Dynamics section showing quarterly review timing, retention cases, crisis trajectory, leadership profile, and momentum.


## Version 31 workforce, economy, board pressure, layoffs, and real failure

Version 31 adds a living workforce economy. Employees now carry hidden employment costs, company finance tracks payroll, facilities, lab/software, manufacturing, support, contractor cost, total daily cost, net cash flow, runway, and unpaid payroll. Staffing ranges now identify understaffed and overstaffed departments, creating pressure, hiring recommendations, restructuring recommendations, and workforce/financial UI. Hiring, layoffs, severance, board strikes, CEO PIP, company risk, and immediate company-failure or CEO-fired outcomes are connected through the CEO Inbox without giving the player direct micromanagement control.


## Version 31.1 economy and executive pressure tuning

Version 31.1 is a balance pass that keeps save version 31. It reduces post-launch revenue compounding, strengthens scalable support, manufacturing, quality-burden, and growth-overhead costs, lowers pre-revenue fixed burn to keep early runway playable, expands economic telemetry, adds cash percentile and post-launch net-flow reporting to balance matrices, and throttles CEO Inbox cadence so queued recommendations respect the executive cooldown.

The pass also adds quality-rework diagnostics. Balance reports now separate mistakes created, mistakes resolved, defects reopened, verification failures, rushed-work mistakes, stress-related mistakes, low-focus mistakes, weak-culture mistakes, manufacturing defects, rework actions, and unresolved quality mistakes. Quality mistake creation was reduced from ordinary work, old rework now decays faster during daily processing, and the quality alert threshold now reflects team-level runaway rework rather than normal unresolved cleanup.

## Version 31.2 autonomous workforce management tuning

Version 31.2 keeps save version 31 and extends workforce autonomy. Employees now track burnout response, help-seeking history, manager history, performance management state, and termination history through safe migration defaults. Stressed employees attempt recovery, ask for help, and receive manager-led workload redistribution before severe burnout. Routine help requests are handled locally instead of being sent to the CEO Inbox.

Departments now accumulate hiring need evidence over time using staffing gaps, backlog, blocked work, stress, quality burden, customer and manufacturing demand, retirement/succession risk, skill coverage, and finance constraints. High-confidence strategic hiring requests still reach the CEO, but approval starts a recruiting pipeline rather than instantly creating an employee. Recruiting has search delay, offer acceptance risk, onboarding, and hiring history.

Workforce management now also has an explicit `company.workforceLessons` layer. Coaching, PIP recovery or failure, help-seeking, burnout recovery, recruiting, layoffs, termination timing, retention effects, succession planning, and workload balancing all leave durable workforce-specific learning in addition to the general Institutional Learning cards.

Crisis deadlines now preserve the two final loss types from the workforce/economy/failure spec. Leadership and burnout governance crises can remove the CEO, while financial, product, reputation, staffing, and operational collapse can end the company. Both outcomes use the normal game-over and Company History path.

The Workforce and Project Portfolio UI now separates project-required staff from the hiring pipeline. Project cards show required staff and missing roles, while Workforce and Financial Pressure shows staffing needs, CEO approval items, hiring recommendations, recruiting, onboarding, and vacancy/backfill state as distinct concepts.

Hiring now follows the CEO boundary rule: the CEO approves the position, not the individual candidate. After approval, HR and the department run the candidate search, interviews, offer, hiring, and onboarding without a second routine CEO approval. The CEO Inbox only receives hiring exception memos for unusual cases such as a failed long search, salary-band exception for an unusually strong candidate, or a hiring-freeze review during runway pressure.

Hiring policy is now CEO-reviewable at any time from Workforce and Financial Pressure. The button creates a formal CEO Inbox memo rather than flipping a direct toggle. The persistent policy can be normal, critical roles only, or frozen. A freeze does not delete staffing needs; it records suppressed requests, keeps the workload pressure alive, pauses non-critical recruiting, and schedules a later policy review. Critical vacancies, succession, compliance, safety, or severe bottleneck roles can still escalate as exceptions.

Recruiting is now a living HR process instead of a fixed timer. After the CEO approves a position, HR opens a requisition, searches for candidates, runs interviews, makes offers, handles ordinary declines, and hires without routine CEO involvement. Expected fill time is adjusted by role difficulty, candidate market, competition, salary competitiveness, company reputation, hiring policy, runway, and workforce lessons. CEO exception memos are reserved for unusual cases such as failed searches or salary-band exceptions. New hires enter onboarding with a productivity ramp, mentor assignment, onboarding quality, and a variable onboarding duration.

The v32 Institutional Learning audit has been applied. Project learning now uses a typed project lesson store instead of losing project-specific keys through the general institutional vector. Estimate accuracy, scope control, pilot value, cancellation timing, sunk-cost discipline, market timing, staffing timing, coordination, customer validation, supplier risk, project size, early QA, and knowledge value now have storage, evidence, and project consumers. Institutional lessons now keep success/failure counts, sample count, effect estimate, variance, confidence, contradiction handling, and staleness decay. Quality, People, and every active department receive explicit department learning. Employee lesson acceptance now has a stable personality component plus a dynamic CEO-trust component. Learning evidence is now structured and feeds lessons, history, UI coverage, workforce learning, and project learning rather than depending on narrative keyword scans.

Performance management is now primarily operational. Managers can start informal coaching, formal coaching, and PIPs from sustained documented performance risk. Failed PIPs can lead to operational termination with an informational HR notice, while layoffs remain separate CEO-approved strategic actions with severance and survivor effects.

## Version 32 project portfolio system

Version 32 adds the Project Portfolio system and bumps the save version to 32. Old saves receive a legacy flagship project representing existing chip, software, integration, and quality progress.

Projects now have families, origins, visible business cases, seeded hidden reality, performance metrics, budget and spend, staffing demand, work-item links, review history, and portfolio status. Employees, departments, customers, market pressure, the board, and constrained CEO initiative requests can generate proposals. CEO proposal and review memos still use the existing three-choice Inbox format. Active projects generate work items, drive staffing demand, affect operating costs, and appear in Operating Health through the Project Portfolio panel.

The CEO can inspect the portfolio at any time and request a formal memo for active or proposed projects. Portfolio buttons do not apply actions instantly; they route review, pause, cancel, and proposal decisions through the CEO Inbox so every action is archived, explained, and processed with strategic uncertainty. Project review choices can now continue, pause, cancel, reduce scope, expand funding, split into phases, merge compatible work, or require customer validation when those options are plausible.

Project cancellation is treated as a major strategic event. It stops future project spending, closes related project work items, affects employees who cared about the project, records Company History and Weekly Newspaper context, reinforces project Institutional Learning, and can create delayed board, morale, or market consequences. The board can also request portfolio-level reviews for concentration risk, weak pipeline, excess burn, and repeated project risk.

The Operating Health panel now derives executive metrics from authoritative simulation state instead of showing independent optimistic bars. Hardware, software, manufacturing, customer, shareholder, morale, trust, team cohesion, finance, and portfolio health are read-only summaries built from projects, employees, departments, customers, finance, manufacturing, board, and market signals. Project cards show Overall Health based on progress, quality, schedule, staffing, risk, and confidence. Portfolio summaries use project weights so strategic active work matters more than paused, completed, or low-priority work. Lifecycle labels distinguish development/readiness/validation before launch from product/manufacturing/customer health after launch, and missing systems show `N/A` rather than false certainty.

## Version 32 learning optimization and sound controls

Version 32 included a learning and determinism optimization pass. Simulation-affecting randomness routes through the seeded `simulationRandom()` service, with only the native fallback inside that service intentionally using `Math.random()`. The company save state includes `randomState` and `nextRuntimeId`, and simulation communication and decision IDs use deterministic runtime IDs rather than wall-clock IDs. The obsolete legacy lesson-acceptance helper has been removed, and employee Utility AI reads already-normalized employee learning state without full-company institutional normalization in the hot path.

The institutional learning audit now includes behavioral validation checks confirming that help-seeking lessons raise collaboration utility, recovery lessons raise break/recovery utility, and testing lessons raise lab/testing utility.

The player-facing sound control is now a dropdown with `Muted`, `Alerts Only`, `Music Only`, and `Music + Alerts`. Background music uses `game_music_loop.mp3`, CEO message notifications use `new_message_alert.mp3`, and sound failure is fail-soft: missing, blocked, or unsupported audio never stops the simulation.

## Version 32 CEO Inbox information design

The CEO Inbox now preserves the email and memo experience while making every decision memo more useful and less omniscient. Memos include why the issue reached the CEO, chain-of-command context, concrete evidence reviewed, the sender's interpretation, a recommendation, other department viewpoints, a no-action forecast, and uncertainty. Employee-originated reports normally route through managers or operating councils before reaching the CEO; direct employee-to-CEO escalation is reserved for rare protected or severe cases.

Advice is intentionally imperfect. Departments interpret evidence through their own priorities, sender credibility is tracked privately, and hidden project reality is not revealed. Archived memos retain original evidence, recommendation, uncertainty, CEO choice, later outcome, forecast accuracy, and memo audit data so players can compare what the organization believed with what later happened.

The Inbox refinement now hides memo audit text unless AI Debug is enabled. Department recommendations are scored against the available choices instead of defaulting to the first option, but normal player-facing memo text shows an executive recommendation rather than the internal score. Evidence is selected by relevance to the decision, no-action forecasts use current simulation values where possible, and alternative viewpoints cite concrete facts. The memo audit now uses explicit evidence signal IDs on choices and evidence items instead of relying only on shared wording. Managers can merge duplicate reports, add or challenge evidence, reframe a diagnosis, handle issues locally, delay escalation, or suppress a report while leaving a discoverable suppression record. Protected escalation covers severe, safety, legal, ethics, whistleblower, retaliation, repeated failed escalation, and high-transparency channels. Sender credibility now also changes from informational memos and suppressed reports that later resurface.

## Version 32 internal Executive Intelligence Snapshot

The visible Company Intelligence panel has been retired to reduce duplicated player-facing information. Operating Health now remains the place for current state, Project Portfolio shows the work, CEO Inbox presents decisions, Company Story explains causes, the Weekly Newspaper interprets the week, and Company History preserves legacy.

The useful intelligence logic remains as an internal Executive Intelligence Snapshot. It ranks top risks, opportunities, department beliefs, suppression findings, major trends, strategic signals, and source IDs from structured simulation state rather than newspaper prose or hidden truth.

The snapshot improves memo evidence, event priority, no-action forecasts, department recommendations, story-thread selection, newspaper headlines, board portfolio concerns, CEO PIP context, suppression accountability, and Institutional Learning. Serious suppression can still affect manager credibility, story/history, and lessons, but it is not shown as a permanent raw count.

The snapshot is visible only in AI Debug. Existing save fields such as `company.executiveBriefing` and `company.executiveBriefingArchive` remain load-compatible, but the normal UI no longer renders them and the obsolete archive is pruned instead of growing as a daily briefing log.

## Version 33 causal integrity and AI action outcomes

Version 33 implements the deep simulation audit correction pass. Project staffing now uses persistent FTE allocations per project instead of counting the same employee as fully available to every project. Staffing coverage has one canonical derived formula, portfolio open-role pressure is based on missing allocated FTE, and employee work selection favors assigned, allocated, or active collaboration work.

Collaboration and meetings now produce real bounded outcomes. Collaboration sessions store the partner, work item, purpose, and outcome, then can advance shared work, resolve blockers, improve quality/integration, strengthen relationships, and feed contextual and institutional learning. Meetings now have purposes such as blocker review, planning, risk review, customer alignment, and coordination, and can improve cohesion, reduce pressure, clarify blockers, lower quality risk, or modestly advance related work.

The release also improves determinism and performance. Loading preserves saved random state, avoids daily simulation updates, and preserves saved avatar positions. Onboarding completion runs once per day, validation seeds use deterministic simulation IDs, and the main timer renders once per tick instead of once per simulated five-minute step. Decision Threads now observe and report follow-up phases without adding extra hidden project/work progress, while projects keep a bounded causal ledger for AI Debug and validation.

## Version 34 deep rollover and project closeout fix

Version 34 completes the deep simulation safety patch. It adds `recordSimulationError()`, `company.systemErrors`, `company.lastSimulationError`, `company.lastDailyCloseStatus`, a guarded `simulateMinute()` wrapper, and a guarded `dailyClose()` wrapper around `dailyCloseCore()`. If a rollover or simulation tick throws, the game records the error, pauses, and stops the current speed batch instead of freezing silently.

The timer loop now stops mid-batch if the company pauses, reaches game over, or records a simulation error. Pressing Resume clears the stored last error so the player can continue after inspecting the issue.

Projects now track `closeoutReadyDays`. A project can complete from sustained closeout readiness instead of requiring an exact mathematical 100%. Near-complete projects can finish when progress reaches 99.5%, when work-item progress reaches 99.5% with no blockers, when at least 95% of project work is closed with no blockers, or when a clean near-deadline project is ready for closeout. This prevents projects from stabilizing forever around 95-99%.

The v34 pass also retains the long-run stability fixes from v33.1: work-item maintenance has hard caps and attempt guards, executive-briefing trimming cannot loop indefinitely, long-run collections are pruned at day close, employee work output no longer calls full system/audit normalization every five simulated minutes, learning coverage audits are cached per day, and expensive event/failure polling is throttled instead of running every five-minute step.

## Version 35 market, board, valuation, and investor relations

Version 35 makes the outside world more legible without adding an online dependency. Valuation is now a dynamic external-belief estimate influenced by fundamentals, market sentiment, investor confidence, valuation quality, leadership reputation, project visibility, and shocks. The Board has its own profile and interpretation of valuation, execution, cash, risk, leadership consistency, and investor concern.

Investor Relations adds investor sentiment, shareholder/investor confidence, fundraising terms, dilution and control pressure, board valuation interpretation, and AI Debug diagnostics for hidden market and investor state. Valuation trend controls use finance-style windows such as 1D, 1W, 1M, 3M, YTD, 1Y, and All.

## Version 36 workload realism and project pressure

Version 36 tightens the relationship between projects, employees, and workload. Projects are slower to complete, more likely to create sustained pressure, and better able to produce backlog, blockers, delays, missed estimates, stress, and staffing demand when too many initiatives compete for the same limited people.

Employees have limited practical work capacity. Multiple projects cannot treat the same eight employees as fully available everywhere at once. Portfolio reviews and project requests are expected to show time estimates, staffing implications, schedule risk, and department viewpoints while preserving hidden uncertainty.

## Version 37 executive communication and valuation presentation

Version 37 focuses on player readability. CEO messages are expected to read like executive emails or memos: the human explanation comes first, supporting context follows, and debug-style numbers stay out of normal play. CEO choice titles should name concrete actions rather than abstract strategies, while department viewpoints should explain why each group agrees or disagrees using specific evidence.

The valuation trend UI was refined to feel more like a real finance chart. Range controls change both the visible comparison window and the meaning of the displayed trend.

## Version 38 causal learning and message integrity

Version 38 is the current build. It strengthens Institutional Learning by requiring meaningful, attributable evidence before lessons influence behavior. Learning episodes now track domains, attribution quality, intervention/comparison context, review windows, failure cause, and later outcomes. Short observations, displayed messages, policy countdowns, or transition completion alone should not validate a lesson.

Executive communication records now preserve explicit links, predicted severity, sender confidence, observed materiality, recommendation accountability, and department-specific evaluation. Customer and market intelligence feeds customer sentiment, revenue, project reviews, valuation, board interpretation, and memo evidence through structured offline simulation state. Recent validation confirmed JavaScript syntax, no duplicate named functions, no duplicate HTML IDs, and deterministic continuation from day 50 to day 100.
