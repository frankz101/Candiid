import express from "express";
import multer from "multer";
import {
  postHangout,
  postPhotoToHangout,
} from "../controllers/HangoutController.js";

var router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/hangout", postHangout);
router.post("/hangout/:id/photo", upload.single("file"), postPhotoToHangout);

export default router;
