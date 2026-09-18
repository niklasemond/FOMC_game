import type { SimulationState } from '../simulation/types.ts';

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

export type SaveGame = SaveGameV1;
