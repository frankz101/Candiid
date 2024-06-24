import express from "express";
import {
  getStickers,
  postStickers,
  putStickers,
} from "../controllers/StickerController.js";

var router = express.Router();

router.post("/stickers", postStickers);
router.get("/stickers/:userId", getStickers);
router.put("/stickers/:memoryId", putStickers);

export default router;
