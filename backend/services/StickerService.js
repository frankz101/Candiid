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

const updateStickers = async (memoryId, memoryData) => {
  const { postId } = memoryData;
  const result = await updateStickersInDatabase(memoryId, {
    postId,
  });
  return result;
};

export { createStickers, fetchStickers, updateStickers };
