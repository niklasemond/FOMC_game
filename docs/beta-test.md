# Local Beta Test Round 1

## Build

Use the latest `main` branch. The beta is a four-meeting prototype with local browser save/load and an optional session inspector.

## Setup

Requirements:

- Node.js 22
- Git
- a modern desktop browser

```bash
git clone https://github.com/niklasemond/FOMC_game.git
cd FOMC_game
npm install
npm run dev
```

Open the local URL printed by Vite.

## Test flow

1. Play Meeting 1 normally without using the developer sandbox.
2. At least once, choose a policy that does **not** match one adviser's recommendation.
3. Use persuasion in at least one meeting and skip it in at least one meeting.
4. After Meeting 2, press SAVE.
5. Refresh the browser, press LOAD, and verify you resume at Meeting 3 with history and committee memory intact.
6. Open SESSION and inspect the meeting history, visible macro state, dissent counts, relationships, and persuasion counts.
7. Finish all four meetings.
8. Try a second run with meaningfully different policy choices if the first run is stable.

## What to evaluate

Focus on these questions rather than whether you found the “right” monetary policy:

- Was each policy decision genuinely difficult for understandable reasons?
- Which screen gave you useful information, and which felt procedural or repetitive?
- Did advisers and committee members feel meaningfully different?
- Was the distinction between preferred policy, compromise support, and final dissent understandable?
- Did persuasion feel like a decision or like an obvious optimization puzzle?
- Were market reactions and delayed economic consequences legible?
- By Meetings 3–4, did earlier decisions feel as though they mattered?
- Was any text, table, or committee screen too dense?
- Did SAVE / LOAD behave exactly as expected?
- Did anything feel obviously economically implausible?

## Bug report format

For a bug, record:

- operating system and browser;
- current meeting number;
- what you clicked immediately before the issue;
- what you expected;
- what happened instead;
- whether a refresh/load reproduced it;
- screenshot if useful.

The SESSION inspector is intended to make state-related bug reports easier. Do not use `?debug=1` for the first gameplay impression; use it only when investigating a problem.

## Round-1 scope

Do not evaluate missing campaign content yet. This build intentionally has no political pressure, events, press conference, RPG exploration, legacy score, or Meetings 5–8.

The primary Round-1 decision is whether the four-meeting core loop is clear and engaging enough to justify expanding it into the full campaign shell.
