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
