import assert from 'node:assert/strict';
import { MeetingSession } from '../src/session/sessionEngine.ts';

const path = [
  { communicationChoiceId: 'data_dependent', policyAction: 0, persuasionAttempt: { targetId: 'price', argument: 'inflation' } },
  { communicationChoiceId: 'employment_risks', policyAction: -25 },
  { communicationChoiceId: 'data_dependent', policyAction: 0, persuasionAttempt: { targetId: 'fields', argument: 'employment' } },
  { communicationChoiceId: 'inflation_confidence', policyAction: 25 }
] as const;

function check(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

check('four meetings create sequential history', () => {
  const session = new MeetingSession();
  for (const decision of path) session.resolve(decision);
  const history = session.getHistory();

  assert.equal(history.length, 4);
  assert.deepEqual(history.map((record) => record.meetingNumber), [1, 2, 3, 4]);
  assert.deepEqual(history.map((record) => [record.periodBefore, record.periodAfter]), [[0, 1], [1, 2], [2, 3], [3, 4]]);
  assert.equal(session.isComplete(), true);
});

check('save/restore continuation matches uninterrupted play', () => {
  const uninterrupted = new MeetingSession();
  const interrupted = new MeetingSession();

  for (const decision of path.slice(0, 2)) {
    uninterrupted.resolve(decision);
    interrupted.resolve(decision);
  }

  const restored = MeetingSession.restore(interrupted.serialize());

  for (const decision of path.slice(2)) {
    uninterrupted.resolve(decision);
    restored.resolve(decision);
  }

  assert.deepEqual(restored.snapshot(), uninterrupted.snapshot());
});

check('committee memory survives save/restore', () => {
  const session = new MeetingSession();
  session.resolve(path[0]);
  const before = session.getCommitteeState().members.find((member) => member.id === 'price');
  const restored = MeetingSession.restore(session.serialize());
  const after = restored.getCommitteeState().members.find((member) => member.id === 'price');

  assert.deepEqual(after, before);
  assert.equal(after?.persuasionAttempts, 1);
  assert.equal(after?.lastSupportedChair, true);
});

check('four-meeting session is deterministic', () => {
  const run = () => {
    const session = new MeetingSession();
    for (const decision of path) session.resolve(decision);
    return JSON.stringify(session.snapshot());
  };
  assert.equal(run(), run());
});

check('session cap prevents accidental campaign expansion', () => {
  const session = new MeetingSession({ maxMeetings: 2 });
  session.resolve(path[0]);
  session.resolve(path[1]);
  assert.throws(() => session.resolve(path[2]), /complete after 2 meetings/);
});

console.log('All executable multi-meeting session smoke checks passed.');
