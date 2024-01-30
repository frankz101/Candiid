import express from "express";
import { postUser } from "../controllers/UserController.js";

var router = express.Router();

router.post("/users", postUser);

export default router;
