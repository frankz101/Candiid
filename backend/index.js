import express from "express";
import cors from "cors";
import { Expo } from "expo-server-sdk";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

export const expo = new Expo();

import UserRoutes from "./routes/UserRoutes.js";
import HangoutRoutes from "./routes/HangoutRoutes.js";
import PostRoutes from "./routes/PostRoutes.js";
import FriendRequestRoutes from "./routes/FriendRequestRoutes.js";
import MemoryRoutes from "./routes/MemoryRoutes.js";
import NotificationRoutes from "./routes/NotificationRoutes.js";
import StickerRoutes from "./routes/StickerRoutes.js";
import ChatRoutes from "./routes/ChatRoutes.js";
import GroupRoutes from "./routes/GroupRoutes.js";
import BoardRoutes from "./routes/BoardRoutes.js";
import { initializeSocket } from "./socket.js";
import { initializeListeners } from "./notificationListeners.js";

app.use("/", UserRoutes);
app.use("/", HangoutRoutes);
app.use("/", PostRoutes);
app.use("/", FriendRequestRoutes);
app.use("/", MemoryRoutes);
app.use("/", NotificationRoutes);
app.use("/", StickerRoutes);
app.use("/", ChatRoutes);
app.use("/", GroupRoutes);
app.use("/", BoardRoutes);

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Listening on port ${PORT}`);
});

initializeSocket(server);
initializeListeners();
