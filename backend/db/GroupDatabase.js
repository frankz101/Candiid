import {
  addDoc,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase.js";
import { searchUserInDatabase } from "./UserDatabase.js";

const createGroupInDatabase = async (group) => {
  const groupsCollection = collection(db, "groups");
  try {
    const groupDocRef = await addDoc(groupsCollection, {
      ...group,
      groupMemberIds: arrayUnion(group.owner),
      createdAt: serverTimestamp(),
    });

    const userDocRef = doc(db, "users", group.owner);
    await updateDoc(userDocRef, {
      groups: arrayUnion(groupDocRef.id),
    });

    return groupDocRef.id;
  } catch (error) {
    console.error("Error adding group to database: ", error);
    throw new Error("Failed to add group");
  }
};

const fetchGroupInDatabase = async (groupId) => {
  try {
    const groupDocRef = doc(db, "groups", groupId);
    const groupDoc = await getDoc(groupDocRef);

    if (groupDoc.exists()) {
      return {
        id: groupDoc.id,
        ...groupDoc.data(),
      };
    } else {
      throw new Error("No such document!");
    }
  } catch (error) {
    console.error("Error fetching group by ID:", error);
    throw new Error("Error fetching group by ID");
  }
};

const fetchGroupsInDatabase = async (userId) => {
  try {
    const groupsCollection = collection(db, "groups");
    const q = query(
      groupsCollection,
      where("groupMemberIds", "array-contains", userId)
    );
    const querySnapshot = await getDocs(q);

    const groups = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      groupName: doc.data().groupName,
    }));

    return groups;
  } catch (error) {
    console.error("Error fetching groups:", error);
    throw new Error("Error fetching groups");
  }
};

const fetchGroupRequestsInDatabase = async (userId) => {
  try {
    const groupRequestsRef = collection(db, "groupRequests");
    const q = query(groupRequestsRef, where("receiverId", "==", userId));
    const querySnapshot = await getDocs(q);

    const promises = querySnapshot.docs.map(async (doc) => {
      const groupRequest = { id: doc.id, ...doc.data() };
      const userInfo = await searchUserInDatabase(groupRequest.userId);
      return { ...groupRequest, userInfo };
    });

    const results = await Promise.all(promises);

    return results;
  } catch (error) {
    console.error("Error fetching group requests:", error);
    throw error;
  }
};

const createGroupRequestsInDatabase = async (
  groupId,
  selectedFriends,
  groupName,
  userId
) => {
  try {
    const groupRequestRef = collection(db, "groupRequests");
    let messages = [];

    console.log(selectedFriends);
    for (const friendId of selectedFriends) {
      const groupRequestDoc = {
        groupId: groupId,
        groupName: groupName,
        userId: userId,
        receiverId: friendId,
        status: "pending",
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(groupRequestRef, groupRequestDoc);
      messages.push({
        groupRequestId: docRef.id,
        senderId: userId,
        receiverId: friendId,
        message: "Group invite sent",
      });
    }

    return messages;
  } catch (error) {
    console.error("Error creating group invites:", error);
    throw error;
  }
};

const handleGroupRequestInDatabase = async (groupId, groupRequest) => {
  try {
    const groupRequestRef = collection(db, "groupRequests");
    const joingroupRequestRef = collection(db, "joinGroupRequests");
    console.log(groupRequest);

    let q;

    if (groupRequest.type === "request") {
      q = query(
        groupRequestRef,
        where("groupId", "==", groupId),
        where("receiverId", "==", groupRequest.receiverId)
      );
    } else if (groupRequest.type === "join") {
      q = query(
        joingroupRequestRef,
        where("groupId", "==", groupId),
        where("receiverId", "==", groupRequest.receiverId),
        where("userId", "==", groupRequest.senderId)
      );
    }

    const docSnap = await getDocs(q);

    if (!docSnap.empty) {
      const documentSnapshot = docSnap.docs[0];
      const docRef = documentSnapshot.ref;
      await deleteDoc(docRef);
      console.log("Group request deleted");
    } else {
      console.log("No group request found");
    }

    if (groupRequest.status == "accept") {
      const groupDocRef = doc(db, "groups", groupId);

      if (groupRequest.type === "request") {
        const userDocRef = doc(db, "users", groupRequest.receiverId);
        updateDoc(groupDocRef, {
          groupMemberIds: arrayUnion(groupRequest.receiverId),
        })
          .then(() => {
            console.log(
              `User ${groupRequest.receiverId} added to group: ${groupId}'s.`
            );
          })
          .catch((error) => {
            console.error("Error updating document:", error);
          });
        updateDoc(userDocRef, {
          upcomingGroups: arrayUnion(groupId),
        })
          .then(() => {
            console.log(
              `User ${groupRequest.receiverId} added to group: ${groupId}'s.`
            );
          })
          .catch((error) => {
            console.error("Error updating document:", error);
          });
      } else if (groupRequest.type === "join") {
        const userDocRef = doc(db, "users", groupRequest.senderId);
        updateDoc(groupDocRef, {
          groupMemberIds: arrayUnion(groupRequest.senderId),
        })
          .then(() => {
            console.log(
              `User ${groupRequest.senderId} join group request accepted: ${groupId}.`
            );
          })
          .catch((error) => {
            console.error("Error updating document:", error);
          });
        updateDoc(userDocRef, {
          upcomingGroups: arrayUnion(groupId),
        })
          .then(() => {
            console.log(
              `User ${groupRequest.senderId} added to group: ${groupId}'s.`
            );
          })
          .catch((error) => {
            console.error("Error updating document:", error);
          });
      }
    }
  } catch (error) {
    console.error("Error handling friend request: ", error);
    throw error;
  }
};

export {
  createGroupInDatabase,
  fetchGroupInDatabase,
  fetchGroupsInDatabase,
  fetchGroupRequestsInDatabase,
  createGroupRequestsInDatabase,
  handleGroupRequestInDatabase,
};
