import express from "express";
import cors from "cors";
import { Expo } from "expo-server-sdk";
import { Server } from "socket.io";
import dotenv from "dotenv";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "./firebase.js";

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

app.use("/", UserRoutes);
app.use("/", HangoutRoutes);
app.use("/", PostRoutes);
app.use("/", FriendRequestRoutes);
app.use("/", MemoryRoutes);
app.use("/", NotificationRoutes);
app.use("/", StickerRoutes);
app.use("/", ChatRoutes);
app.use("/", GroupRoutes);

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Listening on port ${PORT}`);
});

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("Client connected");

  let unsubscribe = null;

  socket.on("joinRoom", (roomId) => {
    if (!roomId) {
      socket.emit("error", { error: "roomId is required" });
      return;
    }

    console.log(`Listening to room: ${roomId}`);

    const colRef = collection(db, "messages", roomId, "chatMessages");
    const q = query(colRef);

    let isInitialLoad = true;

    unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (isInitialLoad) {
          console.log("Initial load document:", change.doc.data());
        } else {
          if (
            change.type === "added" ||
            change.type === "modified" ||
            change.type === "removed"
          ) {
            socket.emit("message", {
              type: change.type,
              doc: { id: change.doc.id, ...change.doc.data() },
            });
          }
        }
      });

      if (isInitialLoad) {
        isInitialLoad = false;
      }
    });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
    if (unsubscribe) {
      unsubscribe();
    }
  });
});
