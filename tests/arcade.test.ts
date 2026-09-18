import { describe, expect, it } from 'vitest';
import { ARCADE_BEATS, presidentialReaction } from '../src/arcade/content.ts';
import { MeetingSession } from '../src/session/sessionEngine.ts';

describe('arcade 10-minute prototype', () => {
  it('defines exactly eight fast campaign beats', () => {
    expect(ARCADE_BEATS).toHaveLength(8);
    expect(new Set(ARCADE_BEATS.map((beat) => beat.id)).size).toBe(8);
  });

  it('can run eight meetings through the existing deterministic session engine', () => {
    const session = new MeetingSession({ maxMeetings: 8 });
    for (let i = 0; i < 8; i += 1) {
      session.resolve({ communicationChoiceId: 'data_dependent', policyAction: 0 });
    }
    expect(session.isComplete()).toBe(true);
    expect(session.getHistory()).toHaveLength(8);
    expect(session.getSimulationState().period).toBe(8);
  });

  it('keeps fictional presidential reactions short', () => {
    for (const action of [-50, -25, 0, 25, 50] as const) {
      expect(presidentialReaction(action).length).toBeLessThan(100);
    }
  });
});
