# Changelog

## 0.1.0 — Foundation / Economic Sandbox

- Added Vite + TypeScript + Phaser project shell.
- Added 160×144 pixel-art-oriented rendering surface.
- Added deterministic seeded economic simulation.
- Added hidden demand, supply, inflation, labor, fragility, expectations, fiscal, neutral-rate, and credibility state.
- Added noisy visible macroeconomic indicators.
- Added five-period monetary-policy lag pipeline.
- Added developer economic sandbox controls.
- Added simulation serialization/restore support and save-schema draft.
- Added persistent-inflation, supply-shock, recession, fragility, credibility, determinism, save/restore, and stress tests.

## 0.1.1 — Phase 1 Calibration / Validation

- Defined one simulation period as an approximately 6.5-week FOMC intermeeting interval.
- Exported policy-lag weights as explicit simulation constants.
- Added reusable policy-path trajectory runner.
- Added trajectory comparison report for baseline, persistent-inflation, recession, and supply-shock scenarios.
- Added recent trajectory history to the developer debug panel.
- Added lag-shape and eight-meeting policy-ordering tests.
- Revalidated representative eight-meeting paths without changing core transmission coefficients.
