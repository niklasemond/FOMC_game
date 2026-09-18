# Architecture

## Phase 0 decision

Use the requested TypeScript + Phaser + Vite stack. There is no engineering reason at this stage to change framework.

## Layer boundaries

- `src/simulation/`: pure TypeScript economic model. It has no Phaser or DOM dependency.
- `src/game/`: Phaser scenes and future world presentation.
- `src/ui/`: browser UI adapters, currently only the developer sandbox panel.
- `src/state/`: save-format types and future persistence adapters.
- future `src/campaign/`: campaign sequencing and authored/random campaign definitions.
- future `src/events/`: data-driven event definitions and event application.
- future `src/characters/`: committee models and relationship state.
- future `src/audio/`: music/SFX adapter.

## Dependency rule

Simulation code must never import Phaser. Presentation can read simulation state and dispatch actions, but the simulation remains independently testable.

## Determinism

All simulation randomness comes from a stored seeded PRNG state. The save payload stores the seed and RNG state, enabling exact continuation and reproducible bug reports.

## Persistence direction

Phase 1 implements serialization only. Browser-local persistence is intentionally deferred until a gameplay save flow exists. The schema is versioned from the start so future migration can be explicit.
