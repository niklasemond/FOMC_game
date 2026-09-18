# FOMC Chair Strategy Game

Browser-first monetary-policy strategy/RPG prototype built with TypeScript, Phaser, and Vite.

## Current scope

The project now contains the economic foundation, the single-meeting vertical prototype, and the first Phase 3 committee mechanics:

- deterministic seeded macroeconomic simulation;
- hidden economic state and noisy visible indicators;
- five-period lagged monetary-policy transmission;
- credit-stress, credibility, and expectations channels;
- a staff briefing based only on player-visible releases;
- three early adviser conversations plus eight formal voting committee members;
- dynamic committee preferences, vote projection, named dissents, relationships, and one limited persuasion attempt;
- three natural-language forward-guidance choices;
- -50bp / -25bp / hold / +25bp / +50bp policy choices;
- immediate market-reaction estimates;
- one-intermeeting-interval consequence summary;
- developer trajectory and hidden-state tooling;
- simulation and meeting smoke tests.

It deliberately does **not** yet contain the RPG world, multi-meeting committee relationship progression in gameplay, media Q&A, political pressure, event engine, campaign sequencing, data revisions, audio, or production save UI.

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
npm run test:committee-smoke
npm run report:trajectories
```

## Simulation clock

One simulation period represents roughly one FOMC intermeeting interval (~6.5 weeks), so eight periods approximate one campaign year. Policy changes are placed into a five-period lag structure. Visible releases contain deterministic seeded measurement noise.

## Current design question

The current prototype tests whether incomplete evidence, competing interpretations, committee politics, one persuasion attempt, communication, and a rate decision create meaningful trade-offs before any RPG-world production work begins.
