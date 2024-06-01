import { create } from "zustand";
import { HangoutSlice, createHangoutSlice } from "./createHangoutSlice";
import { PostSlice, createPostSlice } from "./createPostSlice";

type StoreState = HangoutSlice & PostSlice;

const useStore = create<StoreState>()((...a) => ({
  ...createHangoutSlice(...a),
  ...createPostSlice(...a),
}));

export default useStore;
