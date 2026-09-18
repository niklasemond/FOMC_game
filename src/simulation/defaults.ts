import type { HiddenEconomyState, SimulationConfig } from './types.ts';

export const DEFAULT_CONFIG: SimulationConfig = {
  observationNoise: 1,
  supplyDecay: 0.82,
  demandMeanReversion: 0.12,
  policySensitivity: 0.09,
  fragilityStressMultiplier: 0.035
};

export const DEFAULT_HIDDEN_STATE: HiddenEconomyState = {
  demandPressure: 0.35,
  supplyPressure: 0.20,
  inflationPersistence: 0.68,
  neutralRate: 3.0,
  productivityGrowth: 1.7,
  laborTightness: 0.35,
  creditStress: 0.10,
  financialFragility: 0.18,
  fiscalImpulse: 0.20,
  underlyingInflationGap: 0.85,
  inflationExpectations: 2.45,
  credibility: 0.78
};
