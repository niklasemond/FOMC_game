import { createInitialCommitteeState } from '../committee/members.ts';
import type { CommitteeState } from '../committee/types.ts';
import { PHASE_2_SCENARIO } from '../meeting/content.ts';
import { resolvePrototypeMeeting } from '../meeting/meetingEngine.ts';
import type { MeetingResult } from '../meeting/types.ts';
import { EconomicSimulation } from '../simulation/engine.ts';
import type {
  MeetingSessionSnapshot,
  SessionDecision,
  SessionMeetingRecord
} from './types.ts';

const DEFAULT_PROTOTYPE_MEETINGS = 4;

export interface CreateMeetingSessionOptions {
  simulation?: EconomicSimulation;
  committeeState?: CommitteeState;
  history?: SessionMeetingRecord[];
  maxMeetings?: number;
  completedMeetingOffset?: number;
}

export class MeetingSession {
  private simulation: EconomicSimulation;
  private committeeState: CommitteeState;
  private history: SessionMeetingRecord[];
  private readonly maxMeetings: number;
  private readonly completedMeetingOffset: number;

  constructor(options: CreateMeetingSessionOptions = {}) {
    this.simulation = options.simulation ?? new EconomicSimulation(PHASE_2_SCENARIO);
    this.committeeState = structuredClone(options.committeeState ?? createInitialCommitteeState());
    this.history = structuredClone(options.history ?? []);
    this.maxMeetings = options.maxMeetings ?? DEFAULT_PROTOTYPE_MEETINGS;
    this.completedMeetingOffset = options.completedMeetingOffset ?? 0;

    if (!Number.isInteger(this.maxMeetings) || this.maxMeetings < 1) {
      throw new Error('maxMeetings must be a positive integer');
    }
    if (!Number.isInteger(this.completedMeetingOffset) || this.completedMeetingOffset < 0) {
      throw new Error('completedMeetingOffset must be a non-negative integer');
    }
    if (this.completedMeetingOffset + this.history.length > this.maxMeetings) {
      throw new Error('Meeting history exceeds the session meeting cap');
    }
  }

  getSimulationState() {
    return this.simulation.getState();
  }

  getCommitteeState(): CommitteeState {
    return structuredClone(this.committeeState);
  }

  getHistory(): SessionMeetingRecord[] {
    return structuredClone(this.history);
  }

  getCompletedMeetingCount(): number {
    return this.completedMeetingOffset + this.history.length;
  }

  getCompletedMeetingOffset(): number {
    return this.completedMeetingOffset;
  }

  getNextMeetingNumber(): number {
    return this.getCompletedMeetingCount() + 1;
  }

  getMaxMeetings(): number {
    return this.maxMeetings;
  }

  isComplete(): boolean {
    return this.getCompletedMeetingCount() >= this.maxMeetings;
  }

  resolve(decision: SessionDecision): MeetingResult {
    if (this.isComplete()) {
      throw new Error(`Session is complete after ${this.maxMeetings} meetings`);
    }

    const meetingNumber = this.getNextMeetingNumber();
    const result = resolvePrototypeMeeting(
      this.simulation,
      decision.communicationChoiceId,
      decision.policyAction,
      {
        committeeState: this.committeeState,
        persuasionAttempt: decision.persuasionAttempt
      }
    );

    this.committeeState = structuredClone(result.committeeState);
    this.history.push({
      meetingNumber,
      periodBefore: result.preMeetingState.period,
      periodAfter: result.postMeetingState.period,
      communicationChoiceId: decision.communicationChoiceId,
      policyAction: decision.policyAction,
      persuasionAttempt: decision.persuasionAttempt
        ? structuredClone(decision.persuasionAttempt)
        : null,
      persuasionOutcome: structuredClone(result.persuasionOutcome),
      committeeVote: structuredClone(result.committeeVote),
      marketReaction: structuredClone(result.marketReaction),
      credibilityDeltaPoints: result.credibilityDeltaPoints,
      visibleBefore: structuredClone(result.preMeetingState.visible),
      visibleAfter: structuredClone(result.postMeetingState.visible)
    });

    return result;
  }

  snapshot(): MeetingSessionSnapshot {
    return {
      version: 1,
      maxMeetings: this.maxMeetings,
      completedMeetingOffset: this.completedMeetingOffset,
      simulation: this.simulation.getState(),
      committee: structuredClone(this.committeeState),
      history: structuredClone(this.history)
    };
  }

  serialize(): string {
    return JSON.stringify(this.snapshot());
  }

  static restore(serialized: string): MeetingSession {
    const snapshot = JSON.parse(serialized) as MeetingSessionSnapshot;
    return MeetingSession.fromSnapshot(snapshot);
  }

  static fromSnapshot(snapshot: MeetingSessionSnapshot): MeetingSession {
    if (snapshot.version !== 1) {
      throw new Error(`Unsupported meeting-session version: ${String(snapshot.version)}`);
    }
    if (!Array.isArray(snapshot.history)) {
      throw new Error('Invalid meeting-session history');
    }
    const completedMeetingOffset = snapshot.completedMeetingOffset ?? 0;
    if (completedMeetingOffset + snapshot.history.length > snapshot.maxMeetings) {
      throw new Error('Meeting history exceeds the session meeting cap');
    }

    const simulation = EconomicSimulation.restore(JSON.stringify(snapshot.simulation));
    return new MeetingSession({
      simulation,
      committeeState: snapshot.committee,
      history: snapshot.history,
      maxMeetings: snapshot.maxMeetings,
      completedMeetingOffset
    });
  }
}
