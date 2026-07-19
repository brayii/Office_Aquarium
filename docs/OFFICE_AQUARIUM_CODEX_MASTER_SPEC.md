# Office Aquarium — Master Product, Design, and Engineering Specification

**Current source of truth:** `Office_Aquarium.html` and the `src/` JavaScript source tree  
**Current save version:** `40`
**Target environment:** Standalone browser application, desktop and Android/mobile  
**Architecture:** Standalone offline HTML page with external local JavaScript  
**Player role:** CEO  
**Simulation style:** Autonomous employee and company simulation  
**Primary design goal:** A living technology company that runs itself while the player influences it through CEO-level decisions

---

# 1. Purpose of This Document

This document is the complete handoff for Codex or another software-development agent.

It defines:

- the full product vision
- the current implemented scope
- the game-design boundaries
- the current code architecture
- the simulation model
- the employee AI model
- the company model
- the CEO communications system
- the newspaper system
- save/load and migration requirements
- mobile and desktop requirements
- failure and recovery behavior
- testing expectations
- known risks
- future roadmap
- implementation priorities
- rules Codex must follow when changing the project

This document should be read together with:

`Office_Aquarium.html` and the `src/` JavaScript source tree

The HTML file and ordered JavaScript source files are the runtime source of truth. This Markdown file is the product and engineering source of truth.

---

# Current Build Notes

- Save version is `40`.
- The player-facing runtime is `Office_Aquarium.html` plus ordered source files under `src/`.
- Browser/mobile release packages are generated under `dist/`.
- Desktop release packages are generated under `src-tauri/target/`.
- Superseded local specifications and old builds are preserved in `misc/Office_Aquarium_Misc_Legacy_2026-07-17.zip`. The ZIP is historical reference only and must not be treated as runtime or canonical source.
- The canonical documentation set lives in `docs/`. The project home keeps `README.md`; older root-level specification copies should not be treated as canonical unless explicitly restored and tracked.
- Private implementation prompts matching `OFFICE_AQUARIUM_CODEX_*.md` and `OFFICE_AQUARIUM_V*_*.md` remain ignored unless explicitly tracked as a canonical project document.

Current simulation integrity rules:

- Reusable game rules, statuses, timings, thresholds, and defaults must be defined in `src/core/constants.js` and consumed from there. If a shared rule is missing, add it to that file before wiring consumers; do not copy the value into multiple systems.
- Project health must use actual project allocation, not only department headcount.
- Required staffing, missing staffing, uncovered assignments, blockers, backlog, and timing risk must be connected to simulation producers, not static display values.
- One short-staffed project should create project/workforce pressure, not automatically a company crisis.
- Company staffing crisis should require broader, sustained evidence across staffing shortage, recruiting failure, critical roles, project delivery damage, or multiple affected projects.
- Normal player UI should describe known/reported conditions. Hidden actual state belongs in AI Debug.
- Derived reporting fields such as `staffingModel`, `riskPillars`, and `workforceAllocationSnapshot` are display or audit helpers and must not become authoritative save/hash state.
- Daily rollover is owned by `src/systems/daily-pipeline.js`. Every canonical stage must run through `runDailyStage()` in the order defined by `OFFICE_AQUARIUM_CONSTANTS.dailyPipeline.stageOrder`.
- Valuation and investor reaction update at most once per simulated day unless an explicit validation force flag is used. Reading Board or market views must not consume RNG or create duplicate forecasts.
- Company-wide, project, and workforce lessons require an attributable reviewed episode and independent evidence group. Unreviewed events may record evidence but cannot change department, employee, project-estimation, recruiting, or onboarding behavior.
- Social AI model 4 owns source-backed conflict/repair, bounded directional memory, grounded visible conversations, slow evidence-backed culture, derived informal groups and team chemistry, and evidence-backed formal/informal leadership.
- Conversation Presence uses the shared rules in `src/core/constants.js` for grounded triggers, 4-5 turn structure, wording volume, timing, movement, spacing, critical-work protection, anti-repetition, and persistence bounds.
- Social organizational state may influence only social preference, reporting interpretation, and bounded emotional recommendations. It must never become a direct project, work, hiring, customer, or Institutional Learning modifier.

---

# 2. One-Sentence Product Pitch

> Lead a living hardware and software company as CEO while autonomous employees think, work, collaborate, remember, burn out, resign, recover, and react to your leadership.

---

# 3. Core Experience

The player is the CEO of a fictional technology company that builds hardware and software products.

The player does not directly control employees.

Instead, the player:

- watches the office operate
- reads executive communications
- responds to strategic decisions
- manages product direction
- protects company finances
- handles crises
- manages board confidence
- reacts to hiring needs
- watches employees form relationships and careers
- reads the company newspaper
- shapes the company's identity over time

The company should continue to function without constant player input.

The player should feel like they are steering an organization rather than puppeteering workers.

---

# 4. Design Pillars

## 4.1 CEO-Level Control Only

The player may:

- approve or reject strategic options
- respond to board and executive recommendations
- set company-wide directives
- approve launch timing
- decide how to handle cash pressure
- choose hiring responses
- respond to burnout and culture problems
- influence quality, speed, revenue, and employee support
- manage risk and board confidence

The player should not:

- manually assign an employee to a desk
- directly tell one employee to work
- control employee movement
- micromanage individual tasks
- manually force relationships
- directly edit employee statistics during normal play

This boundary is fundamental.

## 4.2 Autonomous Employees

Employees must remain self-directed.

They should:

- choose their own actions
- react differently to the same company policy
- have persistent personalities and goals
- remember important events
- form professional familiarity, trust, respect, comfort, and friction
- collaborate or complain
- become sick
- recover
- resign
- achieve milestones
- influence company results through role-specific work

## 4.3 Simulation-First Outcomes

The simulation should produce outcomes from internal state.

Examples:

- product progress comes from employee work
- burnout comes from sustained stress
- resignations come from low morale and prolonged risk
- hiring events come from actual vacancies
- company crises come from cash, trust, board, stress, or staffing failure
- newspaper issues come from real recorded events
- CEO communications come from actual company conditions
- revenue comes from product phase, customers, trust, and readiness

Avoid arbitrary result screens disconnected from the simulation.

## 4.4 Explainable AI

Employee behavior must remain understandable.

A player or developer should be able to inspect:

- current action
- utility scores
- strongest goals
- active cooldowns
- memories
- relationship state
- current thought
- energy, stress, morale, and focus
- likely collaborator
- reason the current action was selected

## 4.5 Offline-First

The game must work without external APIs.

The current version must not require:

- an online model service
- a web connection
- a backend
- a database
- a framework
- a build system

Future web intelligence may be an optional layer only.

---


## Implemented in save version 10

The current build adds several product-bible systems while preserving the single-file runtime:

- employee opinion of the CEO (`trust`, `fairness`, `competence`, `support`, `fear`)
- lightweight employee career history, career levels, and promotion records
- persistent company history entries used as long-term structured memory
- company culture dimensions and bounded market modifiers
- market-pressure and performance-review CEO events
- explicit firing/backfill path through CEO-level performance decisions
- developer AI Debug mode in the employee detail modal

Save migration restores defaults for older saves that lack these fields.


## Implemented in save version 11

The current build completes the remaining product-bible simulation layers without adding external dependencies:

- rule-based manufacturing readiness, yield, capacity, and supply risk
- Investor Confidence, investor patience, and investor pressure
- lightweight hardware, software, product, and finance team cohesion models
- customer sentiment separate from public trust
- offline world snapshot and bounded market modifiers
- supply-chain and investor-pressure CEO communications
- manufacturing fulfillment impact on launched-product revenue
- adaptive learning feedback into employee utility choices

These systems are initialized for old saves and shown in the Company tab.
## Implemented in save version 12

Version 12 is a behavior-preserving consolidation and AI quality pass. The single HTML file now keeps one canonical definition for the core employee action, role output, communication, day-end, render, reset, load, newspaper, and decision paths instead of wrapping them later in the script.

It also adds or strengthens:

- explicit employee skills used by output and save migration
- need-aware collaboration matching that considers social fit, role compatibility, current project need, availability, and stress
- broader performance escalation based on recent output, absence, quality mistakes, role pressure, coaching state, morale, and focus
- experience-based learning from collaboration, trust, stress, and action outcomes
- offline-only operation with no online-service requirement


## Implemented in save version 13

Version 13 moves adaptive learning from action selection to action completion. Employees now store an `actionOutcomeContext` snapshot when they choose an action, then compare it with the real outcome when the action finishes.

This version also connects quality mistakes to simulation producers:

- rushed technical work under speed pressure
- low-focus or high-stress work
- failed verification-style work
- launched-product fulfillment defects

Quality mistakes now decay gradually, so performance cases can recover after coaching and better operating conditions.


## Implemented in save version 14

Version 14 rebalances CEO event scheduling so repeatable events no longer dominate ordinary runs.

It adds:

- per-event history with last shown day and count
- per-event cooldown readiness
- category recency penalties and novelty weighting
- cash runway hysteresis, rearming only after recovery above the safe cash threshold
- sustained performance-review risk days and same-employee review cooldowns
- proactive opportunity events for customers, tools, research, competitors, patents, and employee initiatives

The scheduler now chooses among eligible events by weight instead of uniformly selecting from the currently eligible pool.


## Implemented in save version 15

Version 15 adds the Phase 1 information foundation for the hybrid cognitive architecture. It does not replace Utility AI or change CEO-level control; it gives the simulation generated internal company data that employees can perceive later.

It adds:

- generated internal work items with priority, difficulty, blockers, deadlines, required skills, visibility, owners, and collaborators
- richer team operational state including backlog, blocked work, defect risk, knowledge coverage, staffing gaps, and current priority
- role-specific employee beliefs with estimates, confidence, source, and update day
- daily employee briefings containing assigned work, known blockers, team pressure, messages, rumors, and access-limited knowledge
- department objectives and information source metadata
- structured issue records with severity, urgency, confidence, novelty, strategic impact, evidence, departments, and routing status

This creates the information layer needed before employees can plan, coordinate, suppress/report issues, and eventually generate CEO communications from unresolved strategic problems.


## Implemented in save version 16

Version 16 adds Phase 2 employee decision integration. Employees still use Utility AI for immediate behavior, but the utility inputs now include internal work and belief context.

It adds:

- active work lookup by employee, team visibility, owner, priority, and deadline
- work skill-fit scoring from required skills and employee skills
- work context including deadline risk, blocker risk, quality concern, team pressure, uncertainty, and daily briefing data
- short employee intentions with lightweight steps such as inspect, coordinate, execute, and verify
- Utility AI scoring modifiers for assigned work, blockers, deadlines, uncertainty, quality risk, skill gaps, and team pressure
- action thoughts tied to actual work items and perceived team conditions
- role output now advances generated internal work items

This makes employees choose actions from what they plausibly know about their work instead of only personal stats and global company bars.


## Implemented in save version 17

Version 17 adds Phase 3 employee communication. It keeps the CEO inbox and strategic event system intact, but employees now generate internal communication from their own work, beliefs, team context, issue records, and social state.

It adds:

- employee communication state and save migration
- structured internal employee messages with sender, recipients, department, severity, urgency, confidence, reliability, evidence, work item links, and issue links
- help requests when work is blocked, skill fit is weak, uncertainty is high, or deadlines are risky
- status reports for notable work progress, blockers, and deadline pressure
- risk reports derived from structured issue records and role-specific awareness
- opportunity proposals from ambitious or creative employees in healthy conditions
- informal rumors when employees have high concern but low confidence
- suppressed reports when fear, politics, low CEO trust, or weak communication culture make an employee choose not to escalate
- capped employee message history, team reports, per-employee known messages, and communication statistics

This makes communication a product of the living company rather than only a fixed CEO event scheduler. The next escalation phase can route unresolved internal reports into executive memos and CEO decisions.


## Implemented in save version 18

Version 18 adds Phase 4 escalation routing. Employee messages now move through a lightweight escalation engine before they reach the CEO.

It adds:

- save migration for escalation queues and routed message IDs
- generated communication support for CEO memos that originate from employee reports
- escalation scoring using severity, urgency, confidence, reliability, strategic impact, and novelty
- routing levels for local-only handling, executive information memos, and CEO decision memos
- automatic archive entries for informational memos that do not require a CEO choice
- a CEO decision queue for strategic unresolved internal issues
- generated department recommendations and evidence for escalated messages
- generated CEO choices for runway, quality, supplier, market, initiative, and general operating escalations
- source message status updates when an escalated item is queued, archived, or resolved by CEO decision

This changes the flow from company numbers directly triggering every memo toward employees reporting internal issues, the organization filtering them, and only strategic unresolved matters reaching the CEO.


## Implemented in save version 19

Version 19 adds contextual employee learning. The existing completed-action learning loop remains, but employees now also maintain lightweight contextual preferences and communication tendencies.

It adds:

- expanded learning state for help seeking, testing, focused work, reporting, suppression, initiative, recovery, and contextual preferences
- save migration for contextual preference maps
- context keys based on team, work type, stress, team pressure, and active risk
- action scoring modifiers from learned contextual preferences
- outcome updates for work, lab/testing, collaboration, meetings, and recovery breaks
- communication learning for help requests, risk reports, status reports, opportunity proposals, and suppressed reports
- reporter reinforcement when an internal report becomes an executive memo or CEO decision memo
- bounded contextual preference storage so saves stay lightweight and explainable

This makes employees diverge more over time: some learn to ask for help, some test earlier, some report risk more readily, some become more cautious, and some lean into initiative when the company rewards it.


## Implemented in save version 20

Version 20 adds long-run validation telemetry for balancing the autonomous company simulation. It does not add a new control surface or external dependency; it records compact simulation health data so long seeded runs can be evaluated.

It adds:

- save migration for `simulationMetrics`
- counters for action choices, collaboration, quality mistakes, sickness, resignations, firings, coaching, CEO decisions, executive memos, queued escalations, and local issues
- daily snapshots for cash, phase, active employees, morale, stress, quality, integration, customers, message routing, action diversity, learning spread, learning magnitude, memo repetition, and survival risk
- balance flags for high stress, memo repetition, learning drift, excessive CEO interruptions, high rework, and low action diversity
- capped daily metric history for 100-300 day simulation runs
- AI Debug display of the current balance summary

This phase makes the simulation easier to tune empirically. Instead of guessing whether the employee AI is drifting, repeating, over-escalating, or under-diversifying, the game now records the signals needed to judge that over time.


## Implemented in save version 21

Version 21 adds a seeded balance projection runner. It uses the long-run telemetry from version 20, but lets the game run a temporary validation simulation without advancing the player's actual company.

It adds:

- a debug-only Balance Run button in the employee detail modal
- seeded offline random generation for repeatable projection runs
- temporary snapshot and restore of the current company and employees
- validation mode that suppresses autosave, timers, rendering churn, and CEO decision popups during projection
- a 120-day balance projection report with final phase, cash, active employees, average stress, average morale, survival risk, action diversity, learning spread, memo counts, escalation counts, quality mistakes, sickness, resignations, firings, coaching, and balance flags
- projection results displayed in AI Debug without changing the real saved company

This makes it possible to evaluate the simulation over long runs from inside the game itself while keeping the actual playthrough intact.


## Implemented in save version 31

* Added living workforce economy and real failure layer.
* Added hidden employment cost defaults for every employee and save migration for workforce/economy fields.
* Added company finance tracking for payroll, facilities, software/lab costs, manufacturing, support, contractor cost, total daily cost, net cash flow, runway, and unpaid payroll.
* Added dynamic department staffing ranges, understaffing/overstaffing pressure, and workforce/financial pressure UI.
* Added AI-generated hiring requests through the CEO Inbox.
* Added restructuring and layoff recommendations, severance cost, payroll reduction, survivor effects, and layoff history.
* Added board governance strikes, CEO PIP targets, and immediate CEO-fired/company-failed outcomes.
* Added company risk components and telemetry fields for net cash flow, runway, board strikes, and unpaid payroll.

## Implemented in version 31.1 balance pass

* Kept save version 31 while tuning the economy.
* Reduced post-launch revenue compounding and strengthened scalable support, manufacturing, quality-burden, and growth-overhead costs.
* Reduced pre-revenue fixed burn so early runway remains playable.
* Added richer economic telemetry for gross revenue, payroll, manufacturing, support, growth overhead, total daily cost, net cash flow, and runway.
* Added matrix summary reporting for median final cash, cash p10/p90, median net cash flow, and median post-launch net cash flow.
* Throttled CEO Inbox cadence by making queued recommendations respect the executive cooldown.
* Added quality-rework telemetry for mistakes created, mistakes resolved, reopened defects, verification failures, rushed-work mistakes, stress-related mistakes, low-focus mistakes, weak-culture mistakes, manufacturing defects, rework actions, and unresolved quality mistakes.
* Reduced routine quality mistake creation, made old rework decay faster, and tuned the quality-rework alert so it flags runaway team-level rework instead of normal cleanup.

## Implemented in version 31.2 autonomous workforce management pass

* Kept save version 31 while adding safe migration defaults for burnout response, help-seeking history, manager history, performance management, termination history, hiring need history, recruiting pipeline, manager actions, termination notifications, and succession risk records.
* Added a burnout response ladder so stressed employees prefer recovery, help-seeking, collaboration, and manager-led workload redistribution before severe burnout or sick leave.
* Added evidence-based hiring need scoring with sustained confidence before a CEO hiring memo is created.
* Changed approved permanent hiring so CEO approval starts recruiting, then candidates join later after a search and offer process.
* Added manager-led coaching, formal coaching, PIP review, successful recovery, and operational termination with HR informational notices.
* Kept layoffs separate from performance termination. Layoffs remain CEO-approved strategic restructuring actions.
* Expanded Operating Health workforce display with recruiting, hiring recommendations, onboarding, coaching, PIP, burnout watch, terminations, layoffs, searching, retirement watch, and CEO PIP status.

## Implemented in save version 32

* Added the Project Portfolio system as the strategic center of company work.
* Added persistent project migration fields: projects, project proposals, project archive, project families, next project id, portfolio health, project review queue, project decision history, project lessons, and project seed state.
* Added employee project affinity, project history, proposal history, and project skill defaults.
* Migrated old saves by creating a legacy flagship project from existing chip, software, integration, and quality progress.
* Added reusable project families, deterministic hidden project reality, visible proposal estimates, project performance, budget/spend, staffing demand, and project work-item links.
* Added project proposal and project review CEO memos using the existing three-choice Inbox.
* Active projects now generate work items, affect operating costs, influence staffing demand, and appear in the Operating Health Project Portfolio panel.
* The Project Portfolio panel now lets the CEO request formal proposal, review, pause, and cancellation memos at any time while preserving the Inbox decision flow.
* Added constrained CEO strategic initiative requests for hardware, software, business, and internal project families.
* Project review choices can continue, pause, cancel, reduce scope, expand funding, split into phases, merge compatible projects, or require customer validation when context allows.
* Project approval, pilot, delay, rejection, continuation, pause, merge, split, validation, reduction, expansion, and cancellation record story/history consequences and learning evidence. Typed and institutional lessons change only after reviewed project outcomes or delayed consequences.
* Project cancellation now stops spend, closes related project work items, affects employee morale and affinity, creates delayed consequences, and can influence board pressure.
* Added board portfolio review memos for excessive active projects, weak pipeline, concentration risk, at-risk projects, and budget overrun patterns.
* Added deterministic learning and optimization fixes: simulation-affecting randomness routes through `simulationRandom()`, persistent `randomState` and `nextRuntimeId` are migrated, simulation communication and decision IDs use deterministic runtime IDs, and the obsolete legacy lesson-acceptance helper has been removed.
* Removed full-company institutional normalization from the employee Utility AI hot path. `institutionalUtilityBias()` reads already-normalized employee learning state.
* Added behavioral learning validation to the learning coverage audit. The audit checks that help-seeking lessons raise collaboration utility, recovery lessons raise break/recovery utility, and testing lessons raise lab/testing utility.
* Added a player-facing sound dropdown with `Muted`, `Alerts Only`, `Music Only`, and `Music + Alerts`. Music uses `game_music_loop.mp3`; CEO message alerts use `new_message_alert.mp3`. Missing, blocked, or unsupported audio must fail softly and never stop the simulation.
* Added CEO Inbox information design refinement. Memos now include why the issue reached the CEO, chain-of-command context, concrete evidence, sender interpretation, recommendation, other viewpoints, no-action forecast, uncertainty, and memo-quality audit data.
* Employee-originated reports normally go through manager review before CEO escalation. Managers can validate, lower urgency, raise urgency, delay, handle locally, or escalate. Direct employee-to-CEO visibility is reserved for rare protected or severe cases.
* Added hidden sender credibility tracking for estimate accuracy, recommendation accuracy, bias strength, overconfidence, caution, and evidence quality. Later delayed outcomes update archived memo accountability without revealing perfect truth to the player.
* Completed the Inbox information-design correction pass. Memo audits are Debug-only, the evidence-to-choice validator no longer gives false coverage credit, department recommendations are scored against feasible choices without exposing numeric scores in normal memo text, no-action forecasts and alternative viewpoints reference current simulation evidence, irrelevant context filler is reduced, and archived memo audits stay hidden during normal play.
* Added explicit evidence signal IDs for memo-choice audit coverage so the validator can link choices to finance, people, quality, project, market, and governance evidence without depending only on shared words.
* Added Derived Operating Health. The top Operating Health tracks and operational dashboard now read from computed project, workforce, customer, manufacturing, finance, board, market, and employee state instead of raw optimistic source bars. Project cards display Overall Health, portfolio metrics use weighted project averages, lifecycle labels switch before and after launch, missing systems render as `N/A`, trend history is stored in `operatingHealthHistory`, and AI Debug exposes contributor traces for derived project and portfolio health.
* Expanded manager review so reports can be merged, reframed, challenged, locally handled, delayed, or suppressed with a discoverable suppression record. Protected escalation now includes severe, safety, legal, ethics, whistleblower, retaliation, repeated failed escalation, and high-transparency paths. Informational memos and resurfaced suppressed reports now update sender credibility as well as delayed CEO outcomes.
* Retired the visible Company Intelligence panel after the executive briefing experiment. The normal player-facing Company screen no longer renders a separate Company Intelligence card, preventing duplicated information and empty long-run UI clutter.
* Preserved the useful logic as an internal Executive Intelligence Snapshot. The snapshot ranks top risks, top opportunities, department beliefs, suppression findings, major trends, strategic signals, and source IDs from structured simulation state.
* The internal snapshot now informs CEO memo evidence, event priority, no-action forecasts, department recommendations, story-thread selection, newspaper headlines, project and board reviews, CEO PIP context, suppression accountability, and Institutional Learning.
* Suppression analysis remains internal. Serious suppression can influence protected escalation, manager credibility, Company Story/history, Weekly Newspaper interpretation, and lessons, but no permanent raw suppressed-report count or "what the company believes" dashboard remains.
* The snapshot is visible only inside AI Debug. Existing save fields for `executiveBriefing` and `executiveBriefingArchive` remain migration-compatible, but normal rendering does not use them and the obsolete archive is pruned rather than grown as a daily briefing log.

## Implemented in save version 35

Save version 35 adds the market, board, and valuation intelligence layer. Valuation is now a dynamic external-belief estimate distinct from cash, driven by company fundamentals, market sentiment, market confidence, valuation quality, leadership reputation, seeded external world conditions, project visibility, and decaying valuation shocks. The company badge now presents a derived company identity rather than a product phase. The Board has a persistent profile that changes how it interprets valuation level, trend, quality, fundamentals, execution, cash, risk, and leadership consistency. Board valuation memos can create fundraising opportunities; funding increases cash while adding dilution, investor ownership, expectations, and board control pressure. Recruiting and customer confidence now receive small, bounded effects from durable market confidence without overriding salary, culture, quality, support, delivery, or role fit. AI Debug exposes the hidden market model, valuation target/noise/shocks, Board profile, and Board market lessons.

* Added the Causal Integrity and AI Action Outcomes pass from the deep simulation audit.
* Project staffing now uses persistent `staffAllocations` in FTE units, with migration-safe defaults on projects, proposals, and archived projects.
* `derivedStaffingCoverage(project)` is the canonical staffing coverage path. The old separate project-performance formula that capped full staffing near 58 percent has been removed.
* Portfolio open-role pressure is now based on missing allocated FTE by department instead of total project demand minus total employees.
* Employee work selection distinguishes assigned, allocated, collaboration, and merely visible work so teams no longer pile onto every visible work item at full output.
* Collaboration now creates an `activeCollaboration` session with partner, work item, purpose, start time, and outcome. It can advance shared work, reduce quality risk, resolve blockers, improve quality/integration, strengthen relationships, and feed learning evidence.
* Meetings now create an `activeMeeting` with a purpose such as blocker review, planning, risk review, customer alignment, or coordination. Meetings can improve cohesion, reduce pressure, clarify blockers, reduce quality risk, or modestly advance related work.
* Action learning now considers owned work-item progress and blocker resolution in addition to broad company metrics.
* Save loading preserves the saved random state across employee hydration and no longer runs daily simulation systems such as manufacturing update, company information update, or metrics collection.
* Office rendering during load preserves saved avatar positions so loading does not consume RNG just to draw employees.
* Onboarding completion now runs once per simulated day and no longer runs from the hiring-pipeline UI render path.
* The main timer batches simulation steps and renders once per tick, improving long-run and mobile performance at high speed.
* Balance projection and matrix seeds now use deterministic simulation IDs instead of wall-clock time.
* Finance Analyst work now improves efficiency and Investor Confidence instead of directly adding cash every work step.
* Decision Threads now observe and report reaction, operational, major, and legacy follow-up phases without applying extra hidden project or work-item progress on top of the authoritative decision consequence path.
* Projects now keep a bounded `causalLedger` for employee work, collaboration, meetings, and project-performance aggregation so AI Debug and tests can trace visible project changes back to a cause.
* Added the completed deep rollover guard after a reported freeze near day 70 at day rollover.
* Added `recordSimulationError()`, `company.systemErrors`, `company.lastSimulationError`, and `company.lastDailyCloseStatus`.
* Split daily rollover into guarded `dailyClose()` and the ordered `dailyCloseCoreOrdered()` pipeline so day-close errors are captured, logged, and pause the simulation instead of freezing silently.
* Split the simulation tick into guarded `simulateMinute()` and `simulateMinuteCore()` so tick errors are captured and the UI can render the paused/error state.
* The timer loop now breaks out of the current speed batch after pause, game-over, or simulation error.
* Projects now track `closeoutReadyDays` and can complete through sustained closeout readiness at 99.5% progress, 99.5% work-item progress with no blockers, 95% closed project work with no blockers, or clean near-deadline closeout. This prevents projects from stabilizing below 100% forever.
* Work-item maintenance now has hard caps and attempt guards, executive-briefing trim logic has a guard, long-run collections are pruned at day close, employee work output no longer runs full system/audit normalization every five simulated minutes, learning audits are cached per simulated day, and expensive event/failure checks are throttled.

## Implemented in save version 39

Save version 39 completes Social Personality AI Stages 6-8 and adds an evidence-backed organizational interpretation layer.

* Negative workplace interactions can create source-backed professional conflicts with directional memory, relationship before/after state, personality interpretation, temporary frustration, and bounded emotional recommendations.
* Conflict repair requires a real unresolved conflict and a later apology, clarification, constructive follow-up, recognition, or other credible repair action. Failed and accepted attempts remain attributable.
* Social memory is directional, deterministic, saveable, bounded per relationship and employee, compressed under pressure, aged by simulated time, and always linked to source events.
* Contextual recall can request a small stress or morale reaction through the Emotional System. Cooldowns and caps prevent repeated emotional spam.
* Grounded two-to-four exchange conversations appear briefly in the live office for real greetings, work, help, blockers, meetings, deadlines, mentoring, recognition, conflict, repair, news, and celebration events.
* Nearby attentive employees may overhear ordinary dialogue at reduced confidence. Private dialogue is difficult to overhear; confidential dialogue is never shown or overheard.
* Organizational culture changes slowly from repeated evidence and tracks confidence. Informal groups, project and department chemistry, bridge employees, and leadership influence derive from source-backed relationship evidence.
* Formal authority remains separate from earned credibility and informal influence. Listener trust and culture can scale only bounded emotional recommendations.
* The Reports workspace includes People & Culture views for culture, groups, network, and leadership. Raw pair weights, hidden memory scores, and repair calculations remain Debug-only.
* Shared rules live in `src/core/constants.js`; dedicated deterministic 90-, 180-, and 365-day social-system tests enforce bounds, source retention, save/load, UI read safety, and Work AI isolation.
* Production saves omit transient social diagnostics, compact repeated field names through a versioned backward-compatible envelope, and bound detailed relationship evidence, cooldowns, memories, conversations, reputation observations, and Institutional Learning records. Older plain JSON saves remain readable, and regression tests enforce the release storage budget against a mature 29-employee complete relationship graph.

## Implemented in save version 40

Save version 40 deepens the existing visible-conversation system into a grounded conversation-and-presence pipeline.

* Conversations begin only from an approved real trigger and retain the source event and evidence identifier.
* The normal sequence is approach, greeting, topic, reply, optional follow-up, goodbye, and activity resumption, producing four or five timed exchanges.
* All 15 categories provide 40 deterministic templates. Intent selection is separate from reserved, professional, extroverted, and humorous wording.
* Pair history tracks recent templates, topics, categories, and partners so unused dialogue is preferred before repetition.
* Real shared memories can shape later wording; unresolved placeholders, stale evidence, unknown triggers, and unsupported future claims are rejected.
* Employees approach with acceleration/deceleration, maintain personal space, face one another, use small speaking/listening gestures, and return to their latest destination after the goodbye.
* Sentence length controls display time, short pauses separate replies, and irrelevant conversations cannot interrupt critical work.
* Help requests and blocker resolution remain distinct grounded events: direct assistance uses help dialogue, while a real resolved blocker uses the blocker category.
* Onboarding can produce a mentoring exchange after the new hire and mentor are actually co-present. A cooled, unresolved conflict can produce an autonomous apology or clarification only when the employees, relationship, culture, and source-backed conflict support it.
* Conversation opportunities created only for presentation, such as a completed shared task or return from another department, do not fabricate relationship, emotional, work, or learning outcomes.
* Conversation timing, presence, movement, anti-repeat state, and source links are migration-safe, compact, deterministic, and covered by `tests/conversation-presence-regression-test.js`.

## Implemented in save version 38

Save version 38 focused on causal learning integrity, executive-message integrity, customer/market intelligence, and long-run deterministic safety rather than adding another broad foundational system.

* Institutional Learning now uses domain-specific episode channels and attribution quality. A lesson should be reinforced by meaningful evidence, not by a policy countdown, a message being displayed, or a short observation that cannot prove causality.
* Typed project and workforce learning use the same causal gate. Starting recruiting, coaching, policy, or project actions records evidence only. Completed onboarding, completed projects, successful PIP recovery, and reviewed delayed consequences can update future behavior when attribution and independence requirements are met.
* Project, workforce, customer, investor-relations, and policy lessons now keep clearer links to the events, decisions, comparisons, and review windows that created them.
* Employee action learning is weighted toward owned work, resolved blockers, and directly attributable outcomes instead of broad company movement that may have been caused by coworkers.
* Company communication records now carry explicit links, predicted severity, sender confidence, observed materiality, and later accountability so messages can be evaluated without exposing perfect truth to the player.
* CEO memos use action-first option titles, an email/memo structure that reads naturally, evidence filtered to the decision, department viewpoints that add specific perspective, and Debug-only audit details.
* Project-proposal duplicate messaging has been reduced by routing project proposals through the intended executive-message path rather than producing parallel player-facing messages for the same proposal.
* Customer and market intelligence is represented through customer segments, weighted customer sentiment, commercial project value, market concerns, and external perception. These signals influence revenue, valuation, board interpretation, project reviews, and future memos without becoming an online-data dependency.
* Investor-relations learning tracks prediction quality for trend interpretation, concern diagnosis, fundraising timing, volatility interpretation, narrative accuracy, and overreaction bias.
* Deterministic continuation checks are part of the validation pass. Recent validation confirmed JavaScript syntax, no duplicate named functions, no duplicate HTML IDs, and deterministic continuation from day 50 to day 100.

Known remaining validation work: the current build still benefits from longer 365- and 1,000-day balance matrices, especially around project workload pressure, board confidence, valuation drift, hiring cadence, customer growth, and late-company failure rates. Daily close is already modularized through the canonical guarded stage pipeline while the release remains an offline HTML application.

## Implemented in save version 37

Save version 37 refined executive communication and market presentation. The goal was to make memos read like real executive communication rather than debug reports.

* Normal messages begin with the human-readable email or memo body. Context bullets, evidence, uncertainty, and department views support the message rather than appearing before it.
* CEO choices are concrete actions, such as delaying a release, approving headcount, reducing scope, increasing validation, or shifting budget. Strategic reasoning belongs in the explanation below the title.
* Department viewpoints are expected to add new information from that department's point of view instead of repeating the same evidence in a different format.
* Internal scores, severities, evidence IDs, and memo audits are hidden from normal play and available only through AI Debug.
* The valuation trend UI was aligned with common finance range controls: 1D, 1W, 1M, 3M, YTD, 1Y, and All. Range choice changes the displayed comparison and trend behavior.

## Implemented in save version 36

Save version 36 tightened workload realism and project pressure.

* Project completion pacing was tuned so projects take longer, create more sustained workload, and can generate delays, blockers, backlog, stress, missed estimates, and staffing pressure when too many projects compete for the same employees.
* Employees have limited practical work capacity. Multiple active projects cannot assume the same eight workers are fully available everywhere at once.
* Portfolio requests and reviews are expected to include time estimates and department viewpoints, while hidden project reality remains imperfectly known by employees, managers, the board, and the CEO.
* Board confidence, project health, product health, customer sentiment, and revenue are derived from behind-the-scenes state rather than direct optimistic bars.

## Implemented in save version 30

* Added Leadership and Organizational Dynamics.
* Added persistent hidden leadership values for quality focus, speed focus, innovation, employee wellbeing, financial discipline, customer focus, transparency, risk tolerance, accountability, and long-term thinking.
* CEO decisions now leave a leadership footprint that affects employee trust, behavior, retention, culture, and later outcomes.
* Added organizational momentum for burnout, turnover, innovation, trust, execution, financial health, and culture.
* Added quarterly organizational reviews every 91 simulated days and annual reviews every 365 simulated days.
* Added quarterly employee reviews, stay score, retention risk, job-search behavior, voluntary resignation, age, and retirement readiness.
* Added sustained crisis categories and crisis trajectory display.
* Added Organizational Dynamics inside Operating Health.

## Implemented in save version 29

* Added the Strategic CEO Inbox.
* CEO memos now draw three plausible choices from a larger context-sensitive option pool.
* Choices expose potential benefits, risks, uncertainty, and estimated confidence.
* Department recommendations are generated from departmental priorities and can disagree.
* Decision outcomes vary with company state, including cash, quality, integration, stress, morale, manufacturing readiness, customer sentiment, competitor pressure, and market demand.
* CEO decisions can schedule delayed consequences that resolve several simulated days later.
* Delayed outcomes feed Company Story, Weekly Newspaper events, Company History, Institutional Learning, and communication archives.
* Decision archives preserve strategy, uncertainty, confidence, benefits, and risks.

## Implemented in save version 28

* Connected generated work items to visible simulation progress.
* Added workflow stage labels for Investigation, Requirements, Implementation, Testing or Review, Blocked, Ready for review, and Complete.
* Added owner assignment for open work items and migration-safe stage refresh for existing saves.
* Employee work contribution now advances the employee's active/owned work item rather than an unrelated visible item.
* Blockers can be generated from risk, deadlines, or stalled work and can be resolved by employee work.
* Department briefings, CEO memo evidence, issue evidence, status reports, and internal reports now use work-stage status instead of misleading static percentages.
* Help requests now require a real reason; no-blocker support requests are presented as peer review rather than false blocker messages.

## Implemented in save version 27

* Added Institutional Learning.
* Added `company.lessons`, employee `learnedLessons`, department-level learned behavior, and new-hire onboarding inheritance.
* Institutional lessons are generated from CEO decisions, launch/pilot choices, coaching, firing, burnout resignations, quality mistakes, successful collaboration, and recurring history patterns.
* Utility AI now receives bounded influence from institutional lessons.
* Added periodic pattern review and confidence reinforcement.
* Added player-facing institutional lesson visibility and employee profile visibility for strongest institutional learning. In the current UI cleanup pass, this appears as the Company Lessons section only when meaningful lessons exist; deeper learning validation is AI Debug-only.

## Implemented in save version 26

* Added player-facing Company History as a long-term legacy timeline.
* Company History groups important events by year and quarter.
* It summarizes major decisions, product/company milestones, people events, story threads, and late-company achievements without listing every daily event.
* Increased retained company history entries to support longer runs.
* Added milestone records for cash reserve, positive launched revenue, and 100 customers.

## Implemented in save version 25

* Phase 8: added balance tuning notes from telemetry and projection matrix outcomes. These are currently treated as developer/debug information rather than a permanent normal-play dashboard.
* Phase 9: added operational dashboard cards, mini trend charts, internal report views, and employee work/belief/message visibility.
* Phase 10: expanded employee thoughts, rumor topics, newspaper lead text, and weekly story-chain reporting.
* Phase 11: added release readiness checks for desktop layout, mobile layout, save/load version, offline operation, long-run validation, and story continuity. These checks are now shown only inside AI Debug under Release Validation.

## Implemented in save version 24

* Phase 8 Balance & Tuning pass started.
* Balance Projection Runner now allows CEO events during validation instead of suppressing them.
* Added deterministic validation CEO decision scoring so long seeded runs can resolve memos automatically.
* Balance Matrix summaries now include minimum cash, maximum final stress, and early-ended run counts.
* This makes projection output useful for tuning economy, memo frequency, escalation pressure, stress, quality mistakes, turnover, and survival.

## Implemented in save version 23

* Expanded generated content libraries for work items, blockers, report subjects, opportunity proposals, risk categories, and newspaper/story headlines.
* Added causal story chains that connect work creation, blockers, issue records, employee messages, CEO memos, CEO decisions, and weekly company storytelling.
* Added a player-facing Story Threads panel below Company Story so players can see continuity without opening AI Debug.
* Added deadline-risk and talent-risk issue detection to increase ordinary operating variety.
* Added an AI Debug playtest checklist for save version, 12x speed watch, archives, vacancies, and story-thread counts.
* Added mobile modal sizing and button wrapping improvements for CEO decisions and employee debug panels.
* Documented the source/build consolidation direction that was later implemented as the current `src/core`, `src/services`, `src/systems`, `src/ui`, `src/facades`, and `src/bootstrap` tree while preserving `Office_Aquarium.html` as the launch file.

## Implemented in save version 22

Version 22 adds the first player-facing observability layer and multi-seed validation aggregation. It makes existing internal intelligence visible without turning normal play into a debug dashboard.

It adds:

- Department Briefing cards for hardware, software, product, and finance
- team priority, backlog, blocked work, pressure, defect risk, knowledge coverage, staffing gap, top work, and team signal display
- Company Intelligence summary for local reports, executive memos, CEO escalations, suppressed reports, unresolved risk, opportunities, blocked work, and queued CEO items. This version 22 counter-style summary was later superseded by the version 32 internal Executive Intelligence Snapshot and removed from normal player-facing UI.
- evidence sections in active CEO memos that identify reporting source, department, severity, urgency, confidence, related issue evidence, work item state, and suppressed related reports
- evidence display for archived memos
- multi-seed balance matrix runs from AI Debug
- aggregate projection results including survival rate, average stress, morale, survival risk, action diversity, learning spread, memo repetition, CEO decisions, escalations, mistakes, sickness, turnover, and balance flags

This phase shifts the project from hidden intelligence toward visible company awareness: players can now see what departments are struggling with, why a memo reached the CEO, and whether long-run validation is stable across multiple seeds.

# 5. Current Implemented Scope

## 5.1 Office View

The office contains visible zones:

- Software Studio
- Hardware Lab
- Meeting Room
- Break Area
- Executive Suite

Employees move between these zones based on their selected actions.

The office includes:

- visible employee avatars
- names and activity labels
- thought bubbles
- busy indicators
- offsite state
- resignation state
- pause control
- speed controls
- sound mode dropdown for muted, alerts-only, music-only, or combined sound
- live company time
- CEO alerts

## 5.2 Employee System

Each employee currently has:

- ID
- name
- role
- personality traits
- home zone
- current zone
- visual coordinates
- energy
- stress
- morale
- focus
- legacy relationship score
- richer social model
- personal goals
- memories
- current action
- current thought
- task progress
- action duration
- active/resigned state
- offsite state
- sick days
- burnout-risk days
- achievements
- last action
- repetition count
- cooldowns
- decision trace

## 5.3 Employee Roles

The canonical recruitable role catalog is:

- Software Engineer
- Firmware Engineer
- Software QA Engineer
- Technical Lead
- Software Architect
- Hardware Engineer
- Chip Architect
- Electrical Engineer
- Industrial Designer
- Manufacturing Engineer
- Product Manager
- Finance Analyst
- Manager
- Director
- Vice President

Legacy save aliases normalize `Software Lead` to `Technical Lead`, and `QA Engineer` or `Verification Engineer` to `Software QA Engineer`.

Primary room ownership is:

- Software Studio: Software Engineer, Firmware Engineer, Software QA Engineer, Technical Lead, Software Architect
- Hardware Lab: Hardware Engineer, Chip Architect, Electrical Engineer, Industrial Designer, Manufacturing Engineer
- Meeting Room: Product Manager and Manager
- Executive Suite: Finance Analyst, Director, and Vice President

The eight founding roles are only the startup structure. Organization maturity defines growing, scaling, and established role targets. Every canonical role has a reachable established-company target, while actual hiring still requires evidence, CEO headcount approval, recruiting, and onboarding.

Each role contributes differently to project work and company capability, including:

- hardware product development
- software and firmware product development
- integration
- quality
- trust
- customers
- cash
- board confidence
- operating efficiency

## 5.4 Employee Traits

Current trait examples include:

- perfectionist
- ambitious
- social
- creative
- focused
- introverted
- cautious
- loyal
- skeptical
- independent
- analytical

Traits modify utility scores.

## 5.5 Employee Goals

Current goal dimensions:

- mastery
- promotion
- social connection
- stability
- recognition

The canonical key is `socialConnection`. Old saves migrate the former `friendship` key to `socialConnection`. This goal can increase interest in social opportunities, but it does not manufacture friendship, liking, or positive relationship outcomes.

## 5.6 Employee Memories

Current memory model contains:

```js
{
  type,
  text,
  emotion,
  strength,
  subject,
  day
}
```

Current memory themes include:

- CEO cost cuts
- CEO employee support
- CEO quality protection
- accelerated schedules
- overtime
- collaboration
- helpful social interactions

Memories decay over time.

## 5.7 Social Relationships

Current social state is owned by the staged Social Personality AI. `company.socialAIModelVersion = 4` marks the consolidated ownership and migration model.

The canonical pair-level Social Personality AI stores hidden professional relationship records in `company.socialRelationships[pairKey]`:

- Stage 1: familiarity from real encounters
- Stage 2: shared experience history with tone, intensity, dedupe keys, and source events
- Stage 3: derived trust, respect, comfort, and professional friction
- Stage 4: opportunity-bound voluntary social preference
- Stage 5: multidimensional workplace reputation
- Stage 6: source-backed professional conflict and repair
- Stage 7: bounded directional memory and contextual recall
- Stage 8: grounded visible conversations, privacy, and overhearing

The organizational layer derives slow evidence-backed culture, informal groups, department and project team chemistry, bridge employees, and formal or informal leadership influence. It reports social reality without becoming a direct work-output system.

Legacy employee-local fields such as `employee.relationship` and `employee.social`, plus the old `getSocial()`, `socialScore()`, and `adjustSocial()` APIs, are migration inputs only. They are removed during save migration and do not exist as production adapters. Read-only callers use `getRelationshipView()`; source-backed social events use `recordSharedExperience()`.

Passive co-presence can increase familiarity, but it must not create shared-experience history, social memory, conflict, culture evidence, group evidence, leadership evidence, visible dialogue, or emotional effects unless a concrete source event exists.

Relationship interpretation is derived from accumulated history, recency, and personality compatibility. It must not directly write work output, project progress, hiring, Institutional Learning, or task selection.

Relationships influence:

- stress and morale reactions through the central emotional system
- debug visibility in AI Debug
- natural-language employee profile summaries
- bounded voluntary social preference
- evidence-backed People & Culture reporting
- grounded visible conversations

Relationships do not score collaborator usefulness or work outcomes. Project need, role fit, skills, focus, current morale, current stress, workload, and availability determine collaboration matching and resolution. Social AI may affect later work only through the employee's bounded current stress and morale.

## 5.8 Utility AI

Current action candidates:

- work
- lab
- break
- socialize
- collaborate
- meeting
- complain
- home

Action selection considers:

- energy
- stress
- morale
- focus
- role
- traits
- goals
- company directive
- memory bias
- cooldowns
- repetition penalties
- time of day
- coworker availability
- relationship state

Selection is weighted among top actions instead of always selecting the single highest score.

## 5.9 Action Persistence

Employees continue actions for a simulated duration.

This prevents unrealistic rapid switching.

Examples:

- work blocks
- testing blocks
- breaks
- conversations
- collaboration
- meetings
- complaints
- home/offsite state

## 5.10 Role Output

Employee work contributes to company systems.

Examples:

- Chip Architect → chip progress and quality
- Firmware Engineer → software and integration
- Technical Lead -> software, integration, and coordination
- Software QA Engineer -> quality, verification, software, and trust
- Product Manager → integration, customers, and trust
- Software Architect -> architecture, integration, and technical planning
- Industrial Designer → chip, quality, and trust
- Finance Analyst -> cash, Investor Confidence, board confidence, and operating efficiency

---

# 6. Company Simulation

## 6.1 Core Company State

The company currently tracks:

```js
{
  day,
  minute,
  cash,
  board,
  trust,
  chip,
  software,
  quality,
  integration,
  customers,
  dailyRevenue,
  valuation,
  phase,
  directive,
  directiveDays,
  selected,
  paused,
  speed,
  pendingEvent,
  eventCooldown,
  completedEvents,
  crisis,
  crisisDays,
  gameOver,
  costEfficiency,
  pilotDays,
  openRoles,
  newspapers,
  weekStartSnapshot,
  weeklyEvents,
  communications,
  communicationView,
  log
}
```

## 6.2 Product Phases

Current phases:

1. prototype
2. integration
3. customer trial
4. pilot
5. launched

Progression depends on internal metrics.

Current logic is based on thresholds for:

- chip
- software
- integration
- quality

## 6.3 Revenue

Revenue depends on:

- product phase
- customer count
- product readiness
- trust
- customer saturation

The model includes diminishing returns to reduce runaway late-game growth.

## 6.4 Operating Cost

Daily operating cost is affected by:

- base daily cost
- cost efficiency
- Finance Analyst contribution

Efficiency gains have a lower bound and diminishing returns.

## 6.5 Valuation

Valuation changes from:

- revenue
- readiness
- trust
- stress
- major milestones
- investor confidence
- board interpretation
- customer and market intelligence
- project commercial value
- valuation shocks and external sentiment

The player-facing valuation trend should read like a real finance chart, with range views such as 1D, 1W, 1M, 3M, YTD, 1Y, and All. The range control changes the comparison window and trend calculation; it must not be a cosmetic filter.

## 6.6 Board Confidence

Board confidence changes from:

- morale
- CEO decisions
- milestones
- cash pressure
- resignations
- product progress
- crisis outcomes

---

# 7. CEO Directives

Current directive examples:

- speed
- quality
- people
- cuts
- revenue

Directives:

- affect employee utility scores
- affect stress and morale
- affect work output
- last for a limited number of days
- expire automatically
- create employee memories
- appear in company communications
- may appear in the newspaper

---

# 8. CEO Communications System

The latest build includes a full CEO Communications system.

## 8.1 Purpose

The communications system presents strategic events as executive memos rather than raw popups.

This strengthens the CEO role.

## 8.2 Current UI

The CEO Communications panel contains:

- Inbox tab
- Archive tab
- message count
- archived count
- memo cards
- memo type
- priority
- sender/recipient metadata
- message body
- why the issue reached the CEO
- chain of command
- concrete evidence reviewed
- sender interpretation
- recommendations
- other viewpoints
- no-action forecast
- uncertainty
- decision options
- recorded decision result
- archive detail view
- later outcome and forecast accuracy when available

## 8.3 Current State

Company state includes:

```js
communications
communicationView
```

## 8.4 Required Behavior

- A CEO event creates a communication.
- The simulation pauses when a decision is required.
- The inbox displays the active memo.
- The player selects an option.
- The result is recorded.
- The memo moves into the archive.
- The simulation resumes.
- Archived communications survive save/load.
- Old saves without communication fields must migrate safely.
- Memos reveal what the organization believes, not perfect simulation truth.
- Ordinary employee concerns route through manager review before CEO escalation.
- Direct employee-to-CEO escalation is rare and reserved for severe or protected cases.
- Archives preserve original evidence, recommendation, uncertainty, CEO choice, later outcome, and forecast accuracy when available.

## 8.5 Communications Must Remain Simulation-Driven

Memos should be created from actual conditions such as:

- burnout
- prototype milestones
- launch readiness
- pilot review
- hiring vacancy
- cash pressure
- culture conflict
- crisis warnings
- board concerns

---

# 9. Current CEO Event Library

Current event IDs detected in the source include:

- `burnout`
- `milestone`
- `launch`
- `pilot-review`
- `hiring`
- `cash`
- `culture`

At minimum, the current logic supports:

- burnout
- milestone
- launch
- pilot-review
- hiring
- cash
- culture

Each event defines:

- trigger
- title
- copy
- repeatability
- choices
- company effects
- directive
- duration
- employee effects
- optional launch behavior
- optional hiring behavior

---

# 10. Hiring and Vacancy System

## 10.1 Vacancy Queue

Vacancies are stored as:

```js
openRoles: []
```

Multiple vacancies must not overwrite one another.

## 10.2 Hiring Responses

Current responses include:

- hire a specialist
- promote internally
- use contractors

## 10.3 Replacement Behavior

A specialist replacement should receive:

- a natural generated name
- the required role
- fresh traits
- valid goals
- valid social state
- valid relationships
- reasonable initial morale, stress, and focus

## 10.4 Promotion Behavior

Promotion should:

- select a plausible candidate
- increase morale
- increase stress
- affect achievements
- record the event

## 10.5 Contractor Behavior

Contractors should:

- provide temporary output
- not permanently replace the employee
- have limited benefits
- potentially affect quality or cost

---

# 11. Crisis and Failure System

## 11.1 Crisis Triggers

A crisis may begin if:

- cash <= 0
- board confidence <= 10
- average employee stress > 85
- trust <= 10
- active employee count < 4

## 11.2 Recovery Window

The player receives a 30-day simulated recovery window.

## 11.3 Crisis Recovery

The crisis resolves only if the company restores safe conditions.

Current recovery expectations include:

- cash > 3
- board > 20
- average stress < 75
- trust > 20
- at least 4 active employees

## 11.4 Game Over

If the deadline expires:

- simulation pauses
- gameOver becomes true
- board removes the player as CEO
- game-over overlay appears
- player may restart

---

# 12. Newspaper System

## 12.1 Purpose

The newspaper creates company history from actual events.

## 12.2 Publication Schedule

A new issue is published every five simulated workdays.

## 12.3 Content

Each issue includes:

- masthead
- week and publication day
- headline
- weekly summary
- major events
- company metrics
- people to watch
- risk desk
- current product phase

## 12.4 Inputs

The newspaper uses:

- weekly event records
- weekly start snapshot
- current snapshot
- cash change
- board change
- trust change
- customer change
- morale change
- stress change
- phase change
- major employee events
- CEO decisions
- launches
- hires
- resignations
- milestones

## 12.5 Archive

- Issues are stored in `newspapers`.
- Archive is capped.
- Issues survive save/load.
- New saves begin with an empty archive.

---

# 13. Save and Migration System

## 13.1 Current Save Version

Current save version:

`38`

## 13.2 Storage

Current saves use browser `localStorage`.

## 13.3 Save Contents

The save includes:

- save version
- timestamp
- company state
- employee state

Current saves include deterministic runtime fields such as `randomState` and `nextRuntimeId`, plus player preferences such as `soundMode`.

## 13.4 Migration Requirements

Older saves may lack:

- openRoles
- newspapers
- weeklyEvents
- weekStartSnapshot
- communications
- communicationView
- social
- goals
- memories
- cooldowns
- decisionTrace
- costEfficiency
- pilotDays

All missing fields must be restored with safe defaults.

## 13.5 Timer Safety

Loading, resetting, or continuing must never create multiple simulation timers.

There must be exactly one active interval.

---

# 14. Startup and Reset Flow

## 14.1 Startup Screen

The startup screen offers:

- Continue Company
- Start New Company

It shows a summary of saved state.

## 14.2 New Company

A new company may randomize:

- market climate
- cash
- board confidence
- trust
- valuation
- traits
- starting energy
- starting morale
- starting focus
- relationships

## 14.3 Reset Confirmation

Restarting requires confirmation.

The player must be warned that the saved company will be replaced.

---

# 15. Desktop and Mobile Design

## 15.1 Desktop

Desktop layout includes:

- office
- CEO communications
- employee list
- company systems
- story log
- newspaper

## 15.2 Mobile

Mobile uses tabs:

- Office
- Employees
- CEO Inbox
- Company
- Paper

## 15.3 Mobile Requirements

- tabs must scroll horizontally when needed
- one section should be active at a time
- office must remain usable
- modals must fit viewport height
- text must not overflow
- buttons must remain touch-friendly
- top metrics must remain readable
- thought bubbles may be hidden on very small screens
- communications archive must remain usable
- newspaper columns must stack

---

# 16. Current Function Map

Functions detected in the latest source include:

- `makeEmployee()`
- `reset()`
- `saveGame()`
- `loadGame()`
- `hasSavedCompany()`
- `savedCompanySummary()`
- `updateStartupScreen()`
- `enterSimulation()`
- `startNewCompany()`
- `requestReset()`
- `getRelationshipView()`
- `recordSharedExperience()`
- `recordFamiliarityObservation()`
- `assertWorkAIInputsDoNotContainSocialState()`
- `addMemory()`
- `memoryBias()`
- `decayMemories()`
- `tickCooldowns()`
- `weightedChoice()`
- `availableCollaborator()`
- `captureWeekSnapshot()`
- `recordWeeklyEvent()`
- `signed()`
- `chooseHeadline()`
- `publishWeeklyNewspaper()`
- `renderNewspapers()`
- `buildOffice()`
- `rand()`
- `clamp()`
- `moveToZone()`
- `socialTarget()`
- `utility()`
- `chooseAction()`
- `roleThought()`
- `roleOutput()`
- `simulateMinute()`
- `clampCompany()`
- `maybePhaseAdvance()`
- `dailyClose()`
- `maybeEmergentEvent()`
- `currentFailureReason()`
- `crisisRecovered()`
- `startCrisis()`
- `evaluateFailure()`
- `advanceCrisisDay()`
- `eventCommunication()`
- `archiveCommunication()`
- `renderCommunicationArchive()`
- `showArchivedMemo()`
- `setCommunicationView()`
- `renderDecisionEvent()`
- `maybeCreateDecisionEvent()`
- `applyDecision()`
- `generateHireName()`
- `resolveHiring()`
- `avgStress()`
- `lowestMorale()`
- `averageRelationship()`
- `lowestRelationship()`
- `showEmployee()`
- `render()`
- `switchMobileTab()`
- `restartTimer()`

Codex should not assume this list is perfectly complete if the source changes later. The HTML file remains authoritative.

---

# 17. Non-Negotiable Invariants

Codex must preserve these unless explicitly instructed otherwise:

1. The player remains the CEO.
2. Employees remain autonomous.
3. The office runs without direct micromanagement.
4. CEO emails and memos wait in the Inbox until the player opens them.
5. Opening or deciding a memo must not create duplicate timers or lose the archived choice.
6. Only one timer exists.
7. Game over stops simulation updates.
8. Save/load remains compatible.
9. Older saves migrate safely.
10. Mobile tabs remain functional.
11. Desktop layout remains functional.
12. Communications survive save/load.
13. Newspaper issues are generated from actual simulation events.
14. Employee AI remains explainable.
15. The project remains runnable as a standalone offline folder with `Office_Aquarium.html` loading local assets and the ordered scripts under `src/`.
16. No external dependency is added without approval.
17. Business logic remains rule-based and offline-first.
18. New fields always receive migration defaults.
19. New events must be tied to real state.
20. Working systems should be patched, not rewritten unnecessarily.

---

# 18. Known Technical and Design Risks

## 18.1 Large Runtime Complexity

The project is large and now split between HTML and JavaScript.

Risk:

- accidental duplicate functions
- stale variable references
- difficult code navigation
- migration mistakes
- unintended coupling

Mitigation:

- keep `Office_Aquarium.html` focused on markup and CSS
- keep simulation and UI behavior organized under `src/core`, `src/systems`, `src/ui`, `src/services`, `src/facades`, and `src/bootstrap`
- add section comments
- use focused patches
- validate syntax after every change
- avoid large rewrites

## 18.2 AI Balance

Utility scores may produce:

- repetitive behavior
- role drift
- excessive collaboration
- excessive complaining
- overwork loops
- overly stable behavior

Mitigation:

- use debug mode
- log score distributions
- test seeded scenarios
- preserve cooldowns and repetition penalties

## 18.3 Event Frequency

CEO events may occur:

- too often
- too rarely
- repeatedly
- during bad timing

Mitigation:

- use event cooldown
- preserve repeatability flags
- use completedEvents
- add event priority later

## 18.4 Communications Archive Growth

Archive size should remain bounded.

## 18.5 Newspaper Repetition

Rule-based headlines may repeat.

Improve templates before adding external generation.

## 18.6 Long-Run Economy

Late-game revenue and customer growth require balance testing.

## 18.7 Employee Replacement

Replacement employees must initialize every AI field correctly.

---

# 19. Historical Development Roadmap

Phases 1 through 7 below are implemented history, not outstanding work. They are retained to explain how the current architecture evolved. Phase 8 remains optional and is not required for the offline release.

## Phase 1 — Stabilize Current Build

Priority:

- syntax validation
- duplicate timer checks
- save migration tests
- communication archive tests
- newspaper tests
- mobile tab tests
- crisis recovery tests

## Phase 2 — AI Debugging and Observability

Add:

- AI Debug button
- live utility scores
- cooldown display
- active memory bias
- current goal weights
- collaborator candidate
- last action
- repetition penalty
- chosen action explanation

Debug mode must not alter gameplay.

## Phase 3 — Role-Specific AI Improvements

Improve role behavior without introducing task micromanagement.

Examples:

- Finance Analyst should rarely use the lab.
- Product Manager should prefer meetings and customer/revenue work.
- Software QA Engineer should prefer testing and collaboration.
- Chip Architect should prefer lab work.
- Technical Lead should prefer integration and collaboration.
- Software QA Engineer should prefer testing and quality.

## Phase 4 — Employee Opinion of CEO

Add:

```js
opinionOfCEO = {
  trust,
  fairness,
  competence,
  support,
  fear
}
```

Update it through:

- cost cuts
- quality protection
- employee investment
- rushed schedules
- successful launches
- failed launches
- crises
- hiring decisions

Use it in:

- resignation risk
- morale
- collaboration willingness
- complaint behavior
- memory interpretation

## Phase 5 — Lightweight Teams

Add:

- hardware team
- software team
- product team
- finance team

Track:

- cohesion
- pressure
- output
- conflict

Do not add full management hierarchy yet.

## Phase 6 — Company Culture

Potential dimensions:

- innovation
- work-life balance
- communication
- risk tolerance
- trust
- politics
- quality discipline

Culture should emerge from repeated CEO decisions and employee outcomes.

## Phase 7 — Competitors and Market

Future optional system:

- fictional competitors
- market demand
- hiring pressure
- product competition
- salary pressure
- customer switching

This should be added only after the internal company simulation is stable.

## Phase 8 — Optional Real-World Industry Intelligence

Long-term optional feature:

- use web data about the semiconductor industry
- convert external information into bounded market signals
- never let raw web text directly control simulation state
- preserve offline mode
- support snapshot mode for reproducibility

This is not part of the current required build.

---

# 20. Testing Plan

## 20.1 Simulation Loop

Test:

- timer starts once
- pause stops updates
- resume continues updates
- speed changes update rate
- gameOver stops updates
- restart clears old timer
- unavailable audio does not stop the simulation loop

## 20.2 Employee AI

Test:

- employee chooses only valid actions
- weighted selection returns a valid action
- low energy raises break score
- high stress raises break and complain scores
- cooldowns reduce repeated actions
- institutional behavior validation confirms that learned help-seeking, recovery, and testing lessons affect the expected action utilities
- repetition penalty applies
- collaboration requires an available employee
- memories affect utility
- role modifiers affect scores
- home action becomes available late in the day

## 20.3 Social Model

Test:

- canonical social records initialize without fabricated relationships
- read-only relationship views are deterministic and do not consume RNG
- passive co-presence increases familiarity only
- concrete shared experiences can affect stress and morale through the emotional system
- work AI does not receive direct social, friendship, rivalry, trust, respect, comfort, or friction bonuses
- save/load preserves canonical social records
- hidden social values do not leak into normal CEO UI
- migrated passive room overlap does not become relationship evidence
- Social AI recommendations and Emotional System state writes retain separate owner traces
- AI Debug, health, valuation, and briefing reads do not advance simulation RNG
- social preferences use only opportunities that already exist
- workplace reputation remains multidimensional, evidence-based, and hidden
- emotional baselines, homeostasis, and anti-saturation keep stress and morale non-monotonic
- source-backed conflict and repair preserve attribution and relationship history
- social memory remains bounded, deterministic, contextual, and linked to source events
- visible conversations remain grounded, privacy-aware, and free of unresolved placeholders
- culture drifts slowly from evidence and stays bounded
- informal groups derive from meaningful interaction rather than passive proximity
- project and department team chemistry derive all documented dimensions
- formal authority, earned credibility, and informal leadership remain distinct
- UI reads do not recalculate or mutate authoritative culture, group, chemistry, or leadership state
- 90-, 180-, and 365-day social runs remain deterministic and within configured caps

## 20.4 Company Systems

Test:

- company metrics clamp
- product phases progress correctly
- revenue never becomes NaN
- customers never become negative
- valuation never becomes negative
- cost efficiency stays within bounds
- launch/pilot behavior works
- directive expiration works
- all named daily stages execute once in canonical order
- same-day valuation and investor updates are idempotent
- Board reads do not create duplicate Investor Relations forecasts

## 20.5 Communications

Test:

- triggered event creates memo
- inbox count updates
- decision options render
- selected decision applies correct effects
- memo includes chain of command, concrete evidence, interpretation, no-action forecast, and uncertainty
- ordinary employee reports do not bypass management
- protected or severe reports can bypass management
- archived memos retain original advice and later outcome
- result is archived
- archive survives save/load
- unread messages remain in the Inbox until opened
- opening, archiving, deleting, and revisiting old messages preserves the chosen decision
- decisions do not create duplicate timers or stale pending events
- informational follow-ups are clearly marked when no CEO reply is required

## 20.6 Newspaper

Test:

- issue publishes every 5 days
- issue uses actual events
- issue includes correct metrics
- archive persists
- archive remains capped
- old save with no newspaper data loads

## 20.7 Hiring

Test:

- multiple vacancies queue
- specialist creates valid replacement
- promotion applies correct effects
- contractor applies temporary output
- vacancy is removed after resolution
- replacement has all AI fields

## 20.8 Crisis

Test:

- each crisis trigger
- crisis countdown
- crisis recovery
- deadline warnings
- game over after deadline
- restart after game over

## 20.9 Save Migration

Test saves missing:

- AI fields
- social fields
- goals
- memories
- cooldowns
- decisionTrace
- openRoles
- newspapers
- weeklyEvents
- communications
- communicationView
- pilotDays
- costEfficiency

## 20.10 Mobile

Test:

- every tab
- communication inbox
- archive detail
- employee modal
- newspaper
- startup overlay
- reset overlay
- game-over overlay
- office interaction
- horizontal tab scrolling

---

# 21. Suggested Code Organization

Keep `Office_Aquarium.html` as the main launch file and the ordered `src/` scripts as the simulation/runtime source.

The runtime is now in an incremental OOP/service-layer refactor. System files expose small class interfaces while preserving the existing rule-based simulation logic.

- `src/services/runtime-services.js`
  - `SaveRepository` for save/load/localStorage boundaries
  - `SoundController` for music, message alerts, and fail-soft audio handling
  - `SimulationTimer` for the main timer loop
  - `ValidationSession` for temporary seeded validation runs that must restore the live company safely
- `src/systems/project-portfolio.js` exposes `ProjectPortfolioSystem`
- `src/systems/customer-market.js` exposes `CustomerMarketSystem`
- `src/systems/operating-health-simulation.js` exposes `SimulationRuntimeSystem`
- `src/systems/workforce-leadership.js` exposes `WorkforceSystem`
- `src/systems/institutional-company-intelligence.js` exposes `InstitutionalLearningSystem` and `CompanyIntelligenceSystem`
- `src/systems/market-valuation.js` exposes `MarketValuationSystem`
- `src/ui/rendering-validation.js` exposes `UserInterfaceSystem` and `ValidationToolsSystem`
- `src/facades/simulation-systems.js` composes these classes into `officeSystems`

Future refactors should continue this pattern by moving cohesive systems into classes without changing gameplay behavior in the same step.

Add clear section comments:

```js
// ============================================================
// DATA AND CONSTANTS
// ============================================================

// ============================================================
// SAVE AND MIGRATION
// ============================================================

// ============================================================
// EMPLOYEE AI
// ============================================================

// ============================================================
// COMPANY SIMULATION
// ============================================================

// ============================================================
// CEO COMMUNICATIONS
// ============================================================

// ============================================================
// NEWSPAPER
// ============================================================

// ============================================================
// CRISIS AND FAILURE
// ============================================================

// ============================================================
// UI AND RENDERING
// ============================================================

// ============================================================
// INPUT AND TIMER
// ============================================================
```

Only split into modules after stability is proven.

Possible future structure:

```text
index.html
styles.css
src/
  state.js
  save.js
  employees.js
  ai.js
  company.js
  events.js
  communications.js
  newspaper.js
  crisis.js
  ui.js
  input.js
tests/
```

Do not introduce a framework unless justified.

---

# 22. Codex Working Rules

When Codex modifies the project:

1. Read the full HTML file before changing it.
2. Treat `Office_Aquarium.html` as source of truth.
3. Make one focused change at a time.
4. Run JavaScript syntax validation after every patch.
5. Check for duplicate function names.
6. Check for stale references after renames.
7. Preserve save migration.
8. Add defaults for every new field.
9. Preserve mobile tabs.
10. Preserve communications.
11. Preserve newspaper generation.
12. Preserve the timer guard.
13. Preserve CEO-only control.
14. Preserve autonomous employees.
15. Do not rewrite working systems unless required.
16. Do not add external dependencies without approval.
17. Keep logic deterministic enough to debug.
18. Document any new state fields.
19. Update SAVE_VERSION when save schema changes.
20. Add acceptance criteria for every task.

---

# 23. Immediate Recommended Codex Task

## Task

Add a developer-only AI Debug mode to `Office_Aquarium.html`.

## Requirements

- hidden by default
- toggle button visible in a small developer area
- no gameplay balance changes
- clicking an employee shows:
  - current utility scores
  - cooldowns
  - top goals
  - strongest current memory bias
  - current collaborator candidate
  - repetition penalty
  - selected action
  - action duration
  - current social summary
- mobile compatible
- old saves still load
- no duplicate timers
- communications still work
- newspaper still works
- syntax check passes

## Acceptance Criteria

- debug mode off by default
- employee AI is unchanged when debug mode is off
- debug values update live
- debug UI does not break mobile
- no new external dependency
- save schema remains unchanged unless necessary
- if schema changes, bump SAVE_VERSION and add migration

---

# 24. Definition of Done for Future Work

A change is complete only when:

- it matches the CEO-centered design
- employee autonomy remains intact
- simulation state remains valid
- save migration is handled
- mobile layout still works
- JavaScript syntax passes
- no duplicate timers exist
- no stale references remain
- no working system is accidentally removed
- acceptance criteria are met
- the source-of-truth HTML and this document are updated if scope changes
- shared timings, thresholds, statuses, weights, and labels use `src/core/constants.js`
- new or changed behavior has a true pass/fail regression test

---

# 25. Source of Truth

Use:

`Office_Aquarium.html`

and the ordered source tree under `src/`, with shared rules in `src/core/constants.js`.

Do not use earlier standalone builds or the historical `misc/` archive unless explicitly researching migration history.

This Markdown document should be updated whenever:

- the save schema changes
- a new major system is added
- the player role changes
- the AI architecture changes
- the communication system changes
- the newspaper system changes
- the runtime architecture changes
- mobile navigation changes
- the failure model changes


























