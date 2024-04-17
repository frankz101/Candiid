import express from "express";
import {
  postMemory,
  getMemories,
  putMemory,
} from "../controllers/MemoryController.js";

var router = express.Router();

router.post("/memories", postMemory);
router.get("/memories/:userId", getMemories);
router.put("/memories/:memoryId", putMemory);

export default router;
