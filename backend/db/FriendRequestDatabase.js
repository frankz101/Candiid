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
  deleteDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
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

const getFriendRequestSentInDatabase = async (userId) => {
  try {
    const friendRequestRef = collection(db, "friendRequests");
    const q = query(friendRequestRef, where("senderId", "==", userId));
    const friendRequestsDocSnap = await getDocs(q);

    const usersPromises = friendRequestsDocSnap.docs.map(async (document) => {
      const docRef = doc(db, "users", document.data().receiverId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      } else {
        console.log("No friend request receiver exists");
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

const handleFriendRequestInDatabase = async (friendRequest) => {
  try {
    const friendRequestRef = collection(db, "friendRequests");
    const q = query(
      friendRequestRef,
      where("senderId", "==", friendRequest.senderId),
      where("receiverId", "==", friendRequest.receiverId)
    );

    const docSnap = await getDocs(q);

    if (!docSnap.empty) {
      const documentSnapshot = docSnap.docs[0];
      const docRef = documentSnapshot.ref;
      await deleteDoc(docRef);
      console.log("Friend request deleted");
    } else {
      console.log("No friend request found");
    }

    if (friendRequest.status == "accept") {
      const senderDocRef = doc(db, "users", friendRequest.senderId);
      const receiverDocRef = doc(db, "users", friendRequest.receiverId);

      updateDoc(senderDocRef, {
        friends: arrayUnion(friendRequest.receiverId),
      })
        .then(() => {
          console.log(
            `User ${friendRequest.receiverId} added to ${friendRequest.senderId}'s friend list.`
          );
        })
        .catch((error) => {
          console.error("Error updating document:", error);
        });

      updateDoc(receiverDocRef, {
        friends: arrayUnion(friendRequest.senderId),
      })
        .then(() => {
          console.log(
            `User ${friendRequest.senderId} added to ${friendRequest.receiverId}'s friend list.`
          );
        })
        .catch((error) => {
          console.error("Error updating document:", error);
        });
    }
  } catch (error) {
    console.error("Error handling friend request: ", error);
    throw error;
  }
};

const removeFriendInDatabase = async (userId, friendId) => {
  try {
    const userDocRef = doc(db, "users", userId);
    const friendDocRef = doc(db, "users", friendId);

    await updateDoc(userDocRef, {
      friends: arrayRemove(friendId),
    });

    await updateDoc(friendDocRef, {
      friends: arrayRemove(userId),
    });

    console.log(
      `Friend ${friendId} removed from user ${userId}'s friends list.`
    );
    console.log(
      `User ${userId} removed from friend ${friendId}'s friends list.`
    );
  } catch (error) {
    console.error("Error removing friend from database:", error);
    throw error;
  }
};

export {
  getFriendRequestInDatabase,
  createFriendRequestInDatabase,
  handleFriendRequestInDatabase,
  removeFriendInDatabase,
  getFriendRequestSentInDatabase,
};
