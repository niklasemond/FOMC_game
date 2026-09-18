# Characters

## Phase 2 status

The full FOMC character system is **not** implemented yet. Phase 2 introduces only three lightweight adviser prototypes so the single-meeting loop can test whether competing interpretations are useful.

### Ada Price

Inflation-risk governor. Places relatively high weight on core inflation, inflation expectations, and wage growth. She can recommend easing in a sufficiently weak economy; the model does not lock her into a permanent hawkish action.

### Maya Fields

Labor economist. Places relatively high weight on unemployment, payroll growth, and GDP while still reacting to inflation. She can recommend tightening in a genuinely overheated economy.

### Victor Bond

Markets-desk liaison. Places more weight on financial conditions, market stress, and inflation expectations. He tends to worry when market tightening is already doing substantial work.

## Implementation rule

These are **not** the final character-agent architecture. Their Phase 2 recommendations are deterministic scoring functions over visible releases only. They do not observe hidden economic truth.

Tests confirm that all three recommend tightening in the overheating test regime and easing in the recession test regime. This prevents the current archetypes from collapsing into fixed “hawk/dove” dialogue buttons.
