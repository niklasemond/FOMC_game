import assert from 'node:assert/strict';
import { createInitialCommitteeState } from '../src/committee/members.ts';
import { MeetingSession } from '../src/session/sessionEngine.ts';
import { EconomicSimulation } from '../src/simulation/engine.ts';
import {
  BrowserSessionStore,
  migrateSaveGameToV3,
  type StorageLike
} from '../src/state/persistence.ts';
import type { SaveGameV2 } from '../src/state/saveSchema.ts';

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

function check(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

check('browser storage round-trips the full session', () => {
  const store = new BrowserSessionStore(new MemoryStorage());
  const session = new MeetingSession();
  session.resolve(path[0]);
  session.resolve(path[1]);
  store.save(session);
  assert.deepEqual(store.load()?.snapshot(), session.snapshot());
});

check('refresh continuation matches uninterrupted play', () => {
  const uninterrupted = new MeetingSession();
  const interrupted = new MeetingSession();
  const store = new BrowserSessionStore(new MemoryStorage());

  for (const decision of path.slice(0, 2)) {
    uninterrupted.resolve(decision);
    interrupted.resolve(decision);
  }
  store.save(interrupted);
  const restored = store.load();
  assert(restored);

  for (const decision of path.slice(2)) {
    uninterrupted.resolve(decision);
    restored.resolve(decision);
  }
  assert.deepEqual(restored.snapshot(), uninterrupted.snapshot());
});

check('v2 migration preserves committee relationship and meeting offset', () => {
  const simulation = new EconomicSimulation();
  const committee = createInitialCommitteeState();
  const price = committee.members.find((member) => member.id === 'price');
  assert(price);
  price.relationshipWithChair = 0.91;

  const legacy: SaveGameV2 = {
    schemaVersion: 2,
    createdAtIso: '2026-09-18T18:00:00.000Z',
    campaignSeed: simulation.getState().seed,
    campaignMode: 'random',
    meetingIndex: 2,
    simulation: simulation.getState(),
    committee,
    presentation: { currentRoom: 'meeting' }
  };

  const migrated = migrateSaveGameToV3(legacy);
  const restored = MeetingSession.fromSnapshot(migrated.session);
  const restoredPrice = restored.getCommitteeState().members.find((member) => member.id === 'price');
  assert.equal(restored.getCompletedMeetingCount(), 2);
  assert.equal(restored.getNextMeetingNumber(), 3);
  assert.equal(restoredPrice?.relationshipWithChair, 0.91);
  assert.deepEqual(restored.getHistory(), []);
});

console.log('All executable browser persistence smoke checks passed.');
