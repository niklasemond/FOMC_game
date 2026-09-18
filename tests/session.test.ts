import { describe, expect, it } from 'vitest';
import { MeetingSession } from '../src/session/sessionEngine.ts';

const FOUR_MEETING_PATH = [
  { communicationChoiceId: 'data_dependent', policyAction: 0, persuasionAttempt: { targetId: 'price', argument: 'inflation' } },
  { communicationChoiceId: 'employment_risks', policyAction: -25 },
  { communicationChoiceId: 'data_dependent', policyAction: 0, persuasionAttempt: { targetId: 'fields', argument: 'employment' } },
  { communicationChoiceId: 'inflation_confidence', policyAction: 25 }
] as const;

describe('meeting session', () => {
  it('records a concise sequential history across four meetings', () => {
    const session = new MeetingSession();

    for (const decision of FOUR_MEETING_PATH) {
      session.resolve(decision);
    }

    const history = session.getHistory();
    expect(history).toHaveLength(4);
    expect(history.map((record) => record.meetingNumber)).toEqual([1, 2, 3, 4]);
    expect(history.map((record) => [record.periodBefore, record.periodAfter])).toEqual([
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4]
    ]);
    expect(session.isComplete()).toBe(true);
    expect(history[0]?.committeeVote.totalVotes).toBe(9);
    expect(history[0]?.visibleBefore.coreInflation).toBeTypeOf('number');
    expect(history[3]?.visibleAfter.unemployment).toBeTypeOf('number');
  });

  it('restores after two meetings and continues identically', () => {
    const uninterrupted = new MeetingSession();
    const interrupted = new MeetingSession();

    for (const decision of FOUR_MEETING_PATH.slice(0, 2)) {
      uninterrupted.resolve(decision);
      interrupted.resolve(decision);
    }

    const restored = MeetingSession.restore(interrupted.serialize());

    for (const decision of FOUR_MEETING_PATH.slice(2)) {
      uninterrupted.resolve(decision);
      restored.resolve(decision);
    }

    expect(restored.snapshot()).toEqual(uninterrupted.snapshot());
  });

  it('preserves committee memory through session save and restore', () => {
    const session = new MeetingSession();
    session.resolve(FOUR_MEETING_PATH[0]);

    const before = session.getCommitteeState().members.find((member) => member.id === 'price');
    const restored = MeetingSession.restore(session.serialize());
    const after = restored.getCommitteeState().members.find((member) => member.id === 'price');

    expect(after).toEqual(before);
    expect(after?.persuasionAttempts).toBe(1);
    expect(after?.lastSupportedChair).toBe(true);
  });

  it('is deterministic for the same four-meeting decision path', () => {
    const run = () => {
      const session = new MeetingSession();
      for (const decision of FOUR_MEETING_PATH) session.resolve(decision);
      return session.snapshot();
    };

    expect(run()).toEqual(run());
  });

  it('refuses to resolve beyond the configured prototype cap', () => {
    const session = new MeetingSession({ maxMeetings: 2 });
    session.resolve(FOUR_MEETING_PATH[0]);
    session.resolve(FOUR_MEETING_PATH[1]);

    expect(session.isComplete()).toBe(true);
    expect(() => session.resolve(FOUR_MEETING_PATH[2])).toThrow(/complete after 2 meetings/);
  });
});
