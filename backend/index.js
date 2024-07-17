import express from "express";
import cors from "cors";
import { Expo } from "expo-server-sdk";
import { WebSocketServer } from "ws";

const app = express();
const port = 3001;

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

const server = app.listen(port, "0.0.0.0", () => {
  console.log(`Listening on port ${port}`);
});

const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (message) => {
    const parsedMessage = JSON.parse(message);
    const { roomId } = parsedMessage;

    if (!roomId) {
      ws.send(JSON.stringify({ error: "roomId is required" }));
      return;
    }

    console.log(`Listening to room: ${roomId}`);

    // Listen for changes in Firestore for the specified room
    const colRef = collection(db, "messages", roomId, "chatMessages");
    const q = query(colRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (
          change.type === "added" ||
          change.type === "modified" ||
          change.type === "removed"
        ) {
          ws.send(
            JSON.stringify({ type: change.type, doc: change.doc.data() })
          );
        }
      });
    });
    ws.on("close", () => {
      console.log("Client disconnected");
      unsubscribe(); // Stop listening to changes when the client disconnects
    });
  });
});

// // Create WebSocket server
// const wss = new WebSocketServer({ noServer: true });

// wss.on("connection", (ws) => {
//   console.log("New client connected");

//   ws.on("message", (message) => {
//     const { type, roomId } = JSON.parse(message);

//     if (type === "subscribe") {
//       console.log(`Subscribing to room ${roomId}`);
//       // Setup Firestore listener for the specific room
//       const messagesRef = collection(db, "messages", roomId, "chatMessages");
//       const q = query(messagesRef, orderBy("createdAt", "asc"));

//       const unsubscribe = onSnapshot(q, (snapshot) => {
//         snapshot.docChanges().forEach((change) => {
//           if (change.type === "added") {
//             const newMessage = change.doc.data();
//             ws.send(
//               JSON.stringify({ type: "new_message", message: newMessage })
//             );
//           }
//         });
//       });

//       ws.on("close", () => {
//         console.log("Client disconnected");
//         unsubscribe();
//       });
//     }
//   });

//   ws.on("close", () => {
//     console.log("Client disconnected");
//   });
// });

// const setupWebSocketServer = (server) => {
//   server.on("upgrade", (request, socket, head) => {
//     wss.handleUpgrade(request, socket, head, (ws) => {
//       wss.emit("connection", ws, request);
//     });
//   });
// };

// setupWebSocketServer(server);
