# Development Log

## Iteration 1 — Foundation + Economic Sandbox

### Objective

Create a stable browser shell and the smallest credible economic sandbox needed to test delayed monetary-policy effects.

### Changes

- Established TypeScript/Vite/Phaser structure.
- Separated pure simulation logic from Phaser/DOM presentation.
- Added deterministic seeded PRNG.
- Added hidden economic state and noisy visible indicators.
- Added five-period policy-transmission pipeline.
- Added demand, labor, inflation, expectations, credibility, financial-conditions, and credit-stress channels.
- Added developer controls for ±25bp, hold, and advance period.
- Added versioned simulation serialization and a save-schema draft.

### Features deliberately excluded

RPG exploration, committee members, voting, persuasion, media, political pressure, modular events, campaign sequencing, data revisions, production persistence UI, sound, and cutscenes.

### Acceptance criteria

- Browser production build succeeds.
- Same seed + same actions produce identical states.
- Restored simulation continues identically.
- Restrictive policy lowers demand/inflation relative to an easier path under persistent inflation.
- Supply pressure can fade without making aggressive tightening costless.
- Easing supports recessionary demand with a lag.
- Fragility makes restrictive conditions capable of increasing credit stress.
- Low credibility worsens expectations/inflation persistence.
- Stress runs remain finite and within explicit bounds.

### Tests

Executed in this environment:

- native-Node TypeScript smoke suite for determinism, save/restore, persistent inflation, supply shock, recession, financial fragility, credibility, and 80-seed × 24-period stress behavior;
- syntax parsing for all TypeScript source/test/smoke files with Node type stripping;
- standalone TypeScript strict type-check for the simulation and save-schema modules.

Not executed here:

- Vitest suite through the package runner;
- full Vite/Phaser production build;
- browser manual UI playthrough.

Reason: `npm install` timed out before dependencies were installed. The code and package scripts are prepared for those checks once registry access is available.

### Observed issues

- First stress pass produced 272 hits on the original hidden inflation-gap floor (-0.8pp) across 1,920 periods. This indicated the safety clamp was influencing ordinary stress trajectories too often.
- Inspection showed the issue was exclusively the deflation-side inflation clamp; demand and credit-stress clamps were not being hit.
- The inflation-gap development guardrail was widened to -1.5pp. Re-running the same stress set produced no hits on that floor (observed minimum approximately -1.07pp), preserving the model dynamics rather than clipping them.
- The default 4.5% hold path is intentionally restrictive relative to the 3.0% hidden neutral rate and can push core inflation below target over a long hold. This is directionally plausible but requires later calibration against a defined meeting-to-calendar-time mapping.
- Dependency installation failure remains an environment issue, so browser boot is code-complete but not runtime-verified in this session.

### Decisions

- Keep the macro model low-dimensional and inspectable.
- Store PRNG state in saves for exact reproducibility.
- Keep the hidden-state sandbox visible to developers until directional behavior is validated.
- Do not introduce random endogenous shocks yet; they would obscure whether the base transmission equations work.

### Remaining risks

- Calibration is qualitative rather than empirical.
- Meeting-frequency interpretation of parameters is not yet formally mapped to months.
- Hard bounds can mask poor calibration if frequently hit; future telemetry should count bound hits.
- Treasury-yield logic is intentionally primitive and does not yet model expected future policy.
- Credibility response is mechanical until communications gameplay exists.

### Next iteration

Do not begin Phase 2 yet if Phase 1 calibration shows obvious defects. First tune the sandbox from executed scenario output and add a small developer trajectory view/log so consequences are easier to compare across policy paths.


## Iteration 2 — Phase 1 Calibration / Trajectory Validation

### Objective

Validate the base economic model across complete eight-meeting paths, make policy lags easier to inspect, and formalize the simulation clock before adding Phase 2 gameplay.

### Changes

- Defined one simulation period as an approximately 6.5-week FOMC intermeeting interval.
- Moved policy lag weights into explicit exported constants.
- Added a pure TypeScript policy-path trajectory runner.
- Added `npm run report:trajectories` with baseline, persistent-inflation, recession, and supply-shock comparisons.
- Added a recent trajectory table to the debug interface showing rate, core inflation, unemployment, GDP growth, and financial conditions.
- Added tests for gradual policy transmission and eight-meeting inflation/labor trade-off ordering.

### Tests

Executed successfully:

- existing determinism and save/restore checks;
- persistent-inflation, supply-shock, recession, fragility, and credibility scenarios;
- 80-seed × 24-period bounded stress run with zero bound hits;
- one-time 50bp lag-shape test;
- eight-meeting hike/hold/cut ordering test;
- representative trajectory report across four starting regimes and five policy paths.

Package installation was retried with npm and again timed out in the execution environment, so Vitest-through-npm, Phaser browser boot, and Vite production build remain unexecuted here.

### Observed issues

- The default baseline hold path (4.5% policy rate versus 3.0% hidden neutral) is meaningfully restrictive and brings core inflation below 2% by the end of eight periods. This is not internally inconsistent, but it means starting-state construction will matter greatly once campaigns are authored.
- Front-loaded moves generate somewhat larger end-of-year effects than gradual paths reaching the same terminal rate, as expected from the lag structure. This needs to remain visible but not become a dominant exploit once meetings have richer uncertainty and event risk.
- Recessionary easing improves outcomes gradually rather than producing an immediate rescue. No obvious mechanical instability was found.

### Decisions

- Keep the existing transmission coefficients unchanged. The current trajectory ordering is coherent, and changing parameters without gameplay evidence would be premature.
- Treat the simulation period as an intermeeting interval rather than a calendar month.
- Keep trajectory tooling as developer infrastructure; exact hidden-state effects should not be exposed to normal players.

### Remaining risks

- Calibration remains qualitative rather than fitted to historical impulse responses.
- The campaign currently lacks endogenous shocks and data revisions, so trajectory comparisons are cleaner than real gameplay will be.
- Treasury yields still do not incorporate an explicit expected future policy path.
- Browser runtime validation remains blocked by dependency-install access in this environment.

### Next iteration

The economic foundation is now stable enough to begin Phase 2 narrowly: implement one placeholder FOMC meeting around the existing simulation with a data briefing, two or three advisers, one communication choice, a policy decision, and an explainable market reaction. Do not add the RPG world or full committee system yet.


## Periodic Project Review 1 — After Iterations 1–2

### Gameplay

The project is not yet a game, so fun cannot be judged honestly. The sandbox already produces visibly different policy paths, but the next milestone must test whether interpreting information and choosing policy feels interesting rather than merely inspecting numbers.

### Economics

The base model is internally coherent enough to support the next prototype. Policy transmission is delayed, supply shocks create trade-offs, recessionary easing is gradual, fragility interacts with tightening, and credibility affects expectations. Calibration is still qualitative and should remain easy to tune.

### Player information

The current interface intentionally reveals too much because it is a developer tool. Phase 2 should begin separating player-visible evidence from hidden state and should explain consequences in plain economic language rather than exposing formulas.

### Characters

Not implemented. This remains appropriate for scope control. Phase 2 should use only two or three lightweight adviser viewpoints, without building the full committee-agent system.

### Pacing

Not yet testable as campaign pacing. The simulation clock is now clear: one period is approximately one FOMC intermeeting interval, making eight meetings roughly one year.

### Political system

Not implemented. This remains intentionally deferred. Political pressure should not enter until the single-meeting core loop proves engaging without it.

### Technical health

Layering remains clean: the simulation is pure TypeScript and independent of Phaser. Deterministic state and save/restore behavior are intact. The largest technical validation gap is still the inability to install npm dependencies in this execution environment, preventing a browser/Vite runtime check here.

### Scope

Scope remains controlled. No RPG world, campaign content, event library, political system, or art-production work has been started prematurely.

### Review conclusion

Proceed to Phase 2, but only as a single-meeting vertical prototype. The acceptance question for the next iteration is not visual polish; it is whether incomplete data, competing advice, one communication choice, and a policy decision create an understandable and genuinely difficult choice.
