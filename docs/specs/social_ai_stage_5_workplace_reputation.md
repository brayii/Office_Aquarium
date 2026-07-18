# Social Personality AI Stage 5: Workplace Reputation

Stage 5 derives how coworkers expect someone to behave from repeated source-backed observations. Reputation is not popularity and is not an employee performance bonus.

## Dimensions

The hidden model keeps separate dimensions:

- technical reputation
- reliability
- approachability
- professionalism

Unknown is a valid state. A new employee does not begin with a bad reputation merely because coworkers lack evidence.

## Evidence

Reputation changes only from repeated concrete events such as help, shared work, blocker resolution, missed commitments, interruptions, or observed conflict. One bad day may create an observation but must not permanently rewrite the dimensions.

Positive and negative reputations are both valid. An employee may be technically respected but difficult to approach, or approachable but not yet known for technical work.

## Boundary

Reputation may influence:

- expectations before an interaction
- voluntary social preference weights
- small stress or morale recommendations

It must not directly change movement, task selection, project output, productivity, hiring, staffing, customers, or Institutional Learning.

## UI

Raw dimensions, evidence, recent changes, and confidence stay out of normal CEO-facing UI. They are available only to developer diagnostics.

## Regression Coverage

`tests/social-ai-workplace-reputation-test.js` verifies:

- new hires can remain unknown
- one negative event does not immediately damage dimensions
- repeated positive and negative evidence can diverge
- dimensions do not collapse into one popularity score
- reputation affects only social/emotional interpretation
- work, movement, hiring, projects, and learning remain unchanged

