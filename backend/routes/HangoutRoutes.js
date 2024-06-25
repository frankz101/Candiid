import express from "express";
import multer from "multer";
import {
  getHangout,
  getRecentHangouts,
  getUpcomingHangouts,
  postHangout,
  postHangoutRequests,
  postPhotoToHangout,
  getHangoutRequests,
  putHangoutRequest,
  getFreshHangouts,
} from "../controllers/HangoutController.js";

var router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/hangout", postHangout);
router.post("/hangout/:id/photo", upload.single("file"), postPhotoToHangout);
router.get("/hangouts/users/:userId", getRecentHangouts);
router.get("/hangout/upcoming/:userId", getUpcomingHangouts);
router.get("/hangout/:hangoutId", getHangout);
router.get("/hangout/:userId/fresh", getFreshHangouts);
router.put("/hangout/:hangoutId/post-position");
router.get("/hangout/requests/users/:userId", getHangoutRequests);
router.post("/hangout/:hangoutId/requests", postHangoutRequests);
router.put("/hangout/:hangoutId/requests", putHangoutRequest);

export default router;
