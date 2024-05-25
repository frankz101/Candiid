import { create, StateCreator } from "zustand";

export interface HangoutDetails {
  hangoutName: string;
  hangoutDescription: string;
  postPositionX?: number;
  postPositionY?: number;
  selectedFriends: string[];
  // Add more like friends, locations, etc
}

export interface HangoutSlice {
  hangoutDetails: HangoutDetails | null;
  setHangoutDetails: (details: HangoutDetails | null) => void;
  addFriend: (userId: string) => void;
  removeFriend: (userId: string) => void;
}

export const createHangoutSlice: StateCreator<HangoutSlice> = (set) => ({
  hangoutDetails: {
    hangoutName: "",
    hangoutDescription: "",
    selectedFriends: [],
  },
  setHangoutDetails: (details) => set({ hangoutDetails: details }),
  addFriend: (userId) =>
    set((state) => {
      if (state.hangoutDetails) {
        return {
          hangoutDetails: {
            ...state.hangoutDetails,
            selectedFriends: [...state.hangoutDetails.selectedFriends, userId],
          },
        };
      }
      return state;
    }),
  removeFriend: (userId) =>
    set((state) => {
      if (state.hangoutDetails) {
        return {
          hangoutDetails: {
            ...state.hangoutDetails,
            selectedFriends: state.hangoutDetails.selectedFriends.filter(
              (id) => id !== userId
            ),
          },
        };
      }
      return state;
    }),
});
