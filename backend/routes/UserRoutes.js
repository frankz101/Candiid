import express from "express";
import multer from "multer";
import {
  getUserPost,
  getUserPosts,
  getUsers,
  postUser,
  putUserProfilePhoto,
  getUserProfilePhoto,
  getFriends,
} from "../controllers/UserController.js";

var router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/users", postUser);
router.put(
  "/user/:id/profile-photo",
  upload.single("profilePhoto"),
  putUserProfilePhoto
);
router.get("/user/:id/profile-photo", getUserProfilePhoto);
router.get("/user/:id/posts", getUserPosts);
router.get("/user/:userId/post/:postId", getUserPost);
router.get("/user/search/:username/users/:userId", getUsers);
router.get("/user/:id/friends", getFriends);

export default router;
