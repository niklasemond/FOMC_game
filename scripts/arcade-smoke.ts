import assert from 'node:assert/strict';
import { ARCADE_BEATS } from '../src/arcade/content.ts';
import { MeetingSession } from '../src/session/sessionEngine.ts';

assert.equal(ARCADE_BEATS.length, 8);
assert.equal(new Set(ARCADE_BEATS.map((beat) => beat.id)).size, 8);

const session = new MeetingSession({ maxMeetings: 8 });
for (let i = 0; i < 8; i += 1) {
  session.resolve({ communicationChoiceId: 'data_dependent', policyAction: 0 });
}
assert.equal(session.isComplete(), true);
assert.equal(session.getHistory().length, 8);
assert.equal(session.getSimulationState().period, 8);

console.log('All executable arcade flow smoke checks passed.');
