export type PolicyAction = -50 | -25 | 0 | 25 | 50;

export interface HiddenEconomyState {
  demandPressure: number;
  supplyPressure: number;
  inflationPersistence: number;
  neutralRate: number;
  productivityGrowth: number;
  laborTightness: number;
  creditStress: number;
  financialFragility: number;
  fiscalImpulse: number;
  underlyingInflationGap: number;
  inflationExpectations: number;
  credibility: number;
}

export interface VisibleIndicators {
  federalFundsRate: number;
  headlineInflation: number;
  coreInflation: number;
  unemployment: number;
  payrollGrowth: number;
  wageGrowth: number;
  gdpGrowth: number;
  inflationExpectations: number;
  treasuryYield10y: number;
  financialConditions: number;
  marketStress: number;
  fedCredibility: number;
}

export interface SimulationState {
  version: 1;
  seed: number;
  rngState: number;
  period: number;
  hidden: HiddenEconomyState;
  visible: VisibleIndicators;
  policyHistory: number[];
}

export interface SimulationConfig {
  observationNoise: number;
  supplyDecay: number;
  demandMeanReversion: number;
  policySensitivity: number;
  fragilityStressMultiplier: number;
}
