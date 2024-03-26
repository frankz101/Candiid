import express from "express";
import {
  sendFriendRequest,
  getFriendRequests,
  handleFriendRequest,
} from "../controllers/FriendRequestController.js";

var router = express.Router();

router.get("/friendRequest/get/:id", getFriendRequests);
router.post("/friendRequest", sendFriendRequest);
router.post("/friendRequest/handle", handleFriendRequest);

export default router;
