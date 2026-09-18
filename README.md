# FOMC Chair Strategy Game

Browser-first monetary-policy strategy/RPG prototype built with TypeScript, Phaser, and Vite.

## Current scope

The project now contains the economic foundation, formal committee mechanics, and a capped four-meeting session prototype:

- deterministic seeded macroeconomic simulation;
- hidden economic state and noisy visible indicators;
- five-period lagged monetary-policy transmission;
- credit-stress, credibility, and expectations channels;
- a staff briefing based only on player-visible releases;
- three early adviser conversations plus eight formal voting committee members;
- dynamic committee preferences, vote projection, named dissents, relationships, and one limited persuasion attempt per meeting;
- up to four sequential meetings using one persistent economy and committee state;
- explicit meeting-history records with decisions, votes, persuasion outcomes, market reactions, and visible before/after releases;
- deterministic session serialization/restore that preserves simulation RNG state, committee memory, and meeting history;
- persistent dissent history/streaks, prior preferred actions, support history, persuasion counts, and Chair relationships;
- three natural-language forward-guidance choices;
- -50bp / -25bp / hold / +25bp / +50bp policy choices;
- immediate market-reaction estimates;
- one-intermeeting-interval consequence summary;
- developer trajectory and hidden-state tooling;
- simulation and meeting smoke tests.

It deliberately does **not** yet contain the RPG world, the full eight-meeting campaign, media Q&A, political pressure, event engine, data revisions, audio, or production-grade cloud/account saves. The local beta now has browser-local save/load.

## Local beta quick start

Requirements: Node.js 22 and Git.

```bash
git clone https://github.com/niklasemond/FOMC_game.git
cd FOMC_game
npm install
npm run dev
```

Open the local URL printed by Vite. The LOCAL BETA toolbar lets you save/load the last completed meeting boundary and inspect the current four-meeting session. A browser refresh does not destroy a saved session.

For a clean update later:

```bash
git pull
npm install
npm run dev
```

## Run

```bash
npm run dev
```

The default page opens the capped multi-meeting prototype. Add `?debug=1` to the local URL to open the developer economic sandbox instead.

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
npm run test:continuity-smoke
npm run test:session-smoke
npm run test:persistence-smoke
npm run report:trajectories
```

## Simulation clock

One simulation period represents roughly one FOMC intermeeting interval (~6.5 weeks), so eight periods approximate one campaign year. Policy changes are placed into a five-period lag structure. Visible releases contain deterministic seeded measurement noise.

## Current design question

The current prototype tests whether those trade-offs remain coherent over a short four-meeting session, including deterministic save/restore of the complete economy, committee memory, and decision history.
