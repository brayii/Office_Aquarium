# Social Personality AI Stage 4: Social Preferences

Stage 4 chooses among social opportunities that already exist. It does not move employees, invent encounters, or override work.

This stage depends on:

- `docs/architecture/employee_ai_boundaries.md`
- `docs/specs/social_ai_stage_1_familiarity.md`
- `docs/specs/social_ai_stage_2_shared_experiences.md`
- `docs/specs/social_ai_stage_3_relationship_interpretation.md`

## Purpose

Given a real opportunity, an employee may prefer a familiar coworker, a less familiar coworker, or time alone. The result is probabilistic rather than a permanent friendship pair.

## Inputs

Preference weights may use:

- familiarity
- trust, respect, comfort, and professional friction
- recent source-backed interactions
- personality
- current stress and morale
- social battery
- the type of opportunity

## Valid Opportunities

The candidate set must come from the current simulation context, such as:

- coworkers already in the break area
- participants in a real meeting
- a real project discussion
- a mentoring or help opportunity

Employees in another room are not candidates unless the existing movement or work system has already created that opportunity.

## Boundary

Social preference may influence only:

- voluntary interaction selection
- small stress recommendations
- small morale recommendations
- Social AI trace data

It must not directly change movement, room destinations, tasks, projects, productivity, staffing, hiring, customers, or Institutional Learning.

## Diversity

Weighted selection must preserve variation. Employees can meet someone new, spend time alone, or return to familiar coworkers. No rule should force permanent pairs, cliques, or universal sociability.

## UI

Normal play shows only natural behavior and resulting current stress or morale. Candidate weights and reason codes are developer diagnostics.

## Regression Coverage

`tests/social-ai-social-preferences-test.js` verifies:

- only existing opportunities are evaluated
- spending time alone remains possible
- personality and relationship history affect weights
- selection does not move employees or alter work
- emotional output remains small and bounded
- normal UI hides internal scores

