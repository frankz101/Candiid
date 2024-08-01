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
  getUserWithId,
  putUserDetails,
  getPosts,
  putUserBackground,
  getProfilePics,
  getContacts,
  deleteUser,
  postSupport,
  postReport,
  postBlock,
  getBlocks,
  deleteBlock,
  getUserList,
  deleteUserProfilePhoto,
  putFriends,
} from "../controllers/UserController.js";

var router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/users", postUser);
router.get("/users/:friendId/:userId", getUserWithId);
router.put(
  "/user/:id/profile-photo",
  upload.single("profilePhoto"),
  putUserProfilePhoto
);
router.delete("/user/:userId/profile-photo", deleteUserProfilePhoto);
router.get("/user/:id/profile-photo", getUserProfilePhoto);
router.get("/user/:id/posts", getUserPosts);
router.get("/user/:userId/post/:postId", getUserPost);
router.get("/user/search/:username/users/:userId", getUsers);
router.get("/user/:id/friends", getFriends);
router.put("/user/:id/details", putUserDetails);
router.get("/user/:id/feed", getPosts);
router.put("/user/:id/background", putUserBackground);
router.post("/user/profile-pics", getProfilePics);
router.post("/user/check-contacts", getContacts);
router.delete("/user/delete/:userId", deleteUser);
router.post("/user/support", postSupport);
router.post("/user/report", postReport);
router.post("/user/block", postBlock);
router.get("/user/block/:userId", getBlocks);
router.delete("/user/unblock/:id", deleteBlock);
router.post("/user/list", getUserList);
router.put("/user/friends", putFriends);

export default router;
