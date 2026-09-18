# FOMC Chair Strategy Game

Browser-first monetary-policy strategy/RPG prototype built with TypeScript, Phaser, and Vite.

## Current scope

The project now contains the Phase 0/1 economic foundation plus a deliberately narrow Phase 2 single-meeting vertical prototype:

- deterministic seeded macroeconomic simulation;
- hidden economic state and noisy visible indicators;
- five-period lagged monetary-policy transmission;
- credit-stress, credibility, and expectations channels;
- a staff briefing based only on player-visible releases;
- three lightweight advisers with different sensitivities whose recommendations change with the economy;
- three natural-language forward-guidance choices;
- -50bp / -25bp / hold / +25bp / +50bp policy choices;
- immediate market-reaction estimates;
- one-intermeeting-interval consequence summary;
- developer trajectory and hidden-state tooling;
- simulation and meeting smoke tests.

It deliberately does **not** yet contain the RPG world, full FOMC voting/persuasion, media Q&A, political pressure, event engine, campaign sequencing, data revisions, audio, or production save UI.

## Run

```bash
npm install
npm run dev
```

The default page opens the single-meeting prototype. Add `?debug=1` to the local URL to open the developer economic sandbox instead.

## Validate

```bash
npm run check
```

This runs the Vitest suite and a production TypeScript/Vite build when dependencies are available.

The pure-TypeScript smoke checks can also be run directly:

```bash
npm run test:smoke
npm run test:meeting-smoke
npm run report:trajectories
```

## Simulation clock

One simulation period represents roughly one FOMC intermeeting interval (~6.5 weeks), so eight periods approximate one campaign year. Policy changes are placed into a five-period lag structure. Visible releases contain deterministic seeded measurement noise.

## Current design question

The Phase 2 prototype is testing one thing: can incomplete/conflicting evidence, competing advisers, communication, and a rate decision create an understandable decision with real trade-offs before any RPG-world production work begins?
