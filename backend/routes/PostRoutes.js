import express from "express";
import { postPost } from "../controllers/PostController.js";

var router = express.Router();

router.post("/posts", postPost);

export default router;
