import express from "express";
import {
  getGroup,
  getGroupRequests,
  getGroups,
  postGroup,
  postGroupRequests,
  putGroupRequest,
} from "../controllers/GroupController.js";

var router = express.Router();

router.post("/group", postGroup);
router.get("/group/:groupId", getGroup);
router.get("/group/users/:userId", getGroups);
router.get("/group/requests/users/:userId", getGroupRequests);
router.post("/group/:groupId/requests", postGroupRequests);
router.put("/group/:groupId/requests", putGroupRequest);

export default router;
