# Social Systems: Culture, Groups, Chemistry, and Leadership

Save version 39 / Social AI model 4 completes the evidence-backed organizational layer built above Stages 1-8.

## Culture

Culture is a slow-moving interpretation of repeated company evidence across collaboration, competitiveness, formality, psychological safety, learning orientation, recognition fairness, conflict tolerance, risk tolerance, social warmth, accountability, adaptability, and inclusiveness.

Culture records evidence, confidence, recency, source type, and affected participants. Employees adapt gradually according to exposure; new hires do not instantly inherit perfect cultural knowledge. Culture may subtly affect reporting, social interpretation, and emotional response, but cannot directly change work output.

## Informal Groups

Informal groups are derived from repeated meaningful relationship evidence, not passive proximity. Groups retain type, members, cohesion, stability, conflict, knowledge flow, confidence, evidence sources, formation time, last confirmation, and lifecycle history.

Groups can form, strengthen, weaken, merge, split, and dissolve. Membership has only a subtle bounded effect on voluntary social preference.

## Team Chemistry and Bridges

Department and project chemistry derive coordination, trust, communication, resilience, conflict load, knowledge coverage, and leadership clarity from the current relationship graph. Bridge employees are people with evidence-backed connections across groups or departments.

These values report organizational conditions. They are not direct work bonuses or penalties.

## Leadership

Formal authority, earned credibility, consistency, coaching reputation, recognition fairness, conflict handling, communication clarity, confidence, and informal influence remain separate. A non-manager can become an informal leader. A manager can possess authority without credibility.

Leadership evidence comes from actual mentoring, feedback, recognition, conflict handling, and company decisions. Listener trust and culture can change how strongly a leadership event feels, but the Emotional System still owns the final bounded stress and morale write.

## Player UI

The Reports workspace includes a People & Culture panel with Culture, Groups, Network, and Leadership views. It shows evidence-backed summaries and confidence without exposing raw hidden pair scores. Employee profiles show compact professional relationship, culture, group, influence, and memory summaries.

## Ownership and Testing

Shared thresholds and limits live in `src/core/constants.js`. `src/systems/social-organizational.js` owns source events, memory, conflict, repair, conversations, culture evidence, derived groups, chemistry, bridges, and leadership evidence.

`tests/social-organizational-systems-test.js` verifies bounded drift, meaningful group formation, passive-presence rejection, merge/split/weakening, project chemistry, formal and informal leadership, trust-filtered influence, UI read safety, and Work AI isolation.

`tests/social-organizational-long-run-test.js` runs deterministic 90-, 180-, and 365-day scenarios and verifies bounds, repair, diversity, source retention, save safety, and no direct work coupling.

## Persistence Bounds

Social source events, directional memories, visible-conversation history, overheard knowledge, conflict records, leadership evidence, culture evidence, and short-term relationship windows all have shared caps. Mature organizations retain aggregate relationship history while detailed short-term evidence is reserved for the most relevant current pairs and unresolved conflicts.

The save repository writes an offline compact envelope using the append-only key dictionary in `OFFICE_AQUARIUM_CONSTANTS.storage`. It reads both compact saves and older plain JSON saves. Transient developer diagnostics are rebuilt after load instead of consuming browser storage.
