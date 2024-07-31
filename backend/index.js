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
import { initializeSocket } from "./socket.js";
import { collection, doc, getDoc, onSnapshot } from "firebase/firestore";
import { sendPushNotification } from "./db/NotificationDatabase.js";
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

initializeSocket(server);

const listenToAllFriendRequests = () => {
  console.log("listening to friend requests");
  const friendRequestsRef = collection(db, "friendRequests");
  let isInitialLoad = true;

  const unsubscribe = onSnapshot(
    friendRequestsRef,
    (snapshot) => {
      if (isInitialLoad) {
        isInitialLoad = false;
      } else {
        snapshot.docChanges().forEach(async (change) => {
          if (change.type === "added") {
            const data = change.doc.data();
            const receiverDocRef = doc(db, "users", data.receiverId);
            const senderDocRef = doc(db, "users", data.senderId);
            const senderDocSnap = await getDoc(senderDocRef);
            const userId = receiverDocRef.id;
            if (senderDocSnap.exists()) {
              await sendPushNotification(
                userId,
                "New Friend Request yeahhhhhh",
                `${
                  senderDocSnap.data().username
                } has sent you a friend request!`,
                "/(profile)/NotificationsScreen"
              );
            }
          }
        });
      }
    },
    (error) => {
      console.error("Error listening to friend requests:", error);
    }
  );

  return unsubscribe;
};

const unsubscribe = listenToAllFriendRequests();
