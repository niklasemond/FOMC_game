import { describe, expect, it } from 'vitest';
import { ARCADE_EXTERNAL_EVENTS, applyArcadeEvent, eventForMeeting } from '../src/arcade/events.ts';
import { presidentialReaction } from '../src/arcade/content.ts';
import { MeetingSession } from '../src/session/sessionEngine.ts';

describe('arcade external political events', () => {
  it('defines one external event for each of eight meetings', () => {
    expect(ARCADE_EXTERNAL_EVENTS).toHaveLength(8);
    expect(ARCADE_EXTERNAL_EVENTS.map((event) => event.meetingNumber)).toEqual([1,2,3,4,5,6,7,8]);
    expect(new Set(ARCADE_EXTERNAL_EVENTS.map((event) => event.id)).size).toBe(8);
  });

  it('tariff event actually changes the economy before the decision', () => {
    const session = new MeetingSession({ maxMeetings: 8 });
    const before = session.getSimulationState();
    const applied = applyArcadeEvent(session, eventForMeeting(1));
    const after = session.getSimulationState();

    expect(after.hidden.supplyPressure).toBeGreaterThan(before.hidden.supplyPressure);
    expect(after.hidden.inflationExpectations).toBeGreaterThan(before.hidden.inflationExpectations);
    expect(applied.visibleAfter.headlineInflation).toBeGreaterThan(applied.visibleBefore.headlineInflation);
    expect(after.period).toBe(before.period);
  });

  it('White House pressure can hit credibility without pretending a meeting occurred', () => {
    const session = new MeetingSession({ maxMeetings: 8 });
    session.resolve({ communicationChoiceId: 'data_dependent', policyAction: 0 });
    const before = session.getSimulationState();
    applyArcadeEvent(session, eventForMeeting(2));
    const after = session.getSimulationState();

    expect(after.hidden.credibility).toBeLessThan(before.hidden.credibility);
    expect(after.period).toBe(before.period);
    expect(session.getCompletedMeetingCount()).toBe(1);
  });

  it('bank stress event raises credit stress', () => {
    const session = new MeetingSession({ maxMeetings: 8 });
    const before = session.getSimulationState().hidden.creditStress;
    applyArcadeEvent(session, eventForMeeting(4));
    expect(session.getSimulationState().hidden.creditStress).toBeGreaterThan(before);
  });

  it('presidential reactions use a more combative fictional register', () => {
    expect(presidentialReaction(0)).toContain('WAY');
    expect(presidentialReaction(50)).toContain('disaster');
    expect(presidentialReaction(-50)).toContain('BIG CUT');
  });
});
