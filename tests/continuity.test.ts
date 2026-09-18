import { describe, expect, it } from 'vitest';
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

describe('two-meeting continuity', () => {
  it('carries persuasion relationship memory into the next meeting', () => {
    const simulation = new EconomicSimulation(PHASE_2_SCENARIO);
    const first = resolvePrototypeMeeting(
      simulation,
      'data_dependent',
      0,
      {
        committeeState: createInitialCommitteeState(),
        persuasionAttempt: { targetId: 'price', argument: 'inflation' }
      }
    );

    const priceState = first.committeeState.members.find((member) => member.id === 'price');
    const secondViews = evaluateCommittee(simulation.getState(), first.committeeState);
    const priceView = secondViews.find((member) => member.id === 'price');

    expect(first.persuasionOutcome.success).toBe(true);
    expect(priceState?.persuasionAttempts).toBe(1);
    expect(priceState?.relationshipWithChair).toBeGreaterThan(0.55);
    expect(priceView?.relationshipWithChair).toBe(priceState?.relationshipWithChair);
    expect(priceView?.persuasionAttempts).toBe(1);
    expect(priceView?.lastPreferredAction).toBe(25);
    expect(priceView?.lastSupportedChair).toBe(true);
  });

  it('records a dissent and exposes it at the next meeting', () => {
    const simulation = new EconomicSimulation(PHASE_2_SCENARIO);
    const first = resolvePrototypeMeeting(
      simulation,
      'data_dependent',
      25,
      { committeeState: createInitialCommitteeState() }
    );

    const fieldsState = first.committeeState.members.find((member) => member.id === 'fields');
    const secondView = evaluateCommittee(simulation.getState(), first.committeeState)
      .find((member) => member.id === 'fields');

    expect(fieldsState?.priorDissents).toBe(1);
    expect(fieldsState?.dissentStreak).toBe(1);
    expect(fieldsState?.lastSupportedChair).toBe(false);
    expect(fieldsState?.lastPreferredAction).toBe(-25);
    expect(secondView?.priorDissents).toBe(1);
    expect(secondView?.dissentStreak).toBe(1);
  });

  it('lets prior dissent create modest compromise inertia without changing beliefs', () => {
    const economy = new EconomicSimulation(PHASE_2_SCENARIO).getState();
    const freshState = createInitialCommitteeState();
    const freshStone = evaluateCommittee(economy, freshState).find((member) => member.id === 'stone');
    expect(freshStone).toBeDefined();
    expect(wouldSupportPolicy(freshStone!, 25)).toBe(true);

    const rememberedState = structuredClone(freshState);
    const stoneMemory = rememberedState.members.find((member) => member.id === 'stone');
    if (!stoneMemory) throw new Error('Missing Stone committee state');
    stoneMemory.priorDissents = 2;
    stoneMemory.dissentStreak = 2;
    stoneMemory.lastSupportedChair = false;

    const rememberedStone = evaluateCommittee(economy, rememberedState)
      .find((member) => member.id === 'stone');
    expect(rememberedStone?.preferredAction).toBe(freshStone?.preferredAction);
    expect(wouldSupportPolicy(rememberedStone!, 25)).toBe(false);
  });

  it('resets dissent streak after a member supports a later meeting', () => {
    const economy = new EconomicSimulation(PHASE_2_SCENARIO).getState();
    const state = createInitialCommitteeState();
    const stoneState = state.members.find((member) => member.id === 'stone');
    if (!stoneState) throw new Error('Missing Stone committee state');
    stoneState.priorDissents = 1;
    stoneState.dissentStreak = 1;
    stoneState.lastSupportedChair = false;

    const views = evaluateCommittee(economy, state);
    const vote = tallyCommitteeVote(views, 0);
    const next = recordCommitteeMeeting(views, vote, state);
    const rememberedStone = next.members.find((member) => member.id === 'stone');

    expect(rememberedStone?.priorDissents).toBe(1);
    expect(rememberedStone?.dissentStreak).toBe(0);
    expect(rememberedStone?.lastSupportedChair).toBe(true);
  });

  it('reproduces the same two-meeting sequence from the same seed and choices', () => {
    const run = () => {
      const simulation = new EconomicSimulation(PHASE_2_SCENARIO);
      const first = resolvePrototypeMeeting(
        simulation,
        'data_dependent',
        0,
        {
          committeeState: createInitialCommitteeState(),
          persuasionAttempt: { targetId: 'price', argument: 'inflation' }
        }
      );
      const second = resolvePrototypeMeeting(
        simulation,
        'employment_risks',
        -25,
        { committeeState: first.committeeState }
      );
      return {
        firstVote: first.committeeVote,
        secondVote: second.committeeVote,
        committee: second.committeeState,
        economy: second.postMeetingState
      };
    };

    expect(run()).toEqual(run());
  });
});
