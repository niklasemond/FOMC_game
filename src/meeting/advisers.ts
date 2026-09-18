import type { PolicyAction, SimulationState } from '../simulation/types.ts';
import type { AdviserView } from './types.ts';

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

function actionFromScore(score: number): PolicyAction {
  if (score >= 0.75) return 50;
  if (score >= 0.20) return 25;
  if (score <= -0.75) return -50;
  if (score <= -0.20) return -25;
  return 0;
}

function confidenceFromScore(score: number): number {
  return Number(clamp(0.52 + Math.abs(score) * 0.28, 0.52, 0.90).toFixed(2));
}

function actionPhrase(action: PolicyAction): string {
  if (action === 50) return 'raise 50bp';
  if (action === 25) return 'raise 25bp';
  if (action === -25) return 'cut 25bp';
  if (action === -50) return 'cut 50bp';
  return 'hold';
}

export function getAdviserViews(state: SimulationState): AdviserView[] {
  const v = state.visible;

  const priceScore =
    0.90 * (v.coreInflation - 2.4) +
    0.85 * (v.inflationExpectations - 2.2) +
    0.30 * (v.wageGrowth - 3.5) -
    0.18 * Math.max(0, v.unemployment - 4.8);
  const priceAction = actionFromScore(priceScore);

  const fieldsScore =
    0.30 * (v.coreInflation - 2.6) -
    0.82 * (v.unemployment - 4.2) +
    0.55 * ((v.payrollGrowth - 120) / 250) +
    0.18 * (v.gdpGrowth - 1.5);
  const fieldsAction = actionFromScore(fieldsScore);

  const bondScore =
    0.24 * (v.coreInflation - 2.5) +
    0.55 * (v.inflationExpectations - 2.3) -
    0.36 * Math.max(0, v.financialConditions - 0.7) -
    0.70 * Math.max(0, v.marketStress - 0.2);
  const bondAction = actionFromScore(bondScore);

  return [
    {
      id: 'price',
      name: 'Ada Price',
      role: 'Governor · inflation-risk hawk',
      portraitGlyph: 'AP',
      preferredAction: priceAction,
      confidence: confidenceFromScore(priceScore),
      headline: `Recommendation: ${actionPhrase(priceAction)}`,
      rationale: `Core inflation is ${v.coreInflation.toFixed(1)}% and expectations are ${v.inflationExpectations.toFixed(1)}%. Price worries that declaring victory too early would make the last mile harder.`
    },
    {
      id: 'fields',
      name: 'Maya Fields',
      role: 'Governor · labor economist',
      portraitGlyph: 'MF',
      preferredAction: fieldsAction,
      confidence: confidenceFromScore(fieldsScore),
      headline: `Recommendation: ${actionPhrase(fieldsAction)}`,
      rationale: `Unemployment is ${v.unemployment.toFixed(1)}% and payroll growth is ${v.payrollGrowth.toFixed(0)}k. Fields sees a cooling labor market and worries policy may already be restrictive enough.`
    },
    {
      id: 'bond',
      name: 'Victor Bond',
      role: 'Markets desk liaison',
      portraitGlyph: 'VB',
      preferredAction: bondAction,
      confidence: confidenceFromScore(bondScore),
      headline: `Recommendation: ${actionPhrase(bondAction)}`,
      rationale: `Financial conditions read ${v.financialConditions.toFixed(2)} and market stress ${v.marketStress.toFixed(2)}. Bond is watching whether markets are doing part of the tightening for you.`
    }
  ];
}
