import { create } from "zustand";
import { HangoutSlice, createHangoutSlice } from "./createHangoutSlice";
import { PostSlice, createPostSlice } from "./createPostSlice";
import { StickerSlice, createStickerSlice } from "./createStickerSlice";
import { MemorySlice, createMemorySlice } from "./createMemorySlice";

type StoreState = HangoutSlice & PostSlice & StickerSlice & MemorySlice;

const useStore = create<StoreState>()((...a) => ({
  ...createHangoutSlice(...a),
  ...createPostSlice(...a),
  ...createStickerSlice(...a),
  ...createMemorySlice(...a),
}));

export default useStore;
