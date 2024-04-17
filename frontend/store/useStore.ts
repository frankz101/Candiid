import { create } from "zustand";
import { HangoutSlice, createHangoutSlice } from "./createHangoutSlice";

const useStore = create<HangoutSlice>()((...a) => ({
  ...createHangoutSlice(...a),
}));

export default useStore;
