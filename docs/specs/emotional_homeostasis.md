# Emotional Homeostasis and Personal Baselines

Stress and morale are temporary human states, not experience bars. Each employee has deterministic, saved personal baselines and recovery rates.

## Personal Profile

An employee emotional profile contains:

```js
{
  moraleBaseline,
  stressBaseline,
  moraleRecoveryRate,
  stressRecoveryRate
}
```

Profiles are generated from the employee seed, not from the employee's role. Migration preserves current stress and morale while assigning deterministic missing profile values.

## Homeostasis

At controlled simulation-time intervals, current morale and stress drift gradually toward the employee's own baselines:

- morale above baseline drifts down
- morale below baseline drifts up
- stress above baseline drifts down
- stress below baseline drifts up

Stress is not forced toward zero. Morale and stress remain independent, so a demanding success may raise both.

## Anti-Saturation

Ordinary event effects weaken near 0 and 100. Minor positive events should not pin morale at 100, and ordinary recovery should not pin stress at zero. Exceptional events may create temporary peaks.

## Ownership

All emotional events and homeostatic drift go through the central emotional system. Social AI recommends changes; it does not write employee stress or morale directly.

The emotional system owns:

- bounds and soft caps
- daily limits
- deduplication and cooldowns
- requested versus applied deltas
- source and reason traces

## UI

Normal play shows current stress and morale. Baselines, recovery rates, cap decisions, and detailed traces are developer diagnostics.

## Regression Coverage

`tests/emotional-homeostasis-test.js` and `tests/social-ai-emotional-integration-test.js` verify:

- positive, negative, recovery, pressure, and mixed events
- drift in both directions toward personal baselines
- deterministic profiles and save/load preservation
- reduced effects near bounds
- non-monotonic long-run emotional behavior
- source-backed social effects reaching canonical employee state
- no direct work, project, movement, hiring, or Institutional Learning changes

