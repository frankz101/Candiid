import { Server } from "socket.io";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "./firebase.js";

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected");

    let unsubscribeChat = null;

    socket.on("joinRoom", (roomId) => {
      if (!roomId) {
        socket.emit("error", "roomId is required");
        return;
      }

      console.log(`Listening to room: ${roomId}`);

      const colRef = collection(db, "messages", roomId, "chatMessages");
      const q = query(colRef);

      let isInitialLoad = true;

      unsubscribeChat = onSnapshot(q, (snapshot) => {
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

    socket.on("leaveRoom", () => {
      if (unsubscribeChat) {
        unsubscribeChat();
        unsubscribeChat = null;
        console.log("Stopped listening to chat messages");
      }
    });
  });

  return io;
};
