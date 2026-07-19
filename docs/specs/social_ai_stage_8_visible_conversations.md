# Social Personality AI Stage 8: Visible Conversations and Presence

Stage 8 makes selected source-backed interactions visible in the live office. Save version 40 extends the same dialogue entry points with a full presence pipeline; it does not replace the Social AI system. Speech bubbles explain what the simulation already produced and never invent work, memories, conflict, culture, or a future action.

## Grounded Pipeline

Every visible conversation follows:

```text
Simulation event
-> conversation opportunity
-> approach
-> greeting
-> topic
-> reply
-> optional follow-up
-> goodbye
-> resume activity
```

Approved triggers include passing a coworker during a natural pause, meeting transitions, help requests, shared task completion, blocker resolution, milestones, conflict or repair, mentoring, breaks, department returns, work coordination, deadlines, company news, and first meetings. Unknown triggers, stale source events, missing participants, mismatched rooms, cooldown conflicts, and irrelevant interruptions during critical work do not create a visible conversation.

The runtime keeps assistance and blocker resolution separate. A direct request or offered assistance uses help dialogue; a source-backed resolved blocker uses blocker dialogue. Onboarding mentoring waits until the new hire and assigned mentor are genuinely co-present. An unresolved conflict may later create an autonomous apology or clarification only after its cooldown and only when personality, relationship state, culture, and workplace safety make a repair attempt credible.

## Categories and Wording

The system contains 15 deterministic categories:

- greeting
- current work
- help request
- giving help
- blockers
- meetings
- deadlines
- appreciation
- mentoring
- recognition
- conflict
- repair
- casual conversation
- company news
- celebration

Each category contains 40 templates, within the shared 40-60 target. Intent is selected separately from reserved, professional, extroverted, and humorous wording. Every normal conversation contains four or five exchanges with a greeting, topic, reply, optional follow-up, and goodbye.

Template selection is deterministic and considers personality, relationship context, emotional context, topic, and pair history. Recent templates, topics, categories, and partners are bounded and penalized so unused wording is preferred before repetition.

## Memory and Grounding

Dialogue may refer to an actual shared memory when one exists. The source event, trigger evidence, work item, project, room, relationship, culture, leadership event, blocker, meeting, mentoring event, celebration, or company-news record must support the line. Unresolved placeholders and unsupported claims are rejected.

A presentation-only opportunity can make a real task completion or department return visible without inventing a relationship or emotional outcome. A speech bubble is not itself evidence that work improved, trust changed, or Institutional Learning should update.

## Movement and Timing

Participants approach with accelerated/decelerated motion, maintain personal space with a small natural offset, and face one another. During dialogue they remain visually active through deterministic nods, glances, weight shifts, folded arms, coffee sips, and small hand gestures.

Sentence length controls display duration, and short pauses separate replies. After the goodbye, employees turn and resume their latest activity. If the Work AI changes a destination during the conversation, the simulation state changes normally while the visual move waits until the goodbye.

## Presentation

At most a small number of bubbles are visible together. Bubbles are keyed and reused across office redraws, progress through their exchanges, fade, stack without covering controls, remain fully visible while hovered, and open a readable detail view when selected. The simulation continues while a bubble is hovered. The detail view names the source event and summarizes relevant actual memories rather than exposing raw hidden scores.

## Privacy and Overhearing

Nearby attentive employees can overhear ordinary dialogue when room, distance, volume, and privacy allow it. Overheard knowledge has lower confidence than direct participation and does not change emotion by itself.

Private dialogue is harder to overhear. Confidential dialogue is never displayed or overheard.

## Persistence and Regression Coverage

Conversation transcripts, schedules, phases, source links, pair history, presence state, and pending resume destinations use shared bounds from `src/core/constants.js`. They survive compact save/load and deterministic replay.

`tests/conversation-presence-regression-test.js` verifies category/template volume, all supported trigger/category mappings, personality wording, shared-memory references, anti-repetition, movement, personal space, gestures, readable timing, critical-work protection, real work-item blocker resolution, task-completion and department-return producers, onboarding mentoring, autonomous source-backed conflict repair, presentation-only boundaries, save/load, and deterministic replay.

`tests/social-conflict-memory-conversation-test.js` continues to verify source grounding, privacy, overhearing, bubble reuse, compact context, and the absence of unresolved placeholders.
