import type { CommitteeState } from '../committee/types.ts';
import type { SimulationState } from '../simulation/types.ts';
import type { MeetingSessionSnapshot } from '../session/types.ts';

export interface SaveGameV1 {
  schemaVersion: 1;
  createdAtIso: string;
  campaignSeed: number;
  campaignMode: 'warsh' | 'random';
  meetingIndex: number;
  simulation: SimulationState;
  presentation: {
    currentRoom: string;
  };
}

export interface SaveGameV2 {
  schemaVersion: 2;
  createdAtIso: string;
  campaignSeed: number;
  campaignMode: 'warsh' | 'random';
  meetingIndex: number;
  simulation: SimulationState;
  committee: CommitteeState;
  presentation: {
    currentRoom: string;
  };
}

export interface SaveGameV3 {
  schemaVersion: 3;
  createdAtIso: string;
  campaignSeed: number;
  campaignMode: 'warsh' | 'random';
  session: MeetingSessionSnapshot;
  presentation: {
    currentRoom: string;
  };
}

export type SaveGame = SaveGameV1 | SaveGameV2 | SaveGameV3;
