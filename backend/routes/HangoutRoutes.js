import express from "express";
import { postHangout } from "../controllers/HangoutController.js";

var router = express.Router();

router.post("/hangout", postHangout);

export default router;
