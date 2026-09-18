import { EconomicSimulation } from '../simulation/engine.ts';
import type { PolicyAction, SimulationState } from '../simulation/types.ts';
import {
  attemptPersuasion,
  committeeCredibilityImpulse,
  evaluateCommittee,
  expectedCommitteeAction,
  tallyCommitteeVote
} from '../committee/committeeEngine.ts';
import { createInitialCommitteeState } from '../committee/members.ts';
import type { CommitteeState, PersuasionAttempt } from '../committee/types.ts';
import { getAdviserViews } from './advisers.ts';
import { COMMUNICATION_CHOICES } from './content.ts';
import type {
  BriefingItem,
  CommunicationChoiceId,
  MarketReaction,
  MeetingResult
} from './types.ts';

const round = (value: number, digits = 2): number => Number(value.toFixed(digits));

export function createStaffBriefing(state: SimulationState): BriefingItem[] {
  const v = state.visible;
  return [
    {
      label: 'Core inflation',
      value: `${v.coreInflation.toFixed(1)}%`,
      interpretation: v.coreInflation >= 2.8 ? 'Still materially above target.' : 'Closer to target, though not fully there.'
    },
    {
      label: 'Labor market',
      value: `${v.unemployment.toFixed(1)}% / ${v.payrollGrowth.toFixed(0)}k`,
      interpretation: v.payrollGrowth < 100 ? 'Hiring has cooled enough to raise downside-risk questions.' : 'Hiring remains reasonably firm.'
    },
    {
      label: 'Wage growth',
      value: `${v.wageGrowth.toFixed(1)}%`,
      interpretation: v.wageGrowth > 3.5 ? 'Still somewhat inconsistent with a fully settled inflation picture.' : 'No longer flashing obvious overheating.'
    },
    {
      label: 'Financial conditions',
      value: v.financialConditions.toFixed(2),
      interpretation: v.financialConditions > 1 ? 'Restrictive conditions are already leaning on activity.' : 'Conditions are not unusually restrictive.'
    },
    {
      label: 'Inflation expectations',
      value: `${v.inflationExpectations.toFixed(1)}%`,
      interpretation: v.inflationExpectations > 2.4 ? 'Still above the comfort zone; credibility matters.' : 'Relatively well contained.'
    }
  ];
}

function calculateMarketReaction(
  state: SimulationState,
  expectedPolicyAction: PolicyAction,
  policyAction: PolicyAction,
  guidanceBias: -1 | 0 | 1
): MarketReaction {
  const surprise = policyAction - expectedPolicyAction;
  const treasuryYieldDeltaBp = Math.round(0.42 * surprise + 9 * guidanceBias);
  const financialConditionsDelta = round(treasuryYieldDeltaBp * 0.0035, 2);
  const stressAdjustment = Math.max(0, state.visible.marketStress - 0.25) * 18;
  const equitySignal = treasuryYieldDeltaBp + stressAdjustment;
  const equityTone: MarketReaction['equityTone'] = equitySignal >= 14 ? 'selloff' : equitySignal <= -10 ? 'relief rally' : 'mixed';

  const direction = treasuryYieldDeltaBp > 4 ? 'rose' : treasuryYieldDeltaBp < -4 ? 'fell' : 'were little changed';
  const summary = `Long-term yields ${direction} by roughly ${Math.abs(treasuryYieldDeltaBp)}bp as markets processed the decision and guidance; equities were ${equityTone}.`;

  return {
    expectedPolicyAction,
    policySurpriseBp: surprise,
    treasuryYieldDeltaBp,
    financialConditionsDelta,
    equityTone,
    summary
  };
}

function explainResult(pre: SimulationState, post: SimulationState, result: MarketReaction): string[] {
  const explanations: string[] = [result.summary];
  const coreMove = post.visible.coreInflation - pre.visible.coreInflation;
  const unemploymentMove = post.visible.unemployment - pre.visible.unemployment;

  if (Math.abs(coreMove) >= 0.08) {
    explanations.push(coreMove < 0
      ? 'Core inflation eased over the next intermeeting interval, although the move reflects both policy and the economy already in motion.'
      : 'Core inflation remained sticky over the next intermeeting interval despite the policy decision.');
  } else {
    explanations.push('Core inflation barely moved over one interval, a reminder that monetary policy works with lags.');
  }

  if (unemploymentMove >= 0.08) {
    explanations.push('Labor-market cooling became more visible as unemployment moved higher.');
  } else if (unemploymentMove <= -0.08) {
    explanations.push('Labor conditions firmed somewhat over the interval.');
  } else {
    explanations.push('The labor market changed only modestly over the interval.');
  }

  return explanations;
}

export interface ResolvePrototypeMeetingOptions {
  committeeState?: CommitteeState;
  persuasionAttempt?: PersuasionAttempt;
}

export function resolvePrototypeMeeting(
  simulation: EconomicSimulation,
  communicationChoiceId: CommunicationChoiceId,
  policyAction: PolicyAction,
  options: ResolvePrototypeMeetingOptions = {}
): MeetingResult {
  const preMeetingState = simulation.getState();
  const adviserViews = getAdviserViews(preMeetingState);
  const startingCommitteeState = options.committeeState ?? createInitialCommitteeState();
  const committeeViews = evaluateCommittee(preMeetingState, startingCommitteeState);
  const communicationChoice = COMMUNICATION_CHOICES.find((choice) => choice.id === communicationChoiceId);
  if (!communicationChoice) throw new Error(`Unknown communication choice: ${communicationChoiceId}`);

  const expectedPolicyAction = expectedCommitteeAction(committeeViews);
  const marketReaction = calculateMarketReaction(
    preMeetingState,
    expectedPolicyAction,
    policyAction,
    communicationChoice.guidanceBias
  );

  const persuasion = attemptPersuasion(
    committeeViews,
    startingCommitteeState,
    policyAction,
    options.persuasionAttempt
  );
  const committeeVote = tallyCommitteeVote(committeeViews, policyAction, persuasion.outcome);

  simulation.setPolicy(policyAction);
  const communicationTransmission = simulation.applyCommunication(
    communicationChoice.guidanceBias,
    policyAction
  );
  const committeeCredibilityDelta = simulation.applyInstitutionalCredibility(
    committeeCredibilityImpulse(committeeVote)
  );
  const postMeetingState = simulation.advance();

  const communicationCredibilityDeltaPoints = round(communicationTransmission.credibilityDelta * 100, 1);
  const committeeCredibilityDeltaPoints = round(committeeCredibilityDelta * 100, 1);

  return {
    preMeetingState,
    postMeetingState,
    policyAction,
    communicationChoice,
    communicationExpectationsDeltaBp: Math.round(communicationTransmission.inflationExpectationsDelta * 100),
    communicationCredibilityDeltaPoints,
    committeeCredibilityDeltaPoints,
    credibilityDeltaPoints: round(communicationCredibilityDeltaPoints + committeeCredibilityDeltaPoints, 1),
    adviserViews,
    committeeViews,
    committeeState: persuasion.committeeState,
    committeeVote,
    persuasionOutcome: persuasion.outcome,
    marketReaction,
    explanation: explainResult(preMeetingState, postMeetingState, marketReaction)
  };
}
