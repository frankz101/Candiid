import express from "express";
import { getPost, postPost } from "../controllers/PostController.js";

var router = express.Router();

router.post("/posts", postPost);
router.get("/posts/:userId/:hangoutId", getPost);

export default router;
