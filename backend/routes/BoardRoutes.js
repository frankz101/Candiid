import express from "express";
import {
  deleteBoard,
  getBoard,
  getBoards,
  postBoard,
  putBoardBackground,
} from "../controllers/BoardController.js";

var router = express.Router();

router.post("/boards", postBoard);
router.get("/boards/:userId", getBoards);
router.get("/board/:boardId", getBoard);
router.put("/boards/:boardId/background", putBoardBackground);
router.delete("/boards/:boardId", deleteBoard);

export default router;
