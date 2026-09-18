# Changelog

## 0.1.0 — Foundation / Economic Sandbox

- Added Vite + TypeScript + Phaser project shell.
- Added 160×144 pixel-art-oriented rendering surface.
- Added deterministic seeded economic simulation.
- Added hidden demand, supply, inflation, labor, fragility, expectations, fiscal, neutral-rate, and credibility state.
- Added noisy visible macroeconomic indicators.
- Added five-period monetary-policy lag pipeline.
- Added developer economic sandbox controls.
- Added simulation serialization/restore support and save-schema draft.
- Added persistent-inflation, supply-shock, recession, fragility, credibility, determinism, save/restore, and stress tests.

## 0.1.1 — Phase 1 Calibration / Validation

- Defined one simulation period as an approximately 6.5-week FOMC intermeeting interval.
- Exported policy-lag weights as explicit simulation constants.
- Added reusable policy-path trajectory runner.
- Added trajectory comparison report for baseline, persistent-inflation, recession, and supply-shock scenarios.
- Added recent trajectory history to the developer debug panel.
- Added lag-shape and eight-meeting policy-ordering tests.
- Revalidated representative eight-meeting paths without changing core transmission coefficients.

## 0.2.0 — First FOMC Meeting Prototype

- Added a one-meeting vertical slice around the existing economic simulation.
- Added a cross-current starting economy with elevated inflation, cooling employment, and restrictive financial conditions.
- Added player-visible staff briefing generation.
- Added three lightweight adviser models whose recommendations respond to current visible data.
- Added three natural-language forward-guidance choices.
- Added context-dependent communication effects on inflation expectations and credibility.
- Added an extra credibility penalty when guidance and the policy move directly contradict each other.
- Added -50bp / -25bp / hold / +25bp / +50bp policy choices.
- Added immediate market-reaction estimates and one-period consequence explanations.
- Added a default meeting UI while preserving the economic sandbox at `?debug=1`.
- Added deterministic Phase 2 meeting smoke tests and Vitest coverage.

## 0.3.0 — Committee Mechanics

- Added eight data-driven fictional voting committee members.
- Added dynamic committee preference calculation from visible releases.
- Added committee-centered policy-expectation proxy.
- Added formal vote projection and final vote tally including the player/Chair.
- Added consensus behavior so nearby preferences do not automatically become dissents.
- Added one targeted persuasion attempt with inflation, employment, or financial-stability arguments.
- Added persistent Chair-relationship state and save-schema v2 support.
- Added modest credibility effects for unanimity and deep committee fragmentation.
- Added committee UI, vote-whipping step, and named dissents in the result screen.
- Added committee smoke tests and Vitest coverage.

## 0.3.1 — Two-Meeting Continuity

- Added a two-meeting playable sequence without building the full campaign.
- Added persistent committee memory for prior dissents, dissent streaks, prior preferred actions, prior support, persuasion attempts, and Chair relationships.
- Added modest dissent inertia to future compromise willingness without changing members' economic preference models.
- Made persuasion-attempt counts and relationship consequences persist across meetings.
- Added Meeting 2 UI flow and committee-history readouts.
- Added continuity smoke tests and Vitest coverage.
- Added GitHub Actions validation for smoke tests, Vitest, TypeScript, and the Vite production build.
- Repaired the TypeScript/Vitest project configuration exposed by the first CI run.

## 0.4.0 — Multi-Meeting Session Layer

- Added a pure TypeScript session layer above simulation, committee, and meeting resolution.
- Added a four-meeting prototype cap without expanding to the full campaign.
- Added explicit meeting-history records containing policy/communication choices, persuasion, votes, market reaction, credibility changes, and visible before/after releases.
- Added deterministic combined session serialization/restore for simulation RNG state, committee memory, and history.
- Added save schema v3 using the complete meeting-session snapshot.
- Routed the playable meeting UI through the session layer.
- Added previous-decision summaries to later staff briefings.
- Added session smoke tests and Vitest coverage, including interrupted-vs-uninterrupted continuation equivalence.

## 0.4.1 — Local Beta Persistence

- Added browser-local save/load via localStorage.
- Added explicit v1/v2 development-save migration handling into v3 session snapshots.
- Added legacy meeting offsets so old saves can preserve progress without fabricating missing detailed history.
- Added an optional session inspector with current macro state, meeting history, vote margins, dissents, relationships, and persuasion counts.
- Added SAVE / LOAD / SESSION / CLEAR SAVE controls to the local beta UI.
- Added persistence smoke tests and Vitest coverage for simulated browser refresh continuation.
