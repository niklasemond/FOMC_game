# Simulation Model — v0.1

## Purpose

The model is intentionally not a DSGE model. It is a compact state-transition system designed for understandable, tunable gameplay and deterministic testing.

## Hidden state

The first model tracks:

- demand pressure;
- supply pressure;
- inflation persistence;
- neutral policy rate;
- productivity growth;
- labor-market tightness;
- credit stress;
- financial fragility;
- fiscal impulse;
- underlying inflation gap;
- inflation expectations;
- Fed credibility.

## Visible indicators

The sandbox derives noisy observations for:

- federal funds rate;
- headline and core inflation;
- unemployment;
- payroll growth;
- wage growth;
- GDP growth;
- inflation expectations;
- 10-year Treasury yield;
- financial conditions;
- market stress;
- credibility.

## Policy transmission

The policy rate is compared with the hidden neutral rate. The policy gap is filtered through a five-period weighted lag. Current policy therefore matters a little immediately and more over later periods.

A restrictive effective stance lowers demand and, with additional lag, labor tightness and inflation pressure. It can also increase financial stress when fragility is high.

## Inflation

Underlying inflation is persistent and responds to:

- demand pressure;
- supply pressure;
- inflation expectations;
- credibility;
- restrictive policy.

Supply pressure decays over time in the base configuration, making a supply shock partly self-correcting. This is intentional so tightening a supply shock has a trade-off rather than a guaranteed dominant solution.

## Expectations and credibility

Low credibility lifts the inflation-expectations target. Sustained restrictive policy during above-target inflation can modestly support credibility; accommodation while inflation is materially high can reduce it.

Communication-driven credibility changes are not yet implemented.

## Credit stress

Financial conditions reflect policy restrictiveness and existing credit stress. Financial fragility determines how strongly restrictive conditions turn into additional credit stress.

## Noise

Visible releases use seeded Gaussian measurement noise. Hidden dynamics do not receive random shocks yet; that belongs to the later uncertainty/event phases.

## Explicit bounds

All major state variables have hard safety bounds. This is a development guardrail, not a final gameplay rule. The initial inflation floor of -0.8pp was hit too often in stress tests, so it was widened to -1.5pp after inspection; the final stress run no longer relies on that clamp under the tested paths. Stress tests verify finite values and bound compliance.

## Known simplifications

- No separate household/business sectors.
- No explicit yield curve or exchange rate.
- No endogenous fiscal policy.
- No market expectations of future FOMC decisions.
- No event shocks beyond initial conditions.
- No data revisions yet.
- No distinction between monthly and meeting-frequency data.
- No communication channel beyond credibility state dynamics.
