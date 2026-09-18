import assert from 'node:assert/strict';
import { EconomicSimulation } from '../src/simulation/engine.ts';
import { PHASE_2_SCENARIO } from '../src/meeting/content.ts';
import { createInitialCommitteeState } from '../src/committee/members.ts';
import {
  attemptPersuasion,
  evaluateCommittee,
  expectedCommitteeAction,
  tallyCommitteeVote
} from '../src/committee/committeeEngine.ts';

function check(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

check('eight members generate a balanced mixed-economy distribution', () => {
  const views = evaluateCommittee(new EconomicSimulation(PHASE_2_SCENARIO).getState(), createInitialCommitteeState());
  assert.equal(views.length, 8);
  assert.deepEqual(views.map((view) => view.preferredAction), [25, -25, 0, -25, 25, 0, 0, 0]);
  assert.equal(expectedCommitteeAction(views), 0);
});

check('committee preferences change across regimes', () => {
  const state = createInitialCommitteeState();
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
  assert(evaluateCommittee(hot.getState(), state).every((view) => view.preferredAction > 0));
  assert(evaluateCommittee(recession.getState(), state).every((view) => view.preferredAction < 0));
});

check('plausible moves create limited dissent while extreme moves fragment the committee', () => {
  const views = evaluateCommittee(new EconomicSimulation(PHASE_2_SCENARIO).getState(), createInitialCommitteeState());
  assert.deepEqual([tallyCommitteeVote(views, -25).dissentCount, tallyCommitteeVote(views, 0).dissentCount, tallyCommitteeVote(views, 25).dissentCount], [2, 1, 2]);
  assert(tallyCommitteeVote(views, 50).dissentCount >= 5);
  assert(tallyCommitteeVote(views, -50).dissentCount >= 5);
});

check('one well-matched persuasion can convert a dissent without changing beliefs', () => {
  const committeeState = createInitialCommitteeState();
  const views = evaluateCommittee(new EconomicSimulation(PHASE_2_SCENARIO).getState(), committeeState);
  const before = views.find((view) => view.id === 'price');
  assert(before);
  const attempt = attemptPersuasion(views, committeeState, 0, { targetId: 'price', argument: 'inflation' });
  assert.equal(attempt.outcome.success, true);
  const vote = tallyCommitteeVote(views, 0, attempt.outcome);
  assert.equal(vote.dissentCount, 0);
  assert.equal(before.preferredAction, 25);
});

check('a mismatched persuasion argument can fail', () => {
  const committeeState = createInitialCommitteeState();
  const views = evaluateCommittee(new EconomicSimulation(PHASE_2_SCENARIO).getState(), committeeState);
  const attempt = attemptPersuasion(views, committeeState, 25, { targetId: 'fields', argument: 'stability' });
  assert.equal(attempt.outcome.success, false);
  assert.equal(tallyCommitteeVote(views, 25, attempt.outcome).dissentCount, 2);
});

check('committee fragmentation can affect institutional credibility', async () => {
  const { resolvePrototypeMeeting } = await import('../src/meeting/meetingEngine.ts');
  const ordinary = resolvePrototypeMeeting(new EconomicSimulation(PHASE_2_SCENARIO), 'data_dependent', 25);
  const extreme = resolvePrototypeMeeting(new EconomicSimulation(PHASE_2_SCENARIO), 'data_dependent', 50);
  assert.equal(ordinary.committeeVote.dissentCount, 2);
  assert(extreme.committeeVote.dissentCount >= 5);
  assert(extreme.committeeCredibilityDeltaPoints < ordinary.committeeCredibilityDeltaPoints);
});

console.log('All executable Phase 3 committee smoke checks passed.');
