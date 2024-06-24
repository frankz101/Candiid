import { GiphyMedia } from "@giphy/react-native-sdk";
import { StateCreator } from "zustand";

export interface StickerDetails {
  id?: string;
  x: number;
  y: number;
  media: GiphyMedia;
  scale: number;
  rotation: number;
}

export interface StickerSlice {
  stickers: StickerDetails[];
  addSticker: (sticker: StickerDetails) => void;
  updateSticker: (id: string, changes: Partial<StickerDetails>) => void;
  removeSticker: (id: string) => void;
}

export const createStickerSlice: StateCreator<StickerSlice> = (set) => ({
  stickers: [],

  addSticker: (sticker: StickerDetails) =>
    set((state) => ({
      stickers: [...state.stickers, sticker],
    })),

  updateSticker: (id: string, changes: Partial<StickerDetails>) =>
    set((state) => ({
      stickers: state.stickers.map((sticker) =>
        sticker.id === id ? { ...sticker, ...changes } : sticker
      ),
    })),

  removeSticker: (id: string) =>
    set((state) => ({
      stickers: state.stickers.filter((sticker) => sticker.id !== id),
    })),
});
