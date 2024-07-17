import express from "express";
import { getMessages, postMessage } from "../controllers/ChatController.js";

const router = express.Router();

router.get("/chat/:roomId", getMessages);
router.post("/chat/:roomId", postMessage);

export default router;
