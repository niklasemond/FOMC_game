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

## Iteration 3 — Phase 2 Single FOMC Meeting Prototype

### Objective

Build the smallest playable FOMC meeting around the validated simulation and test whether conflicting information, competing advice, communication, and a rate decision create an understandable policy trade-off.

### Features added

- Added a deliberately mixed starting economy: core inflation ~3.0%, unemployment ~4.7%, payroll growth ~65k, and restrictive financial conditions.
- Added player-visible staff briefing generation using observable releases only.
- Added three provisional advisers (Ada Price, Maya Fields, Victor Bond) with distinct sensitivity functions.
- Added three natural-language forward-guidance choices without hawk/dove labels.
- Added a small communication transmission channel into inflation expectations and credibility.
- Added an additional credibility penalty when guidance and the policy move directly contradict each other.
- Added -50bp, -25bp, hold, +25bp, and +50bp policy choices.
- Added a transparent immediate market-reaction estimate using the adviser median as a temporary market-expectation proxy.
- Added one-intermeeting-interval consequence explanation.
- Made the meeting prototype the default browser surface while preserving the developer sandbox at `?debug=1`.

### Features deliberately excluded

- RPG navigation/world;
- full committee-agent architecture;
- persuasion mechanics;
- formal FOMC vote implementation;
- press conference/media questions;
- political pressure;
- event/shock engine;
- data revisions;
- campaign sequencing;
- production art/audio.

### Tests

Executed successfully in this environment:

- all existing Phase 1 simulation smoke tests;
- 80-seed × 24-period bounded stress test with zero hard-bound hits;
- trajectory report regression;
- Phase 2 meeting smoke suite;
- prototype adviser disagreement: +25bp / -25bp / hold from the same visible cross-current data;
- adviser regime responsiveness: all advisers tighten in the overheating test and ease in the recession test;
- hidden-state exclusion from the staff briefing;
- opposite communication effects on expectations/yields;
- additional credibility loss for contradictory guidance/policy combinations;
- first-interval real-economy lag check;
- deterministic replay of the full meeting result;
- strict TypeScript checking of simulation, meeting, and non-Phaser UI modules;
- parse check of all TypeScript source/test/script files.

The Vite/Phaser runtime and Vitest-through-npm remain unexecuted in this environment because npm dependency installation is still unavailable/timing out.

### Play / evaluation

The prototype produces a meaningful initial disagreement without injecting random adviser opinions. Ada Price recommends +25bp because inflation/expectations remain elevated, Maya Fields recommends -25bp because hiring/unemployment have weakened, and Victor Bond recommends hold because financial conditions and market stress already look restrictive.

Communication is not cosmetic. For the same hold decision, inflation-focused guidance lowers the hidden expectations state and lifts the immediate yield estimate, while employment-focused guidance raises expectations and lowers the yield estimate. Contradicting guidance with an opposite-sign rate move creates a larger credibility cost.

The first intermeeting interval intentionally does not reveal a clean policy winner: a +/-25bp move produces an immediate market difference while unemployment and core inflation remain effectively identical because monetary transmission is lagged. This is desirable for the game's core design principle.

### Consistency audit

- Removed an early briefing line that implied a future payroll revision even though the revision system is not implemented yet.
- The result screen avoids rating the decision as correct/incorrect.
- Hidden state is not exposed in the normal meeting flow.
- Advisers do not observe hidden truth and their recommendations are not static.
- Market surprise is clearly described as using a temporary adviser-median proxy rather than pretending a full expectations model exists.
- Communication has both an immediate reaction and a persistent expectations/credibility consequence.
- No later-phase systems were silently smuggled into the prototype.

### Problems discovered

- The immediate market-reaction model is intentionally crude. The adviser median is not a credible long-term substitute for an explicit market policy-expectations distribution.
- "Likely adviser support" is only a rough compatibility measure, not a real FOMC voting mechanic. Formal voting should wait for Phase 3.
- Because the first policy-rate effect is correctly lagged, one-meeting consequence screens risk feeling underwhelming. Presentation will need to make market/expectations effects legible without exaggerating real-economy transmission.
- Browser runtime validation is still blocked in the current execution environment.

### Decisions

- Keep Phase 2 as a DOM-driven placeholder UI rather than spending time on RPG-world presentation.
- Keep adviser models simple and observable-data-based until the meeting loop is proven useful.
- Keep communication effects small and context-dependent.
- Do not tune macro coefficients merely to make one-meeting outcomes more dramatic.

### Remaining risks

- Actual player fun/usability still needs browser playtesting; logic-level evaluation is not a substitute for interaction testing.
- The adviser scoring thresholds may need calibration once more scenarios exist.
- The market reaction proxy may create exploitable or overly predictable responses if retained beyond this phase.
- The prototype has no media question yet, so communication currently happens only through statement guidance.

### Next iteration

Do not build the RPG world yet. First perform a small Phase 2 follow-up focused on browser playtest feedback if available, then either repair the meeting flow or proceed to Phase 3 character/committee mechanics with formal preference state, voting, and limited persuasion.
