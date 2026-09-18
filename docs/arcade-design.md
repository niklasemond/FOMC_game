# Arcade 10-Minute Branch

## Why this branch exists

The simulation-heavy beta is useful, but its default loop is too text-dense and procedural for the intended game fantasy.

The new target is a fast, funny, turbulent Chair simulator that preserves serious macroeconomic consequences underneath a much lighter presentation layer.

## Run target

One complete run should take roughly **8–12 minutes**, with 10 minutes as the design center.

The campaign still contains eight FOMC meetings, but each meeting is compressed into three fast beats:

1. **Crisis card** — one headline, three macro numbers, one staff line.
2. **Decision** — one rate choice + one communication choice on the same screen.
3. **Aftermath** — market move, vote margin, one character reaction, one fictional presidential reaction.

No mandatory eight-person committee dossier. No adviser screen unless an adviser has something unusually relevant to say.

## Tone

Late-80s / early-90s indie-game economy sim meets contemporary political pressure cooker.

Humor should come from:
- bureaucratic understatement during obvious chaos;
- fictional presidential posts and television pressure;
- finance jargon colliding with human panic;
- committee members having sharply recognizable personalities in one-liners;
- escalating cutscenes and headlines.

The economic engine remains serious. The presentation gets funnier.

## Political treatment

Political pressure is fictionalized. The game can evoke contemporary U.S. institutional tensions without becoming documentary recreation or partisan advocacy.

The President should be a fictional character with recognizable interventionist instincts, not a direct real-person simulator.

## Information budget

Default screen budget:
- headline: <= 25 words;
- staff line: <= 20 words;
- no more than 3 macro indicators at once;
- no more than 1 committee voice in aftermath;
- player choice should be reachable within seconds.

## First arcade iteration

This first branch iteration changes flow only.

It reuses the existing simulation, committee, meeting-resolution, vote, expectations, credibility, and lag systems. The eight crisis cards are narrative wrappers for now; event-specific macro shocks and animations come next.

This separation lets us test whether the faster cadence feels right before changing economic coefficients or building a full event engine.
