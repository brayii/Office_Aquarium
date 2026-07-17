# Employee AI Boundaries

Office Aquarium separates employee work behavior from employee social and emotional behavior.

This boundary exists so future changes do not accidentally let personality, relationships, or employee drama directly change project output.

## Architecture

```text
                         Employee
                            |
          +-----------------+-----------------+
          |                                   |
          v                                   v
  Work / Institutional AI              Social Personality AI
          |                                   |
          |                                   |
  Uses:                                  Uses:
  - Institutional Learning              - Personality
  - Project rules                       - Relationships
  - Skills                              - Social memories
  - Existing task logic                 - Hidden emotional state
          |                                   |
          v                                   v
  Chooses and performs work             Produces recommendations only:
                                         - stress delta
                                         - morale delta
```

## Work / Institutional AI

The work side is responsible for:

- selecting work
- performing work
- applying Institutional Learning
- satisfying project requirements
- resolving blockers
- participating in existing work meetings
- making existing project decisions

Its output is work-related simulation behavior.

## Social Personality AI

The social side is responsible for:

- getting to know coworkers
- tracking familiarity
- deriving trust, respect, comfort, and professional friction from history
- remembering shared social experiences
- reacting emotionally to events
- recommending stress changes
- recommending morale changes

Its only direct output shape is:

```js
{
  stressDelta: 0,
  moraleDelta: 0,
  reasonCode: "",
  sourceEventId: null,
  relatedEmployeeIds: []
}
```

Social Personality AI must not directly modify:

- project progress
- project quality
- task completion
- employee skill
- Institutional Learning
- hiring
- staffing
- customer outcomes
- company risk
- productivity
- role requirements
- project requirements

## Required Flow

```text
Personality
+ relationship
+ recent interaction
+ room context
+ workload context
-> Social Personality AI
-> stress/morale recommendation
-> central emotional state system
-> bounded stress and morale update
-> existing Work AI reacts normally
```

Never use:

```text
Personality -> direct work bonus
Relationship -> direct project penalty
Social AI -> task selection override
```

## Central Application Rule

The Social Personality AI recommends changes. It does not own the final employee state write.

The central emotional system is responsible for:

- clamping stress and morale
- applying cooldowns
- applying daily caps
- recording reason codes
- writing debug history
- preventing duplicate event application

## Institutional Learning Boundary

Institutional Learning remains authoritative for how employees perform work.

The Social Personality AI does not teach employees how to work. It may only change how employees emotionally experience work.

Institutional Learning may later observe team-level patterns, but it must not read hidden relationship values as objective truth or directly manipulate relationships.

## Hidden State

Social and emotional state such as familiarity, trust, respect, comfort, professional friction, interaction count, shared-experience history, social battery, frustration, belonging, recognition satisfaction, psychological safety, recovery debt, conflict fatigue, need for quiet focus, and need for social interaction must stay hidden from normal CEO-facing UI.

These values may appear in AI Debug.

## Canonical Social State

`company.socialAIModelVersion` identifies the current Social AI schema. Version 2 uses `company.socialRelationships`, `company.socialMemories`, and Social AI traces as the canonical source of relationship history.

Legacy employee-local maps such as `employee.relationship`, `employee.social`, `getSocial()`, `socialScore()`, and `adjustSocial()` are compatibility adapters only. New code should not add direct trust, friendship, rivalry, respect, comfort, or friction values to an employee object. If a feature needs social context, it should record or read a Social AI encounter instead.

Passive co-presence, such as sharing a room, meeting room, or break area, may build familiarity. It must not create emotional events or shared-experience history unless a concrete source event exists.

System ownership is defined in `OFFICE_AQUARIUM_CONSTANTS.aiOwners`:

- Work AI owns work choices and work outcomes.
- Social AI owns familiarity, relationship interpretation, social preferences, and social traces.
- The emotional system owns final bounded stress and morale writes.
- Institutional Learning observes outcomes after they occur.

## Regression Guardrails

Any future change touching employee AI should verify:

- Work AI output remains unchanged unless explicitly requested.
- Institutional Learning remains unchanged unless explicitly requested.
- Social AI output is limited to stress and morale recommendations.
- Social AI cannot directly alter work state.
- Save/load preserves personality and relationship state.
- Hidden social values do not leak into normal CEO-facing UI.
- Every stress or morale change has a traceable source.
- Duplicate events cannot stack repeatedly.
- Stress and morale remain bounded.

Dedicated regression coverage for this boundary lives in `tests/personality-foundation-test.js`, `tests/social-ai-familiarity-test.js`, `tests/social-ai-shared-experiences-test.js`, and `tests/social-ai-relationship-interpretation-test.js`.

Additional boundary coverage lives in `tests/social-ai-boundary-regression-test.js` and `tests/social-emotional-long-run-test.js`.
