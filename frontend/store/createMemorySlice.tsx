import { StateCreator } from "zustand";

export interface MemoryDetails {
  id?: string;
  postX: number;
  postY: number;
  scale: number;
  rotation: number;
  modified?: boolean;
}

export interface MemorySlice {
  memories: MemoryDetails[];
  addMemory: (sticker: MemoryDetails) => void;
  updateMemory: (id: string, changes: Partial<MemoryDetails>) => void;
  removeMemory: (id: string) => void;
}

export const createMemorySlice: StateCreator<MemorySlice> = (set) => ({
  memories: [],

  addMemory: (memory: MemoryDetails) =>
    set((state) => ({
      memories: [...state.memories, { ...memory, modified: false }],
    })),

  updateMemory: (id: string, changes: Partial<MemoryDetails>) =>
    set((state) => ({
      memories: state.memories.map((memory) =>
        memory.id === id
          ? {
              ...memory,
              ...changes,
              modified:
                memory.postX !== changes.postX ||
                memory.postY !== changes.postY ||
                memory.scale !== changes.scale ||
                memory.rotation !== changes.rotation,
            }
          : memory
      ),
    })),

  removeMemory: (id: string) =>
    set((state) => ({
      memories: state.memories.filter((memory) => memory.id !== id),
    })),
});
