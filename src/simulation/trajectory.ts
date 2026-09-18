import { EconomicSimulation, type CreateSimulationOptions } from './engine.ts';
import type { PolicyAction, SimulationState } from './types.ts';

export interface TrajectoryPoint {
  action: PolicyAction | null;
  state: SimulationState;
}

export function runPolicyPath(
  options: CreateSimulationOptions,
  actions: readonly PolicyAction[]
): TrajectoryPoint[] {
  const simulation = new EconomicSimulation(options);
  const trajectory: TrajectoryPoint[] = [{ action: null, state: simulation.getState() }];

  for (const action of actions) {
    simulation.setPolicy(action);
    trajectory.push({ action, state: simulation.advance() });
  }

  return trajectory;
}
