# Social Personality AI Stage 1: Familiarity

Stage 1 records who employees have actually encountered. It does not decide who they like, and it does not improve or damage projects.

This stage depends on the boundary described in `docs/architecture/employee_ai_boundaries.md`.

## Purpose

Employees gradually become professionally familiar with coworkers through real simulation events:

- working in the same room for meaningful time
- sharing the break area
- participating in collaboration or help events
- being present around meetings and shared activity

Familiarity is not trust, friendship, rivalry, or team performance. It only means the employees recognize and know one another professionally.

## Data

Pair records are stored in `company.socialRelationships` with a canonical key:

```js
makeRelationshipKey(employeeAId, employeeBId)
```

The key is order-independent, so `0:3` and `3:0` refer to the same relationship.

Records include:

- employee pair ids
- familiarity from 0 to 100
- interaction count
- first and last interaction timestamps
- recent interaction types
- cooldowns
- accumulated stress and morale trace history

First meetings are also recorded in `company.socialMemories` as hidden `first_met` memories.

## Boundaries

The familiarity system may update only:

- pair familiarity
- pair interaction count
- pair last interaction time
- small stress deltas
- small morale deltas
- debug trace records

It must not directly update:

- project progress
- project quality
- productivity
- skill
- task selection
- Institutional Learning
- hiring
- staffing
- company risk
- customer outcomes
- room assignment logic
- employee movement logic

The system observes movement and work. It does not replace them.

## Emotional Output

Encounter reactions use the same stress/morale-only contract as the personality system:

```js
{
  stressDelta: 0,
  moraleDelta: 0,
  reasonCode: "",
  sourceEventId: null,
  relatedEmployeeIds: []
}
```

The central emotional system applies clamping, daily caps, cooldowns, and trace history.

## UI

Normal employee profiles show only a short natural-language coworker familiarity summary.

Raw pair familiarity, interaction counts, cooldowns, source IDs, and stress/morale traces are visible only in AI Debug.

## Regression Coverage

The browser regression test `tests/social-ai-familiarity-test.js` verifies:

- canonical pair keys
- first encounter creation
- no fabricated relationship records
- same-room and break familiarity progression
- cooldown behavior
- bounded familiarity
- save/load preservation
- deleted employee lookup safety
- normal UI hiding raw pair data
- AI Debug exposing trace data
- no direct mutation of project state, hiring, learning, or work output
