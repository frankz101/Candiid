import {
  createMemoryInDatabase,
  fetchMemoriesFromDatabase,
  updateMemoryInDatabase,
  updateMemoriesInDatabase,
} from "../db/MemoryDatabase.js";

const createMemory = async (memoryData) => {
  const memoryId = await createMemoryInDatabase(memoryData);
  return memoryId;
};

const fetchMemories = async (userId) => {
  const result = await fetchMemoriesFromDatabase(userId);
  return result;
};

const updateMemory = async (memoryId, memoryData) => {
  const { postId } = memoryData;
  const result = await updateMemoryInDatabase(memoryId, {
    postId,
  });
  return result;
};

const updateMemories = async (memoryData) => {
  const result = await updateMemoriesInDatabase(memoryData);
  return result;
};

export { createMemory, fetchMemories, updateMemory, updateMemories };
