import type { PolicyAction, SimulationState } from '../simulation/types.ts';

export type CommitteeMemberId =
  | 'price'
  | 'fields'
  | 'stone'
  | 'reed'
  | 'quill'
  | 'harbor'
  | 'vega'
  | 'vale';

export type PersuasionArgument = 'inflation' | 'employment' | 'stability';

export interface CommitteeMemberDefinition {
  id: CommitteeMemberId;
  name: string;
  role: string;
  portraitGlyph: string;
  policyBias: number;
  inflationSensitivity: number;
  employmentSensitivity: number;
  financialStabilitySensitivity: number;
  stubbornness: number;
  consensusSeeking: number;
  initialRelationshipWithChair: number;
  communicationStyle: string;
}

export interface CommitteeMemberState {
  id: CommitteeMemberId;
  relationshipWithChair: number;
}

export interface CommitteeState {
  members: CommitteeMemberState[];
}

export interface CommitteeMemberView {
  id: CommitteeMemberId;
  name: string;
  role: string;
  portraitGlyph: string;
  preferredAction: PolicyAction;
  score: number;
  confidence: number;
  uncertainty: number;
  relationshipWithChair: number;
  stubbornness: number;
  consensusSeeking: number;
  inflationSensitivity: number;
  employmentSensitivity: number;
  financialStabilitySensitivity: number;
  rationale: string;
}

export interface CommitteeVoteLine {
  memberId: CommitteeMemberId;
  memberName: string;
  preferredAction: PolicyAction;
  supportsChair: boolean;
  persuaded: boolean;
  reason: string;
}

export interface CommitteeVote {
  policyAction: PolicyAction;
  supportCount: number;
  dissentCount: number;
  totalVotes: number;
  lines: CommitteeVoteLine[];
  fragmentation: 'unanimous' | 'minor dissent' | 'divided' | 'deeply divided';
}

export interface PersuasionAttempt {
  targetId: CommitteeMemberId;
  argument: PersuasionArgument;
}

export interface PersuasionOutcome {
  attempted: boolean;
  targetId: CommitteeMemberId | null;
  targetName: string | null;
  argument: PersuasionArgument | null;
  success: boolean;
  relationshipDelta: number;
  reason: string;
}

export interface CommitteeMeetingSnapshot {
  economy: SimulationState;
  committee: CommitteeState;
  views: CommitteeMemberView[];
}
