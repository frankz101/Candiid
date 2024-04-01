import express from "express";
import {
  postToken,
  sendNotification,
} from "../controllers/NotificationController.js";

var router = express.Router();

router.post("/notification/token", postToken);
router.post("/notification/send", sendNotification);

export default router;
