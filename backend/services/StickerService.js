import {
  createStickersInDatabase,
  fetchStickersFromDatabase,
  updateStickersInDatabase,
} from "../db/StickerDatabase.js";

const createStickers = async (stickerData) => {
  const stickerIds = await createStickersInDatabase(stickerData);
  return stickerIds;
};

const fetchStickers = async (userId) => {
  const result = await fetchStickersFromDatabase(userId);
  return result;
};

const updateStickers = async (stickerData) => {
  const result = await updateStickersInDatabase(stickerData);
  return result;
};

export { createStickers, fetchStickers, updateStickers };
