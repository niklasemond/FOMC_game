import type { GuidanceBias, PolicyAction, SimulationState } from '../simulation/types.ts';

export type CommunicationChoiceId = 'inflation_confidence' | 'data_dependent' | 'employment_risks';

export interface CommunicationChoice {
  id: CommunicationChoiceId;
  label: string;
  statement: string;
  guidanceBias: GuidanceBias;
  tradeoffHint: string;
}

export interface BriefingItem {
  label: string;
  value: string;
  interpretation: string;
}

export interface AdviserView {
  id: 'price' | 'fields' | 'bond';
  name: string;
  role: string;
  portraitGlyph: string;
  preferredAction: PolicyAction;
  confidence: number;
  headline: string;
  rationale: string;
}

export interface MarketReaction {
  expectedPolicyAction: PolicyAction;
  policySurpriseBp: number;
  treasuryYieldDeltaBp: number;
  financialConditionsDelta: number;
  equityTone: 'relief rally' | 'mixed' | 'selloff';
  summary: string;
}

export interface MeetingResult {
  preMeetingState: SimulationState;
  postMeetingState: SimulationState;
  policyAction: PolicyAction;
  communicationChoice: CommunicationChoice;
  communicationExpectationsDeltaBp: number;
  credibilityDeltaPoints: number;
  adviserViews: AdviserView[];
  marketReaction: MarketReaction;
  likelySupport: number;
  likelyDissents: number;
  explanation: string[];
}
