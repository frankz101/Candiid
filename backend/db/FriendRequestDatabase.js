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

const getFriendRequestInDatabase = async (userId) => {
  try {
    const friendRequestRef = collection(db, "friendRequests");
    const q = query(friendRequestRef, where("receiverId", "==", userId));
    const friendRequestsDocSnap = await getDocs(q);

    const usersPromises = friendRequestsDocSnap.docs.map(async (document) => {
      const docRef = doc(db, "users", document.data().senderId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      } else {
        console.log("No friend request sender exists");
        return null;
      }
    });

    const usersResults = await Promise.all(usersPromises);
    const users = usersResults.filter((user) => user !== null);
    return users;
  } catch (error) {
    console.error("Error getting friend requests: ", error);
    throw error;
  }
};

export { createFriendRequestInDatabase, getFriendRequestInDatabase };
