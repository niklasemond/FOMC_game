# Architecture

## Phase 0 decision

Use the requested TypeScript + Phaser + Vite stack. There is no engineering reason at this stage to change framework.

## Layer boundaries

- `src/simulation/`: pure TypeScript economic model. It has no Phaser or DOM dependency.
- `src/meeting/`: pure TypeScript single-meeting orchestration, briefing/adviser logic, communication choices, and reaction calculation. It depends on the simulation layer but not Phaser or the DOM.
- `src/game/`: Phaser scenes and future world presentation.
- `src/ui/`: browser UI adapters for the meeting prototype and developer sandbox.
- `src/state/`: save-format types and future persistence adapters.
- future `src/campaign/`: campaign sequencing and authored/random campaign definitions.
- future `src/events/`: data-driven event definitions and event application.
- future `src/characters/`: committee models and relationship state.
- future `src/audio/`: music/SFX adapter.

## Dependency rule

Simulation code must never import Phaser. The meeting layer may call simulation APIs but must remain independent of Phaser and the DOM. Presentation can read meeting/simulation state and dispatch actions, but both simulation and meeting logic remain independently testable.

## Determinism

All simulation randomness comes from a stored seeded PRNG state. The save payload stores the seed and RNG state, enabling exact continuation and reproducible bug reports.

## Persistence direction

Phase 1 implements serialization only. Browser-local persistence is intentionally deferred until a gameplay save flow exists. The schema is versioned from the start so future migration can be explicit.

## Phase 2 meeting boundary

The single-meeting prototype is intentionally split into three parts:

1. `src/simulation/` owns persistent macro state and communication transmission into expectations/credibility.
2. `src/meeting/` owns player-visible briefing construction, adviser interpretation, choice definitions, a temporary market-expectation proxy, and meeting resolution.
3. `src/ui/meetingPanel.ts` owns only screen progression and rendering.

The adviser median is temporarily used as a market-expectation proxy for policy-surprise calculation. This is explicitly a Phase 2 placeholder and should be replaced by a proper market-expectations model later rather than embedded into the simulation engine.
