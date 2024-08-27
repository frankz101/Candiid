import express from "express";
import {
  postMemory,
  getMemories,
  putMemory,
  putMemories,
  deleteMemory,
} from "../controllers/MemoryController.js";

var router = express.Router();

router.post("/memories", postMemory);
router.get("/memories/:boardId", getMemories);
router.put("/memories/:memoryId", putMemory);
router.put("/memories", putMemories);
router.delete("/memories/:memoryId/:postId", deleteMemory);

export default router;
