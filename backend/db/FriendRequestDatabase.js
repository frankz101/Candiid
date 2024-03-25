import {
  getFirestore,
  collection,
  addDoc,
  doc,
  getDoc,
  setDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase.js";

const createFriendRequestInDatabase = async (friendRequest) => {
  try {
    const friendRequestRef = collection(db, "friendRequests");
    const q = query(
      friendRequestRef,
      where("senderId", "==", friendRequest.senderId),
      where("receiverId", "==", friendRequest.receiverId)
    );

    const friendRequestDocSnap = await getDocs(q);
    let message;

    if (friendRequestDocSnap.empty) {
      await addDoc(friendRequestRef, friendRequest);
      message = "Friend request created";
    } else {
      message = "Friend requested";
    }
    return { friendRequestId: friendRequest.friendRequestId, message };
  } catch (error) {
    console.error("Error creating friend request:", error);
    throw error;
  }
};

export { createFriendRequestInDatabase };
