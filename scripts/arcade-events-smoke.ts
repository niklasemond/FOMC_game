import assert from 'node:assert/strict';
import { ARCADE_EXTERNAL_EVENTS, applyArcadeEvent, eventForMeeting } from '../src/arcade/events.ts';
import { MeetingSession } from '../src/session/sessionEngine.ts';

assert.equal(ARCADE_EXTERNAL_EVENTS.length, 8);
assert.deepEqual(ARCADE_EXTERNAL_EVENTS.map((event) => event.meetingNumber), [1,2,3,4,5,6,7,8]);

const tariffSession = new MeetingSession({ maxMeetings: 8 });
const beforeTariff = tariffSession.getSimulationState();
applyArcadeEvent(tariffSession, eventForMeeting(1));
const afterTariff = tariffSession.getSimulationState();
assert(afterTariff.hidden.supplyPressure > beforeTariff.hidden.supplyPressure);
assert(afterTariff.hidden.inflationExpectations > beforeTariff.hidden.inflationExpectations);
assert.equal(afterTariff.period, beforeTariff.period);

const bankSession = new MeetingSession({ maxMeetings: 8 });
const beforeBank = bankSession.getSimulationState().hidden.creditStress;
applyArcadeEvent(bankSession, eventForMeeting(4));
assert(bankSession.getSimulationState().hidden.creditStress > beforeBank);

console.log('All executable arcade external-event smoke checks passed.');
