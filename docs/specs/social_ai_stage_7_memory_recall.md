# Social Personality AI Stage 7: Memory and Contextual Recall

Stage 7 gives employees bounded, directional memories of meaningful social events. The same event may be encoded differently by two employees because personality affects interpretation without changing source truth.

## Canonical Memory

Meaningful memories retain:

- owner and subject
- source event
- simulated timestamp
- type, tags, valence, intensity, and confidence
- room, work, project, and conversation context
- conflict or repair links when applicable
- resolution and staleness state

Memory types and valence labels come from controlled shared-constant lists. The source event remains unchanged when personality causes two employees to interpret that event differently.

Passive room overlap does not create meaningful memory.

## Bounds and Aging

Shared limits live in `OFFICE_AQUARIUM_CONSTANTS.social.memory`. The system caps memories per relationship, per employee, and globally. Overflow is deterministically compressed into summaries that retain first and last occurrence, average intensity, count, and source references.

Low-value routine memories fade sooner than important, unresolved, or repeated memories. Aging uses simulated time, never wall-clock time.

Relationship records keep compact recent evidence instead of duplicating full source events, emotional reactions, and memory records. Only the most relevant current relationship pairs retain detailed short-term windows; older pairs keep aggregate history and their derived interpretation. Event cooldown maps are short-lived and bounded.

## Recall

Read-only APIs support recent, tagged, and context-relevant recall. Recall considers the person involved, tags, current room, project, work item, conflict state, and recency. It is deterministic and cannot consume simulation RNG.

Contextual recall may request a small emotional reaction through the Emotional System. Cooldowns and caps prevent one memory from repeatedly spamming stress or morale.

## Regression Coverage

Save version 39 stores authoritative state in a compact, synchronous, backward-compatible envelope. Rebuildable social diagnostics are not persisted. Old uncompressed saves still load, and deterministic hashes exclude the same transient fields that save persistence excludes.

`tests/social-conflict-memory-conversation-test.js` verifies deterministic recall, personality-sensitive encoding, source retention, compact relationship evidence, bounded cooldowns, compression, aging, emotional cooldown, read-only debugging, and exact save/load continuity. `tests/simulation-regression-test.js` enforces a browser-storage budget for both a live long-running branch and a projected mature 29-employee company.
