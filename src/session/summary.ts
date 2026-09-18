import type { CommitteeMemberId } from '../committee/types.ts';
import type { PolicyAction, VisibleIndicators } from '../simulation/types.ts';
import type { MeetingSession } from './sessionEngine.ts';

export interface SessionMemberSummary {
  id: CommitteeMemberId;
  relationshipWithChair: number;
  priorDissents: number;
  dissentStreak: number;
  persuasionAttempts: number;
}

export interface SessionSummary {
  completedMeetings: number;
  detailedHistoryMeetings: number;
  legacyMeetingOffset: number;
  maxMeetings: number;
  isComplete: boolean;
  policyPath: PolicyAction[];
  voteMargins: string[];
  totalDissents: number;
  latestVisible: VisibleIndicators;
  members: SessionMemberSummary[];
}

export function buildSessionSummary(session: MeetingSession): SessionSummary {
  const history = session.getHistory();
  const committee = session.getCommitteeState();

  return {
    completedMeetings: session.getCompletedMeetingCount(),
    detailedHistoryMeetings: history.length,
    legacyMeetingOffset: session.getCompletedMeetingOffset(),
    maxMeetings: session.getMaxMeetings(),
    isComplete: session.isComplete(),
    policyPath: history.map((record) => record.policyAction),
    voteMargins: history.map(
      (record) => `${record.committeeVote.supportCount}-${record.committeeVote.dissentCount}`
    ),
    totalDissents: history.reduce(
      (sum, record) => sum + record.committeeVote.dissentCount,
      0
    ),
    latestVisible: structuredClone(session.getSimulationState().visible),
    members: committee.members.map((member) => ({
      id: member.id,
      relationshipWithChair: member.relationshipWithChair,
      priorDissents: member.priorDissents ?? 0,
      dissentStreak: member.dissentStreak ?? 0,
      persuasionAttempts: member.persuasionAttempts ?? 0
    }))
  };
}
