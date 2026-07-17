# Social Personality AI Stage 2: Shared Experiences

Stage 2 records what employees have experienced together. It does not decide what the relationship means.

This stage depends on:

- `docs/architecture/employee_ai_boundaries.md`
- `docs/specs/social_ai_stage_1_familiarity.md`

## Purpose

Employee pairs now accumulate shared history from real simulation events:

- shared work activity
- shared meetings
- shared breaks
- direct help
- blocker resolution
- deadline pressure
- milestone success or failure
- shared recognition
- interruptions, conflict observation, crisis response, onboarding, and mentoring

This is only history. It is not trust, friendship, rivalry, preference, avoidance, loyalty, or a work bonus.

## Controlled Types

Shared experiences use stable identifiers from `SOCIAL_EXPERIENCE_TYPES`.

Do not add free-form type strings throughout the codebase. Add a new stable identifier to the registry when a new real event source needs to be represented.

## Pair Records

Stage 2 extends `company.socialRelationships[pairKey]` with:

- positive, neutral, and negative experience counts
- bounded `recentExperiences`
- long-term `experienceSummary`
- per-experience tone
- per-experience intensity from 1 to 5
- source event IDs
- deduplication keys
- per-employee stress/morale reaction traces

Detailed history is limited to 20 recent experiences per pair. Aggregates remain in `experienceSummary`.

## Boundaries

This system may update only:

- pair shared-experience history
- aggregate experience counts
- recent memory summaries
- small stress deltas
- small morale deltas
- AI Debug trace records

It must not directly update:

- project progress
- project quality
- task completion
- productivity
- employee skill
- Institutional Learning
- hiring
- staffing
- customer outcomes
- company risk
- movement
- room assignment
- task selection

The system observes existing simulation events. It does not create work events.

## Tone and Intensity

Tone is one of:

- positive
- neutral
- negative
- mixed

Intensity is bounded from 1 to 5. Ordinary events should normally be 1 or 2. Major blocker or milestone events may be 3 or higher only when a real simulation event justifies it.

## Deduplication

Every experience uses a stable dedupe key:

```text
sourceEventId:experienceType:pairKey
```

This prevents one meeting, blocker, break, or reload from creating duplicate history.

## UI

Normal UI may show a natural-language summary such as recent shared work.

Raw counts, source IDs, pair keys, reaction deltas, and dedupe keys are AI Debug only.

## Regression Coverage

The browser regression test `tests/social-ai-shared-experiences-test.js` verifies:

- controlled experience type handling
- valid work and break experience recording
- direct help requiring a real source event
- dedupe behavior
- tone and intensity bounds
- bounded recent history with preserved summaries
- save/load preservation
- old-save migration without RNG changes
- no work, project, hiring, customer, movement, or Institutional Learning mutation
- Stage 1 familiarity still functions
