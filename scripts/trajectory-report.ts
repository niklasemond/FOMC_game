import { SIMULATION_PERIOD_WEEKS } from '../src/simulation/constants.ts';
import { runPolicyPath } from '../src/simulation/trajectory.ts';
import type { CreateSimulationOptions } from '../src/simulation/engine.ts';
import type { PolicyAction } from '../src/simulation/types.ts';

type Scenario = { name: string; options: CreateSimulationOptions };
type Path = { name: string; actions: PolicyAction[] };

const scenarios: Scenario[] = [
  { name: 'baseline', options: { seed: 101 } },
  {
    name: 'persistent inflation',
    options: {
      seed: 102,
      federalFundsRate: 4,
      hidden: {
        demandPressure: 0.8,
        supplyPressure: 0.15,
        underlyingInflationGap: 1.7,
        inflationPersistence: 0.78,
        neutralRate: 3,
        laborTightness: 0.8
      }
    }
  },
  {
    name: 'recession',
    options: {
      seed: 103,
      federalFundsRate: 4.5,
      hidden: {
        demandPressure: -0.8,
        laborTightness: -0.7,
        creditStress: 0.25,
        neutralRate: 3,
        underlyingInflationGap: 0.1
      }
    }
  },
  {
    name: 'supply shock',
    options: {
      seed: 104,
      federalFundsRate: 3.5,
      hidden: {
        supplyPressure: 1.4,
        demandPressure: 0.05,
        underlyingInflationGap: 1.2,
        neutralRate: 3,
        laborTightness: 0.05
      }
    }
  }
];

const paths: Path[] = [
  { name: 'hold', actions: [0, 0, 0, 0, 0, 0, 0, 0] },
  { name: 'gradual cuts', actions: [-25, -25, -25, -25, 0, 0, 0, 0] },
  { name: 'gradual hikes', actions: [25, 25, 25, 25, 0, 0, 0, 0] },
  { name: 'front-loaded cuts', actions: [-50, -50, 0, 0, 0, 0, 0, 0] },
  { name: 'front-loaded hikes', actions: [50, 50, 0, 0, 0, 0, 0, 0] }
];

console.log(`Simulation period: ~${SIMULATION_PERIOD_WEEKS} weeks; eight periods ≈ ${(SIMULATION_PERIOD_WEEKS * 8).toFixed(0)} weeks.`);

for (const scenario of scenarios) {
  console.log(`\n## ${scenario.name}`);
  console.log('path | rate | core | unemployment | GDP | demand | inflation gap | labor | credit stress');
  console.log('--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---:');

  for (const path of paths) {
    const trajectory = runPolicyPath(scenario.options, path.actions);
    const final = trajectory.at(-1)?.state;
    if (!final) throw new Error('Trajectory unexpectedly empty.');
    const h = final.hidden;
    const v = final.visible;
    console.log([
      path.name,
      v.federalFundsRate.toFixed(2),
      v.coreInflation.toFixed(2),
      v.unemployment.toFixed(2),
      v.gdpGrowth.toFixed(2),
      h.demandPressure.toFixed(2),
      h.underlyingInflationGap.toFixed(2),
      h.laborTightness.toFixed(2),
      h.creditStress.toFixed(2)
    ].join(' | '));
  }
}
