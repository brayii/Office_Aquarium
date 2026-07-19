# Social Personality AI Stage 8: Visible Conversations

Stage 8 makes selected source-backed interactions visible in the live office. Speech bubbles explain what the simulation already produced; they do not invent work, memories, conflict, or culture.

## Categories

The system contains deterministic template libraries for:

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

Each visible conversation contains two to four short exchanges and uses real participant, room, time, work, project, memory, relationship, culture, group, or leadership context when that evidence exists.

Template selection is deterministic but weighted by the speaker's personality, relationship with the listener, current emotional state, and recent conversation-category history. The recent template and category windows are bounded so dialogue varies without creating an unbounded transcript.

## Presentation

At most a small number of bubbles are visible together. Bubbles are keyed and reused across office redraws, progress through their exchanges, fade, stack without covering controls, pause on hover, and open a readable detail view when selected. The detail view names the source event and summarizes the most relevant actual memories rather than displaying generic hidden-state text.

## Privacy and Overhearing

Nearby attentive employees can overhear ordinary dialogue when room, distance, volume, and privacy allow it. Overheard knowledge has lower confidence than direct participation and does not change emotion by itself.

Private dialogue is harder to overhear. Confidential dialogue is never displayed or overheard.

## Grounding Rule

A line about culture, a group, leadership, a project, or company news is valid only when the matching current state or source-backed evidence exists. Template placeholders must always resolve before display.

## Regression Coverage

`tests/social-conflict-memory-conversation-test.js` verifies category coverage, template counts, source grounding, privacy, overhearing, bubble reuse, compact context, and the absence of unresolved placeholders.
