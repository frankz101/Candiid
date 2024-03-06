import express from "express";
import multer from "multer";
import { sendFriendRequest } from "../controllers/FriendRequestController.js";

var router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/friendRequest", sendFriendRequest);

export default router;
