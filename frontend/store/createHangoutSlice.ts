import { create, StateCreator } from "zustand";

export interface HangoutDetails {
  hangoutName: string;
  hangoutDescription: string;
}

export interface HangoutSlice {
  hangoutDetails: HangoutDetails | null;
  setHangoutDetails: (details: HangoutDetails | null) => void;
}

export const createHangoutSlice: StateCreator<HangoutSlice> = (set) => ({
  hangoutDetails: {
    hangoutName: "",
    hangoutDescription: "",
  },
  setHangoutDetails: (details) => set({ hangoutDetails: details }),
});
