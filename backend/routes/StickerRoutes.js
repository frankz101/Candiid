import express from "express";
import {
  deleteSticker,
  getStickers,
  postStickers,
  putStickers,
} from "../controllers/StickerController.js";

var router = express.Router();

router.post("/stickers", postStickers);
router.get("/stickers/:boardId", getStickers);
router.put("/stickers/", putStickers);
router.delete("/stickers/:stickerId", deleteSticker);

export default router;
