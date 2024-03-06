import {
  getFirestore,
  collection,
  addDoc,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebase.js";

const createFriendRequestInDatabase = async (friendRequest) => {
  const friendRequestDocRef = doc(
    db,
    "friendRequests",
    friendRequest.friendRequestId
  );
  const friendRequestDocSnap = await getDoc(friendRequestDocRef);
  let message;

  if (!friendRequestDocSnap.exists()) {
    await setDoc(friendRequestDocRef, friendRequest);
    message = "Friend request created";
  } else {
    message = "Friend requested";
  }
  return { friendRequestId: friendRequest.friendRequestId, message };
};

export { createFriendRequestInDatabase };
