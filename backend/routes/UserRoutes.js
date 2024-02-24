import express from "express";
import multer from "multer";
import {
  getUserPosts,
  postUser,
  putUserProfilePhoto,
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
router.get("/user/:id/posts", getUserPosts);

export default router;
