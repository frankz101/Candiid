import express from "express";
import { sendFriendRequest } from "../controllers/FriendRequestController.js";

var router = express.Router();

router.post("/friendRequest", sendFriendRequest);

export default router;
