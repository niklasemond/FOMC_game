import assert from 'node:assert/strict';
import { EconomicSimulation } from '../src/simulation/engine.ts';
import { PHASE_2_SCENARIO } from '../src/meeting/content.ts';
import { resolvePrototypeMeeting } from '../src/meeting/meetingEngine.ts';
import { createInitialCommitteeState } from '../src/committee/members.ts';
import {
  evaluateCommittee,
  recordCommitteeMeeting,
  tallyCommitteeVote,
  wouldSupportPolicy
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

check('persuasion relationship memory survives into meeting two', () => {
  const simulation = new EconomicSimulation(PHASE_2_SCENARIO);
  const first = resolvePrototypeMeeting(simulation, 'data_dependent', 0, {
    committeeState: createInitialCommitteeState(),
    persuasionAttempt: { targetId: 'price', argument: 'inflation' }
  });
  const priceState = first.committeeState.members.find((member) => member.id === 'price');
  const priceView = evaluateCommittee(simulation.getState(), first.committeeState)
    .find((member) => member.id === 'price');

  assert.equal(first.persuasionOutcome.success, true);
  assert.equal(priceState?.persuasionAttempts, 1);
  assert((priceState?.relationshipWithChair ?? 0) > 0.55);
  assert.equal(priceView?.relationshipWithChair, priceState?.relationshipWithChair);
  assert.equal(priceView?.lastSupportedChair, true);
});

check('dissent memory is recorded and exposed next meeting', () => {
  const simulation = new EconomicSimulation(PHASE_2_SCENARIO);
  const first = resolvePrototypeMeeting(simulation, 'data_dependent', 25, {
    committeeState: createInitialCommitteeState()
  });
  const fields = first.committeeState.members.find((member) => member.id === 'fields');
  assert.equal(fields?.priorDissents, 1);
  assert.equal(fields?.dissentStreak, 1);
  assert.equal(fields?.lastSupportedChair, false);
  assert.equal(fields?.lastPreferredAction, -25);
});

check('dissent inertia can change compromise support without changing preference', () => {
  const economy = new EconomicSimulation(PHASE_2_SCENARIO).getState();
  const fresh = createInitialCommitteeState();
  const freshStone = evaluateCommittee(economy, fresh).find((member) => member.id === 'stone');
  assert(freshStone);
  assert.equal(wouldSupportPolicy(freshStone, 25), true);

  const remembered = structuredClone(fresh);
  const stoneState = remembered.members.find((member) => member.id === 'stone');
  assert(stoneState);
  stoneState.priorDissents = 2;
  stoneState.dissentStreak = 2;
  stoneState.lastSupportedChair = false;

  const rememberedStone = evaluateCommittee(economy, remembered).find((member) => member.id === 'stone');
  assert(rememberedStone);
  assert.equal(rememberedStone.preferredAction, freshStone.preferredAction);
  assert.equal(wouldSupportPolicy(rememberedStone, 25), false);
});

check('support resets dissent streak but not historical dissent count', () => {
  const economy = new EconomicSimulation(PHASE_2_SCENARIO).getState();
  const state = createInitialCommitteeState();
  const stoneState = state.members.find((member) => member.id === 'stone');
  assert(stoneState);
  stoneState.priorDissents = 1;
  stoneState.dissentStreak = 1;
  stoneState.lastSupportedChair = false;

  const views = evaluateCommittee(economy, state);
  const vote = tallyCommitteeVote(views, 0);
  const next = recordCommitteeMeeting(views, vote, state);
  const nextStone = next.members.find((member) => member.id === 'stone');
  assert.equal(nextStone?.priorDissents, 1);
  assert.equal(nextStone?.dissentStreak, 0);
  assert.equal(nextStone?.lastSupportedChair, true);
});

check('same choices reproduce the same two-meeting history', () => {
  const run = () => {
    const simulation = new EconomicSimulation(PHASE_2_SCENARIO);
    const first = resolvePrototypeMeeting(simulation, 'data_dependent', 0, {
      committeeState: createInitialCommitteeState(),
      persuasionAttempt: { targetId: 'price', argument: 'inflation' }
    });
    const second = resolvePrototypeMeeting(simulation, 'employment_risks', -25, {
      committeeState: first.committeeState
    });
    return JSON.stringify({
      firstVote: first.committeeVote,
      secondVote: second.committeeVote,
      committee: second.committeeState,
      economy: second.postMeetingState
    });
  };
  assert.equal(run(), run());
});

console.log('All executable two-meeting continuity smoke checks passed.');
