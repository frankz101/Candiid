import { deleteBoardFromDatabase } from "../db/BoardDatabase.js";
import {
  createBoard,
  fetchBoard,
  fetchBoards,
  updateBoardBackground,
} from "../services/BoardService.js";

const postBoard = async (req, res) => {
  try {
    console.log(req.body);
    const result = await createBoard(req.body);
    res.status(201).send(result);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const getBoards = async (req, res) => {
  try {
    const userId = req.params.userId;

    const result = await fetchBoards(userId);
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: err.message });
  }
};

const getBoard = async (req, res) => {
  try {
    const boardId = req.params.boardId;
    const result = await fetchBoard(boardId);
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: err.message });
  }
};

const putBoardBackground = async (req, res) => {
  try {
    const boardId = req.params.boardId;
    const { backgroundColor } = req.body;
    const result = await updateBoardBackground(boardId, backgroundColor);
    res.status(201).send(result);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const deleteBoard = async (req, res) => {
  const { boardId } = req.params;
  try {
    const wasDeleted = await deleteBoardFromDatabase(boardId);
    if (wasDeleted) {
      res.status(204).send();
    } else {
      res.status(404).send({ message: "Board not found" });
    }
  } catch (err) {
    console.error("Error while deleting board: ", err);
    res.status(500).send({ message: "Internal server error" });
  }
};

export { postBoard, getBoards, getBoard, putBoardBackground, deleteBoard };
