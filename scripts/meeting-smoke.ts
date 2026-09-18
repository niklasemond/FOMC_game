import assert from 'node:assert/strict';
import { getAdviserViews } from '../src/meeting/advisers.ts';
import { PHASE_2_SCENARIO } from '../src/meeting/content.ts';
import { createStaffBriefing, resolvePrototypeMeeting } from '../src/meeting/meetingEngine.ts';
import { EconomicSimulation } from '../src/simulation/engine.ts';

function check(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

check('prototype scenario creates genuine adviser disagreement', () => {
  const sim = new EconomicSimulation(PHASE_2_SCENARIO);
  const actions = getAdviserViews(sim.getState()).map((view) => view.preferredAction);
  assert.deepEqual(actions, [25, -25, 0]);
});

check('adviser recommendations respond to the economy rather than staying fixed', () => {
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

  assert(getAdviserViews(hot.getState()).every((view) => view.preferredAction > 0));
  assert(getAdviserViews(recession.getState()).every((view) => view.preferredAction < 0));
});

check('briefing contains only player-visible observations', () => {
  const sim = new EconomicSimulation(PHASE_2_SCENARIO);
  const briefing = createStaffBriefing(sim.getState());
  assert.equal(briefing.length, 5);
  assert(!JSON.stringify(briefing).includes('neutralRate'));
  assert(!JSON.stringify(briefing).includes('demandPressure'));
});

check('communication wording moves expectations in opposite directions', () => {
  const hawkish = resolvePrototypeMeeting(new EconomicSimulation(PHASE_2_SCENARIO), 'inflation_confidence', 0);
  const dovish = resolvePrototypeMeeting(new EconomicSimulation(PHASE_2_SCENARIO), 'employment_risks', 0);
  assert(hawkish.communicationExpectationsDeltaBp < 0);
  assert(dovish.communicationExpectationsDeltaBp > 0);
  assert(hawkish.marketReaction.treasuryYieldDeltaBp > dovish.marketReaction.treasuryYieldDeltaBp);
});

check('contradicting guidance and the rate move costs more credibility', () => {
  const consistent = resolvePrototypeMeeting(new EconomicSimulation(PHASE_2_SCENARIO), 'inflation_confidence', 25);
  const inconsistent = resolvePrototypeMeeting(new EconomicSimulation(PHASE_2_SCENARIO), 'inflation_confidence', -25);
  assert(inconsistent.credibilityDeltaPoints < consistent.credibilityDeltaPoints);
});

check('policy does not unrealistically move the real economy on impact', () => {
  const hike = resolvePrototypeMeeting(new EconomicSimulation(PHASE_2_SCENARIO), 'data_dependent', 25);
  const cut = resolvePrototypeMeeting(new EconomicSimulation(PHASE_2_SCENARIO), 'data_dependent', -25);
  assert.equal(hike.postMeetingState.visible.unemployment, cut.postMeetingState.visible.unemployment);
  assert.equal(hike.postMeetingState.visible.coreInflation, cut.postMeetingState.visible.coreInflation);
  assert(hike.marketReaction.treasuryYieldDeltaBp > cut.marketReaction.treasuryYieldDeltaBp);
});

check('same seed and choices reproduce the entire meeting result', () => {
  const a = resolvePrototypeMeeting(new EconomicSimulation(PHASE_2_SCENARIO), 'employment_risks', -25);
  const b = resolvePrototypeMeeting(new EconomicSimulation(PHASE_2_SCENARIO), 'employment_risks', -25);
  assert.deepEqual(a, b);
});

console.log('All executable Phase 2 meeting smoke checks passed.');
