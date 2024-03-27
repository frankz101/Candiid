import express from "express";
import multer from "multer";
import {
  getHangout,
  getRecentHangouts,
  postHangout,
  postHangoutRequests,
  postPhotoToHangout,
  getHangoutRequests,
  putHangoutRequest,
} from "../controllers/HangoutController.js";

var router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/hangout", postHangout);
router.post("/hangout/:id/photo", upload.single("file"), postPhotoToHangout);
router.get("/hangouts/users/:userId", getRecentHangouts);
router.get("/hangout/:hangoutId", getHangout);
router.put("/hangout/:hangoutId/post-position");
router.get("/hangout/requests/users/:userId", getHangoutRequests);
router.post("/hangout/:hangoutId/requests", postHangoutRequests);
router.put("/hangout/:hangoutId/requests/users/:userId", putHangoutRequest);

export default router;
