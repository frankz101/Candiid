import express from "express";
import {
  sendFriendRequest,
  getFriendRequests,
} from "../controllers/FriendRequestController.js";

var router = express.Router();

router.post("/friendRequest", sendFriendRequest);
router.get("/friendRequest/get/:id", getFriendRequests);

export default router;
