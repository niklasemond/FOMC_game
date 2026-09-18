import { describe, expect, it } from 'vitest';
import { EconomicSimulation } from '../src/simulation/engine.ts';
import { PHASE_2_SCENARIO } from '../src/meeting/content.ts';
import { createInitialCommitteeState } from '../src/committee/members.ts';
import {
  attemptPersuasion,
  evaluateCommittee,
  expectedCommitteeAction,
  tallyCommitteeVote
} from '../src/committee/committeeEngine.ts';

describe('formal committee prototype', () => {
  it('creates eight dynamic voting members with a balanced starting distribution', () => {
    const views = evaluateCommittee(new EconomicSimulation(PHASE_2_SCENARIO).getState(), createInitialCommitteeState());
    expect(views).toHaveLength(8);
    expect(views.map((view) => view.preferredAction)).toEqual([25, -25, 0, -25, 25, 0, 0, 0]);
    expect(expectedCommitteeAction(views)).toBe(0);
  });

  it('changes committee preferences with the economic regime', () => {
    const committee = createInitialCommitteeState();
    const hot = new EconomicSimulation({
      seed: 1,
      federalFundsRate: 3,
      hidden: { demandPressure: 1, supplyPressure: 0.2, underlyingInflationGap: 2, neutralRate: 3, laborTightness: 1, inflationExpectations: 3 }
    });
    const recession = new EconomicSimulation({
      seed: 1,
      federalFundsRate: 4.5,
      hidden: { demandPressure: -1, laborTightness: -1, underlyingInflationGap: 0, neutralRate: 3, creditStress: 0.4, inflationExpectations: 2.1 }
    });
    expect(evaluateCommittee(hot.getState(), committee).every((view) => view.preferredAction > 0)).toBe(true);
    expect(evaluateCommittee(recession.getState(), committee).every((view) => view.preferredAction < 0)).toBe(true);
  });

  it('allows ordinary disagreement without making every difference a dissent', () => {
    const views = evaluateCommittee(new EconomicSimulation(PHASE_2_SCENARIO).getState(), createInitialCommitteeState());
    expect(tallyCommitteeVote(views, 0).dissentCount).toBe(1);
    expect(tallyCommitteeVote(views, 25).dissentCount).toBe(2);
    expect(tallyCommitteeVote(views, -25).dissentCount).toBe(2);
    expect(tallyCommitteeVote(views, 50).fragmentation).toBe('deeply divided');
  });

  it('lets one fitting persuasion change a vote without changing the member preference', () => {
    const committee = createInitialCommitteeState();
    const views = evaluateCommittee(new EconomicSimulation(PHASE_2_SCENARIO).getState(), committee);
    const price = views.find((view) => view.id === 'price');
    expect(price?.preferredAction).toBe(25);
    const persuasion = attemptPersuasion(views, committee, 0, { targetId: 'price', argument: 'inflation' });
    expect(persuasion.outcome.success).toBe(true);
    expect(tallyCommitteeVote(views, 0, persuasion.outcome).dissentCount).toBe(0);
    expect(price?.preferredAction).toBe(25);
  });

  it('does not make persuasion automatically successful', () => {
    const committee = createInitialCommitteeState();
    const views = evaluateCommittee(new EconomicSimulation(PHASE_2_SCENARIO).getState(), committee);
    const persuasion = attemptPersuasion(views, committee, 25, { targetId: 'fields', argument: 'stability' });
    expect(persuasion.outcome.success).toBe(false);
    expect(tallyCommitteeVote(views, 25, persuasion.outcome).dissentCount).toBe(2);
  });
});
