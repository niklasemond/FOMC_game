# Architecture

## Phase 0 decision

Use the requested TypeScript + Phaser + Vite stack. There is no engineering reason at this stage to change framework.

## Layer boundaries

- `src/simulation/`: pure TypeScript economic model. It has no Phaser or DOM dependency.
- `src/committee/`: data-driven voting-member definitions, preference evaluation, vote projection, relationships, and limited persuasion. It depends on simulation types/state but not Phaser or the DOM.
- `src/meeting/`: pure TypeScript single-meeting orchestration, briefing/adviser logic, communication choices, committee integration, and reaction calculation. It depends on the simulation/committee layers but not Phaser or the DOM.
- `src/session/`: multi-meeting orchestration, compact meeting history, session cap, and combined deterministic serialization/restore. It depends on simulation/committee/meeting layers but not Phaser or the DOM.
- `src/game/`: Phaser scenes and future world presentation.
- `src/ui/`: browser UI adapters for the meeting prototype and developer sandbox.
- `src/state/`: versioned save formats plus browser persistence/migration adapters.
- future `src/campaign/`: campaign sequencing and authored/random campaign definitions.
- future `src/events/`: data-driven event definitions and event application.
- future `src/characters/`: committee models and relationship state.
- future `src/audio/`: music/SFX adapter.

## Dependency rule

Simulation code must never import Phaser. The committee and meeting layers may call/read simulation APIs but must remain independent of Phaser and the DOM. Presentation can read session/meeting/simulation state and dispatch actions, while simulation, committee, meeting, and session logic remain independently testable.

## Determinism

All simulation randomness comes from a stored seeded PRNG state. The save payload stores the seed and RNG state, enabling exact continuation and reproducible bug reports.

## Persistence direction

The project now has three layers of persistence:

1. `EconomicSimulation` serialization for deterministic macro continuation.
2. `MeetingSession` serialization for economy + committee + meeting history.
3. `BrowserSessionStore` for localStorage-backed beta save/load and explicit save-schema migration.

The browser adapter is intentionally narrow and account-free. It stores one local beta slot and treats the last completed meeting boundary as authoritative; unfinalized UI choices are not persisted.

## Phase 2 meeting boundary

The single-meeting prototype is intentionally split into three parts:

1. `src/simulation/` owns persistent macro state and communication transmission into expectations/credibility.
2. `src/meeting/` owns player-visible briefing construction, adviser interpretation, choice definitions, a temporary market-expectation proxy, and meeting resolution.
3. `src/ui/meetingPanel.ts` owns only screen progression and rendering.

The adviser median is temporarily used as a market-expectation proxy for policy-surprise calculation. This is explicitly a Phase 2 placeholder and should be replaced by a proper market-expectations model later rather than embedded into the simulation engine.

## Phase 3 committee boundary

The committee system is intentionally separate from both macro transition equations and UI rendering. `src/committee/members.ts` stores member archetypes and parameters; `committeeEngine.ts` converts visible releases into preferences, projects support, resolves one persuasion attempt, and tallies votes.

The player's chosen policy remains executable even when the committee is divided, but the vote is recorded and severe fragmentation can create a small institutional-credibility cost. This keeps dissent meaningful without turning every non-unanimous vote into failure.

The market-expectation proxy now uses the eight-member committee preference distribution rather than the three-adviser median. It is still a simplified proxy and should later become an explicit market expectations system.

Save schema v2 adds committee relationship state so future multi-meeting campaigns can preserve interpersonal consequences without changing the simulation-engine save payload.

## Two-meeting continuity boundary

Committee memory remains owned by the committee layer. The macro simulation never reads dissent history, persuasion counts, or interpersonal state.

`CommitteeMemberState` now carries backward-compatible optional memory fields:

- cumulative prior dissents;
- current dissent streak;
- number of persuasion attempts;
- last preferred policy action;
- whether the member supported the Chair last meeting;
- relationship with the Chair.

Old schema-v2 committee saves that contain only relationship state remain readable because the newer memory fields default to neutral values when absent.

After a meeting, `recordCommitteeMeeting` updates memory from the actual vote. The next meeting's economic preference is still recomputed from current visible releases; memory only affects willingness to join a nearby compromise.

## Multi-meeting session boundary

`MeetingSession` is now the owner of cross-meeting orchestration. It contains:

- the current serialized-capable `EconomicSimulation`;
- the current `CommitteeState`;
- ordered completed-meeting records;
- a configurable prototype meeting cap (four by default).

The session layer calls the existing single-meeting resolver rather than duplicating meeting logic. After resolution it records a compact history entry with decisions, vote/persuasion outcome, market reaction, credibility delta, and visible before/after releases.

Session serialization stores the full simulation state, including seeded RNG state, plus committee memory and history. Restoring after Meeting 2 and replaying the same Meetings 3–4 choices is required to produce the same final snapshot as uninterrupted play.

Save schema v3 wraps the session snapshot rather than duplicating simulation and committee state at the save-schema level. Schema v1/v2 types remain available for explicit future migration work.

The four-meeting cap is an intentional scope guardrail. It is not the campaign engine.

## Legacy save handling

Development save schemas v1/v2 predate detailed meeting history. Migration therefore does **not** invent old vote or market-reaction records. Instead, migrated sessions carry a `completedMeetingOffset` plus the legacy simulation/committee state. New detailed history begins from the next meeting.

V1 saves receive a fresh default committee because no committee state existed in that schema. V2 saves preserve their committee state. V3 saves load directly.
