import express from "express";
import cors from "cors";
import { Expo } from "expo-server-sdk";
import { WebSocketServer } from "ws";
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
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "./firebase.js";

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

const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  console.log("Client connected");

  let unsubscribe = null;

  ws.on("message", (message) => {
    const parsedMessage = JSON.parse(message);
    const { roomId } = parsedMessage;

    if (!roomId) {
      ws.send(JSON.stringify({ error: "roomId is required" }));
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
            ws.send(
              JSON.stringify({
                type: change.type,
                doc: { id: change.doc.id, ...change.doc.data() },
              })
            );
          }
        }
      });

      if (isInitialLoad) {
        isInitialLoad = false;
      }
    });
  });

  ws.on("close", () => {
    console.log("Client disconnected");
    if (unsubscribe) {
      unsubscribe(); // Stop listening to changes when the client disconnects
    }
  });
});
