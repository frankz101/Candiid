import { create, StateCreator } from "zustand";

export interface HangoutDetails {
  hangoutName: string;
  postPositionX?: number;
  postPositionY?: number;
  // Add more like friends, locations, etc
}

export interface HangoutSlice {
  hangoutDetails: HangoutDetails | null;
  setHangoutDetails: (details: HangoutDetails | null) => void;
}

export const createHangoutSlice: StateCreator<HangoutSlice> = (set) => ({
  hangoutDetails: null,
  setHangoutDetails: (details) => set({ hangoutDetails: details }),
});
