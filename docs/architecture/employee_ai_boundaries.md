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
  - Existing task logic                 - Conflict, culture, and groups
                                        - Leadership evidence
                                        - Hidden emotional state
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
- encoding and recalling bounded social memories
- recording source-backed conflict and repair
- producing grounded visible conversations
- deriving culture, informal groups, team chemistry, bridges, and leadership influence
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

Company-wide Institutional Lessons and the typed project/workforce lesson stores are outcome-gated. An event, choice, message, policy approval, countdown, recruiting start, coaching start, or project action may create evidence or a learning episode, but it cannot immediately change behavior. Influence requires an attributable medium- or long-term review with a stable episode ID and independence group. Repeated reviews of the same episode do not count as independent evidence.

Examples of accepted outcome producers include a completed project, completed onboarding, a reviewed delayed project consequence, and successful PIP completion. Merely approving the underlying action is evidence only.

## Hidden State

Raw social and emotional state such as familiarity, trust, respect, comfort, professional friction, interaction count, memory weights, repair probability, social battery, frustration, belonging, recognition satisfaction, psychological safety, recovery debt, conflict fatigue, need for quiet focus, and need for social interaction must stay hidden from normal CEO-facing UI.

These values may appear in AI Debug.

Normal play may show observable consequences: a brief speech bubble, a professional-relationship summary, a supported culture trend, an informal group, a mentoring or conflict edge, team chemistry, or evidence-backed leadership credibility. These are reports derived from source events, not direct access to hidden scores.

## Canonical Social State

`company.socialAIModelVersion` identifies the current Social AI schema. Version 4 uses canonical relationship records, a bounded directional memory store, source events, conflict/repair records, conversation state, culture evidence, derived groups and chemistry, and leadership evidence.

Every meaningful social memory must retain a `sourceEventId`. Passive co-presence may increase familiarity but may not create a meaningful memory, conflict, culture evidence, leadership evidence, or visible conversation by itself. Memory reads and UI reads are deterministic and must not consume simulation RNG.

Culture changes slowly from repeated evidence. Informal groups and team chemistry are derived from the relationship graph and can weaken, merge, split, or dissolve. Formal authority remains distinct from earned credibility and informal influence. None of these systems may become a hidden work-output multiplier.

Detailed relationship evidence is bounded independently from aggregate relationship history. When the workforce grows, older or less relevant pairs retain their summary and derived interpretation while short-term event windows are compacted. Unresolved conflicts and the most relevant current relationships retain detail. This prevents relationship storage from growing quadratically without making employees forget the organizational history represented by summaries and personal memories.

Legacy employee-local maps such as `employee.relationship` and `employee.social`, plus the old `getSocial()`, `socialScore()`, and `adjustSocial()` APIs, are migration inputs only. They are removed during load and are not production adapters. New code must use the read-only `getRelationshipView()` API or record a source-backed Social AI event. It must not add direct trust, friendship, rivalry, respect, comfort, or friction values to an employee object.

Passive co-presence, such as sharing a room, meeting room, or break area, may build familiarity. It must not create emotional events or shared-experience history unless a concrete source event exists.

The neutral employee goal is `socialConnection`. Old saves migrate the former `friendship` goal without treating social interest as liking or friendship.

System ownership is defined in `OFFICE_AQUARIUM_CONSTANTS.aiOwners`:

- Work AI owns work choices and work outcomes.
- Social AI owns familiarity, relationship interpretation, social preferences, and social traces.
- The emotional system owns final bounded stress and morale writes.
- Institutional Learning observes outcomes after they occur.

Social recommendations and emotional state writes use separate trace records. A Social AI trace records the interpretation and requested emotional change; an Emotional System trace records the bounded change actually applied.

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
- UI and AI Debug reads do not consume simulation RNG or create relationship records.
- Old passive-presence records are not migrated into shared-experience evidence.
- Every AI trace identifies its owning system.
- Every active meaningful memory retains its source event.
- Conflict repair links to a real unresolved conflict and preserves the attempt.
- Visible dialogue is grounded in current state or source-backed history.
- Confidential conversations cannot be overheard.
- Culture, group, chemistry, and leadership reads do not mutate authoritative state.
- Group and leadership derivation is deterministic and idempotent for unchanged state.

Dedicated regression coverage for this boundary lives in `tests/personality-foundation-test.js`, `tests/ai-ownership-remediation-test.js`, `tests/social-ai-familiarity-test.js`, `tests/social-ai-shared-experiences-test.js`, `tests/social-ai-relationship-interpretation-test.js`, `tests/social-ai-social-preferences-test.js`, `tests/social-ai-workplace-reputation-test.js`, `tests/social-ai-emotional-integration-test.js`, `tests/social-conflict-memory-conversation-test.js`, `tests/social-organizational-systems-test.js`, and `tests/emotional-homeostasis-test.js`.

Additional boundary coverage lives in `tests/social-ai-boundary-regression-test.js`, `tests/social-emotional-long-run-test.js`, `tests/social-organizational-long-run-test.js`, and `tests/institutional-learning-causality-test.js`.
