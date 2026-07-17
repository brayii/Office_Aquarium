# Social Personality AI Stage 3: Relationship Interpretation

Stage 3 interprets accumulated social history into hidden professional relationship values.

This stage depends on:

- `docs/architecture/employee_ai_boundaries.md`
- `docs/specs/social_ai_stage_1_familiarity.md`
- `docs/specs/social_ai_stage_2_shared_experiences.md`

## Purpose

Employee pairs now derive four hidden relationship values from familiarity, shared experiences, recency, and personality compatibility:

- trust
- respect
- comfort
- professional friction

These values are derived from history. They are not directly assigned by events, CEO choices, or scripts.

## Boundary

Relationship interpretation may only influence future stress and morale recommendations.

It must not directly update:

- project progress
- project quality
- work-item progress
- task selection
- productivity
- employee skills
- Institutional Learning
- hiring
- staffing
- customers
- company risk
- movement
- room assignment

## Valid Relationship Shapes

The system does not optimize toward friendship or conflict. All of these are valid:

- high trust and high friction
- high respect and low comfort
- low trust and low friction
- high comfort and low respect

Professional friction means the pair may find collaboration harder. It is not hostility.

## Personality Influence

Personality affects interpretation, not work output. For example, repeated deadline pressure between employees with very different pace, detail, and structure preferences may increase professional friction faster than the same history between compatible coworkers.

## Emotional Output

Relationship interpretation returns only:

```js
{
  stressDelta: 0,
  moraleDelta: 0,
  reasonCode: ""
}
```

The central emotional system applies bounded deltas. Relationship values do not directly change company, project, work, or learning state.

## UI

Normal CEO-facing UI does not expose raw relationship values.

AI Debug may show:

- trust, respect, comfort, and professional friction
- inputs used for the derivation
- last evaluation time
- recent contributing shared experiences

## Regression Coverage

The browser regression test `tests/social-ai-relationship-interpretation-test.js` verifies:

- hidden values are derived from accumulated history
- values remain bounded from 0 to 100
- different histories and personalities produce different interpretations
- deterministic derivation for the same history and personalities
- no forced convergence toward friendship
- relationship output is stress/morale only
- no work, project, hiring, customer, movement, or Institutional Learning mutation
- normal UI hides raw relationship values
- AI Debug exposes trace data
