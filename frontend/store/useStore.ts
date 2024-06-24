import { create } from "zustand";
import { HangoutSlice, createHangoutSlice } from "./createHangoutSlice";
import { PostSlice, createPostSlice } from "./createPostSlice";
import { StickerSlice, createStickerSlice } from "./createStickerSlice";

type StoreState = HangoutSlice & PostSlice & StickerSlice;

const useStore = create<StoreState>()((...a) => ({
  ...createHangoutSlice(...a),
  ...createPostSlice(...a),
  ...createStickerSlice(...a),
}));

export default useStore;
