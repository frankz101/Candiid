import express from "express";
import {
  sendFriendRequest,
  getFriendRequests,
  handleFriendRequest,
  removeFriend,
} from "../controllers/FriendRequestController.js";

var router = express.Router();

router.get("/friendRequest/get/:id", getFriendRequests);
router.post("/friendRequest", sendFriendRequest);
router.post("/friendRequest/handle", handleFriendRequest);
router.put("/friends/remove/users/:id", removeFriend);

export default router;
