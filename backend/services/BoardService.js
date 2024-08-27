import {
  createBoardInDatabase,
  fetchBoardFromDatabase,
  fetchBoardsFromDatabase,
  updateBoardBackgroundFromDatabase,
} from "../db/BoardDatabase.js";

const createBoard = async (boardData) => {
  const boardIds = await createBoardInDatabase(boardData);
  return boardIds;
};

const fetchBoards = async (userId) => {
  const result = await fetchBoardsFromDatabase(userId);
  return result;
};

const fetchBoard = async (userId) => {
  const result = await fetchBoardFromDatabase(userId);
  return result;
};

const updateBoardBackground = async (boardId, backgroundColor) => {
  const result = await updateBoardBackgroundFromDatabase(
    boardId,
    backgroundColor
  );
  return result;
};

export { createBoard, fetchBoards, fetchBoard, updateBoardBackground };
