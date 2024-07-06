// import { GiphyMedia } from "@giphy/react-native-sdk";
// import { StateCreator } from "zustand";

// export interface StickerDetails {
//   id?: string;
//   x: number;
//   y: number;
//   media: GiphyMedia;
//   scale: number;
//   rotation: number;
//   isNew?: boolean;
//   modified?: boolean;
// }

// export interface StickerSlice {
//   stickers: StickerDetails[];
//   addSticker: (sticker: StickerDetails) => void;
//   updateSticker: (id: string, changes: Partial<StickerDetails>) => void;
//   updateStickerId: (tempId: string, id: string) => void;
//   updateAllStickers: () => void;
//   removeSticker: (id: string) => void;
//   resetStickers: () => void;
// }

// export const createStickerSlice: StateCreator<StickerSlice> = (set) => ({
//   stickers: [],

//   addSticker: (sticker: StickerDetails) =>
//     set((state) => ({
//       stickers: [
//         ...state.stickers,
//         {
//           ...sticker,
//           isNew: sticker.isNew ?? false,
//           modified: false,
//         },
//       ],
//     })),

//   updateSticker: (id: string, changes: Partial<StickerDetails>) =>
//     set((state) => ({
//       stickers: state.stickers.map((sticker) =>
//         sticker.id === id
//           ? {
//               ...sticker,
//               ...changes,
//               modified:
//                 sticker.x !== changes.x ||
//                 sticker.y !== changes.y ||
//                 sticker.scale !== changes.scale ||
//                 sticker.rotation !== changes.rotation,
//             }
//           : sticker
//       ),
//     })),

//   updateStickerId: (tempId: string, newId: string) =>
//     set((state) => ({
//       stickers: state.stickers.map((sticker) =>
//         sticker.id === tempId
//           ? { ...sticker, id: newId, modified: false }
//           : sticker
//       ),
//     })),

//   updateAllStickers: () =>
//     set((state) => ({
//       stickers: state.stickers.map((sticker) => ({
//         ...sticker,
//         isNew: false,
//         lastModified: undefined,
//       })),
//     })),

//   removeSticker: (id: string) =>
//     set((state) => ({
//       stickers: state.stickers.filter((sticker) => sticker.id !== id),
//     })),

//   resetStickers: () => set(() => ({ stickers: [] })),
// });

import { GiphyMedia } from "@giphy/react-native-sdk";
import { StateCreator } from "zustand";

export interface StickerDetails {
  id?: string;
  x: number;
  y: number;
  media: GiphyMedia;
  scale?: number;
  rotation?: number;
  isNew?: boolean;
  modified?: boolean;
}

export interface StickerSlice {
  stickers: Record<string, StickerDetails>;
  tempStickers: Record<string, StickerDetails>;
  setStickers: (stickers: Record<string, StickerDetails>) => void;
  addSticker: (sticker: StickerDetails) => void;
  addTempSticker: (sticker: StickerDetails) => void;
  updateSticker: (id: string, x: number, y: number, modified: boolean) => void;
  updateTempSticker: (id: string, x: number, y: number) => void;
  resetStickers: (ids: string[]) => void;
  resetTempStickers: () => void;
}

export const createStickerSlice: StateCreator<StickerSlice> = (set) => ({
  stickers: {},
  tempStickers: {},

  setStickers: (stickers) => set({ stickers }),

  addSticker: (sticker) =>
    set((state) => ({
      stickers: {
        ...state.stickers,
        [sticker.id || ""]: sticker,
      },
    })),

  addTempSticker: (sticker) =>
    set((state) => {
      const index = Object.keys(state.tempStickers).length.toString();
      return {
        tempStickers: {
          ...state.tempStickers,
          [index]: sticker,
        },
      };
    }),

  updateSticker: (id, x, y, modified) =>
    set((state) => ({
      stickers: {
        ...state.stickers,
        [id]: {
          ...state.stickers[id],
          x,
          y,
          modified,
        },
      },
    })),

  updateTempSticker: (id, x, y) =>
    set((state) => ({
      tempStickers: {
        ...state.tempStickers,
        [id]: {
          ...state.tempStickers[id],
          x,
          y,
        },
      },
    })),

  resetStickers: (ids: string[]) =>
    set((state) => {
      const updatedStickers = { ...state.stickers };

      ids.forEach((id) => {
        if (updatedStickers[id]) {
          updatedStickers[id] = {
            ...updatedStickers[id],
            modified: false,
          };
        }
      });

      return { stickers: updatedStickers };
    }),

  resetTempStickers: () =>
    set(() => ({
      tempStickers: {},
    })),
});
