import type { CreateSimulationOptions } from '../simulation/engine.ts';
import type { CommunicationChoice } from './types.ts';

export const PHASE_2_SCENARIO: CreateSimulationOptions = {
  seed: 2301,
  federalFundsRate: 4.75,
  hidden: {
    demandPressure: -0.15,
    supplyPressure: 0.20,
    underlyingInflationGap: 1.0,
    neutralRate: 3.25,
    laborTightness: -0.25,
    creditStress: 0.22,
    inflationExpectations: 2.50,
    credibility: 0.75
  }
};

export const COMMUNICATION_CHOICES: readonly CommunicationChoice[] = [
  {
    id: 'inflation_confidence',
    label: 'Demand more inflation confidence',
    statement: 'We need greater confidence that inflation is moving sustainably toward 2 percent before considering less restraint.',
    guidanceBias: 1,
    tradeoffHint: 'Could reinforce inflation credibility, but may tighten financial conditions when hiring is already cooling.'
  },
  {
    id: 'data_dependent',
    label: 'Keep every option open',
    statement: 'Policy is well positioned. Incoming inflation and labor-market data will determine the appropriate next move.',
    guidanceBias: 0,
    tradeoffHint: 'Reduces commitment risk, but markets may find the message less informative.'
  },
  {
    id: 'employment_risks',
    label: 'Highlight employment risks',
    statement: 'We are increasingly attentive to downside risks to employment as policy restraint continues to work through the economy.',
    guidanceBias: -1,
    tradeoffHint: 'Could ease conditions and cushion labor weakness, but may lift inflation expectations while inflation remains elevated.'
  }
] as const;
