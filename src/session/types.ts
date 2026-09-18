import type {
  CommitteeState,
  CommitteeVote,
  PersuasionAttempt,
  PersuasionOutcome
} from '../committee/types.ts';
import type {
  CommunicationChoiceId,
  MarketReaction
} from '../meeting/types.ts';
import type {
  PolicyAction,
  SimulationState,
  VisibleIndicators
} from '../simulation/types.ts';

export interface SessionDecision {
  communicationChoiceId: CommunicationChoiceId;
  policyAction: PolicyAction;
  persuasionAttempt?: PersuasionAttempt;
}

export interface SessionMeetingRecord {
  meetingNumber: number;
  periodBefore: number;
  periodAfter: number;
  communicationChoiceId: CommunicationChoiceId;
  policyAction: PolicyAction;
  persuasionAttempt: PersuasionAttempt | null;
  persuasionOutcome: PersuasionOutcome;
  committeeVote: CommitteeVote;
  marketReaction: MarketReaction;
  credibilityDeltaPoints: number;
  visibleBefore: VisibleIndicators;
  visibleAfter: VisibleIndicators;
}

export interface MeetingSessionSnapshot {
  version: 1;
  maxMeetings: number;
  completedMeetingOffset?: number;
  simulation: SimulationState;
  committee: CommitteeState;
  history: SessionMeetingRecord[];
}
