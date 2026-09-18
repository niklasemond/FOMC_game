# FOMC Chair Strategy Game

Phase 0 + Phase 1 foundation for a browser-first monetary-policy strategy/RPG game.

## Current scope

This iteration intentionally contains only:

- TypeScript + Vite browser shell;
- Phaser 3 low-resolution 160×144 presentation shell;
- deterministic seeded macroeconomic sandbox;
- hidden economic state and noisy visible indicators;
- lagged monetary-policy transmission;
- basic credit-stress, credibility, and expectations channels;
- developer debug interface with -25bp / hold / +25bp and period advance;
- local save/restore serialization at the simulation layer;
- simulation scenario tests and stress tests;
- architecture/design documentation.

It deliberately does **not** contain the RPG world, FOMC characters, media system, event engine, campaign content, political-pressure content, audio, or production save UI.

## Run

```bash
npm install
npm run dev
```

Then open the Vite URL shown in the terminal.

## Validate

```bash
npm run check
```

This runs the simulation test suite and a production TypeScript/Vite build.

## Debug controls

The right-hand panel exposes both visible releases and hidden state. Hidden values are developer-only and exist to make model behavior inspectable before gameplay obscures them.

Policy changes are placed into a five-period lag structure. Data releases contain deterministic seeded measurement noise.

## Design goal for this iteration

Prove that policy choices can produce directional, delayed, context-dependent macroeconomic effects without introducing the later game systems prematurely.
