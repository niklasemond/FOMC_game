import { createInitialCommitteeState } from '../committee/members.ts';
import { MeetingSession } from '../session/sessionEngine.ts';
import type { MeetingSessionSnapshot } from '../session/types.ts';
import type { SaveGame, SaveGameV1, SaveGameV2, SaveGameV3 } from './saveSchema.ts';

export const BETA_SAVE_KEY = 'fomc-chair-game:beta-save:v3';

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface SaveMetadata {
  campaignMode?: 'warsh' | 'random';
  currentRoom?: string;
  createdAtIso?: string;
}

function completedOffsetFromLegacy(meetingIndex: number): number {
  if (!Number.isFinite(meetingIndex)) return 0;
  return Math.max(0, Math.floor(meetingIndex));
}

function legacySnapshot(save: SaveGameV1 | SaveGameV2): MeetingSessionSnapshot {
  const completedMeetingOffset = completedOffsetFromLegacy(save.meetingIndex);
  return {
    version: 1,
    maxMeetings: Math.max(4, completedMeetingOffset),
    completedMeetingOffset,
    simulation: structuredClone(save.simulation),
    committee: save.schemaVersion === 2
      ? structuredClone(save.committee)
      : createInitialCommitteeState(),
    history: []
  };
}

export function migrateSaveGameToV3(save: SaveGame): SaveGameV3 {
  if (save.schemaVersion === 3) return structuredClone(save);

  return {
    schemaVersion: 3,
    createdAtIso: save.createdAtIso,
    campaignSeed: save.campaignSeed,
    campaignMode: save.campaignMode,
    session: legacySnapshot(save),
    presentation: structuredClone(save.presentation)
  };
}

export function createSaveGameV3(
  session: MeetingSession,
  metadata: SaveMetadata = {}
): SaveGameV3 {
  const snapshot = session.snapshot();
  return {
    schemaVersion: 3,
    createdAtIso: metadata.createdAtIso ?? new Date().toISOString(),
    campaignSeed: snapshot.simulation.seed,
    campaignMode: metadata.campaignMode ?? 'random',
    session: snapshot,
    presentation: {
      currentRoom: metadata.currentRoom ?? 'meeting'
    }
  };
}

export function parseSaveGame(serialized: string): SaveGame {
  const parsed = JSON.parse(serialized) as Partial<SaveGame>;
  if (
    parsed.schemaVersion !== 1 &&
    parsed.schemaVersion !== 2 &&
    parsed.schemaVersion !== 3
  ) {
    throw new Error('Unsupported or missing save schema version');
  }
  return parsed as SaveGame;
}

export class BrowserSessionStore {
  constructor(
    private readonly storage: StorageLike,
    private readonly key = BETA_SAVE_KEY
  ) {}

  hasSave(): boolean {
    return this.storage.getItem(this.key) !== null;
  }

  save(session: MeetingSession, metadata: SaveMetadata = {}): SaveGameV3 {
    const payload = createSaveGameV3(session, metadata);
    this.storage.setItem(this.key, JSON.stringify(payload));
    return payload;
  }

  load(): MeetingSession | null {
    const serialized = this.storage.getItem(this.key);
    if (serialized === null) return null;
    const save = migrateSaveGameToV3(parseSaveGame(serialized));
    return MeetingSession.fromSnapshot(save.session);
  }

  inspect(): SaveGameV3 | null {
    const serialized = this.storage.getItem(this.key);
    if (serialized === null) return null;
    return migrateSaveGameToV3(parseSaveGame(serialized));
  }

  clear(): void {
    this.storage.removeItem(this.key);
  }
}
