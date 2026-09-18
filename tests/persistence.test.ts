import { describe, expect, it } from 'vitest';
import { createInitialCommitteeState } from '../src/committee/members.ts';
import { MeetingSession } from '../src/session/sessionEngine.ts';
import { EconomicSimulation } from '../src/simulation/engine.ts';
import {
  BrowserSessionStore,
  migrateSaveGameToV3,
  type StorageLike
} from '../src/state/persistence.ts';
import type { SaveGameV1, SaveGameV2 } from '../src/state/saveSchema.ts';

class MemoryStorage implements StorageLike {
  private values = new Map<string, string>();
  getItem(key: string): string | null { return this.values.get(key) ?? null; }
  setItem(key: string, value: string): void { this.values.set(key, value); }
  removeItem(key: string): void { this.values.delete(key); }
}

const path = [
  { communicationChoiceId: 'data_dependent', policyAction: 0, persuasionAttempt: { targetId: 'price', argument: 'inflation' } },
  { communicationChoiceId: 'employment_risks', policyAction: -25 },
  { communicationChoiceId: 'data_dependent', policyAction: 0 },
  { communicationChoiceId: 'inflation_confidence', policyAction: 25 }
] as const;

describe('browser persistence', () => {
  it('round-trips a live session through storage', () => {
    const storage = new MemoryStorage();
    const store = new BrowserSessionStore(storage);
    const session = new MeetingSession();
    session.resolve(path[0]);
    session.resolve(path[1]);

    store.save(session, { createdAtIso: '2026-09-18T18:00:00.000Z' });
    const loaded = store.load();

    expect(store.hasSave()).toBe(true);
    expect(loaded?.snapshot()).toEqual(session.snapshot());
  });

  it('continues identically after a simulated browser refresh', () => {
    const uninterrupted = new MeetingSession();
    const interrupted = new MeetingSession();
    const store = new BrowserSessionStore(new MemoryStorage());

    for (const decision of path.slice(0, 2)) {
      uninterrupted.resolve(decision);
      interrupted.resolve(decision);
    }

    store.save(interrupted);
    const restored = store.load();
    expect(restored).not.toBeNull();

    for (const decision of path.slice(2)) {
      uninterrupted.resolve(decision);
      restored!.resolve(decision);
    }

    expect(restored!.snapshot()).toEqual(uninterrupted.snapshot());
  });

  it('migrates a v1 development save without inventing detailed history', () => {
    const simulation = new EconomicSimulation();
    const legacy: SaveGameV1 = {
      schemaVersion: 1,
      createdAtIso: '2026-09-18T18:00:00.000Z',
      campaignSeed: simulation.getState().seed,
      campaignMode: 'random',
      meetingIndex: 2,
      simulation: simulation.getState(),
      presentation: { currentRoom: 'meeting' }
    };

    const migrated = migrateSaveGameToV3(legacy);
    const restored = MeetingSession.fromSnapshot(migrated.session);

    expect(migrated.session.completedMeetingOffset).toBe(2);
    expect(migrated.session.history).toEqual([]);
    expect(restored.getCompletedMeetingCount()).toBe(2);
    expect(restored.getNextMeetingNumber()).toBe(3);
    expect(restored.getCommitteeState().members).toHaveLength(8);
  });

  it('preserves committee state when migrating v2', () => {
    const simulation = new EconomicSimulation();
    const committee = createInitialCommitteeState();
    const price = committee.members.find((member) => member.id === 'price');
    if (!price) throw new Error('Missing Price state');
    price.relationshipWithChair = 0.91;

    const legacy: SaveGameV2 = {
      schemaVersion: 2,
      createdAtIso: '2026-09-18T18:00:00.000Z',
      campaignSeed: simulation.getState().seed,
      campaignMode: 'random',
      meetingIndex: 1,
      simulation: simulation.getState(),
      committee,
      presentation: { currentRoom: 'meeting' }
    };

    const migrated = migrateSaveGameToV3(legacy);
    const restoredPrice = MeetingSession.fromSnapshot(migrated.session)
      .getCommitteeState().members.find((member) => member.id === 'price');

    expect(migrated.session.completedMeetingOffset).toBe(1);
    expect(restoredPrice?.relationshipWithChair).toBe(0.91);
  });

  it('can clear the local beta save', () => {
    const store = new BrowserSessionStore(new MemoryStorage());
    store.save(new MeetingSession());
    expect(store.hasSave()).toBe(true);
    store.clear();
    expect(store.hasSave()).toBe(false);
    expect(store.load()).toBeNull();
  });
});
