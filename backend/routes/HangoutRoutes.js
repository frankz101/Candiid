import express from "express";
import multer from "multer";
import {
  getHangout,
  getRecentHangouts,
  postHangout,
  postPhotoToHangout,
} from "../controllers/HangoutController.js";

var router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/hangout", postHangout);
router.post("/hangout/:id/photo", upload.single("file"), postPhotoToHangout);
router.get("/hangouts/users/:userId", getRecentHangouts);
router.get("/hangout/:hangoutId", getHangout);

export default router;
