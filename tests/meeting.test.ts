import { describe, expect, it } from 'vitest';
import { getAdviserViews } from '../src/meeting/advisers.ts';
import { PHASE_2_SCENARIO } from '../src/meeting/content.ts';
import { createStaffBriefing, resolvePrototypeMeeting } from '../src/meeting/meetingEngine.ts';
import { EconomicSimulation } from '../src/simulation/engine.ts';

describe('single-meeting prototype', () => {
  it('creates disagreement from the visible crosscurrents', () => {
    const sim = new EconomicSimulation(PHASE_2_SCENARIO);
    expect(getAdviserViews(sim.getState()).map((view) => view.preferredAction)).toEqual([25, -25, 0]);
  });

  it('lets the same advisers change their minds in different regimes', () => {
    const hot = new EconomicSimulation({
      seed: 1,
      federalFundsRate: 3,
      hidden: {
        demandPressure: 1,
        supplyPressure: 0.2,
        underlyingInflationGap: 2,
        neutralRate: 3,
        laborTightness: 1,
        inflationExpectations: 3
      }
    });
    const recession = new EconomicSimulation({
      seed: 1,
      federalFundsRate: 4.5,
      hidden: {
        demandPressure: -1,
        laborTightness: -1,
        underlyingInflationGap: 0,
        neutralRate: 3,
        creditStress: 0.4,
        inflationExpectations: 2.1
      }
    });

    expect(getAdviserViews(hot.getState()).every((view) => view.preferredAction > 0)).toBe(true);
    expect(getAdviserViews(recession.getState()).every((view) => view.preferredAction < 0)).toBe(true);
  });

  it('keeps hidden state out of the staff briefing', () => {
    const briefing = createStaffBriefing(new EconomicSimulation(PHASE_2_SCENARIO).getState());
    expect(JSON.stringify(briefing)).not.toContain('neutralRate');
    expect(JSON.stringify(briefing)).not.toContain('demandPressure');
  });

  it('gives communication choices immediate market and expectations consequences', () => {
    const inflationFocus = resolvePrototypeMeeting(new EconomicSimulation(PHASE_2_SCENARIO), 'inflation_confidence', 0);
    const employmentFocus = resolvePrototypeMeeting(new EconomicSimulation(PHASE_2_SCENARIO), 'employment_risks', 0);
    expect(inflationFocus.communicationExpectationsDeltaBp).toBeLessThan(0);
    expect(employmentFocus.communicationExpectationsDeltaBp).toBeGreaterThan(0);
    expect(inflationFocus.marketReaction.treasuryYieldDeltaBp)
      .toBeGreaterThan(employmentFocus.marketReaction.treasuryYieldDeltaBp);
  });

  it('penalizes a contradictory signal more than a consistent one', () => {
    const consistent = resolvePrototypeMeeting(new EconomicSimulation(PHASE_2_SCENARIO), 'inflation_confidence', 25);
    const inconsistent = resolvePrototypeMeeting(new EconomicSimulation(PHASE_2_SCENARIO), 'inflation_confidence', -25);
    expect(inconsistent.credibilityDeltaPoints).toBeLessThan(consistent.credibilityDeltaPoints);
  });

  it('keeps first-interval real-economy effects lagged while markets react immediately', () => {
    const hike = resolvePrototypeMeeting(new EconomicSimulation(PHASE_2_SCENARIO), 'data_dependent', 25);
    const cut = resolvePrototypeMeeting(new EconomicSimulation(PHASE_2_SCENARIO), 'data_dependent', -25);
    expect(hike.postMeetingState.visible.unemployment).toBe(cut.postMeetingState.visible.unemployment);
    expect(hike.postMeetingState.visible.coreInflation).toBe(cut.postMeetingState.visible.coreInflation);
    expect(hike.marketReaction.treasuryYieldDeltaBp).toBeGreaterThan(cut.marketReaction.treasuryYieldDeltaBp);
  });
});
