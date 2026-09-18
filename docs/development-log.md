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
