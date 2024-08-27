import {
  getFirestore,
  collection,
  addDoc,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  getDocs,
  where,
  query,
  updateDoc,
  deleteDoc,
  arrayRemove,
} from "firebase/firestore";
import { db } from "../firebase.js";

const createMemoryInDatabase = async (memory) => {
  const memoryCollection = collection(db, "memories");
  try {
    const docRef = await addDoc(memoryCollection, {
      ...memory,
      createdAt: serverTimestamp(),
    });

    const userDoc = doc(db, "users", memory.userId);
    await updateDoc(userDoc, {
      upcomingHangouts: arrayRemove(memory.hangoutId),
      createdHangouts: arrayRemove(memory.hangoutId),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding memory to database: ", error);
    throw new Error("Failed to add memory");
  }
};

const fetchMemoriesFromDatabase = async (boardId) => {
  const memoriesCollection = collection(db, "memories");
  const userMemoriesQuery = query(
    memoriesCollection,
    where("boardId", "==", boardId)
  );

  try {
    const querySnapshot = await getDocs(userMemoriesQuery);

    if (querySnapshot.empty) {
      console.log("No matching documents.");
      return [];
    }

    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching memories for user:", error);
    throw new Error("Failed to fetch memories for user");
  }
};

const updateMemoryInDatabase = async (memoryId, memoryData) => {
  console.log("Memory ID" + memoryId);
  console.log("MemoryData: " + memoryData);
  try {
    const memoryDocRef = doc(db, "memories", memoryId);
    console.log(memoryData);
    await updateDoc(memoryDocRef, memoryData);
    console.log("Memory updated successfully");
  } catch (error) {
    console.error("Error updating memory:", error);
    throw new Error("Failed to update memory");
  }
};

const updateMemoriesInDatabase = async (memoryData) => {
  try {
    if (
      !Array.isArray(memoryData.modifiedMemories) ||
      memoryData.modifiedMemories.length === 0
    ) {
      throw new Error("No memories provided for update.");
    }

    for (const memory of memoryData.modifiedMemories) {
      if (!memory.id) {
        throw new Error("Memory missing an id, cannot update.");
      }

      const memoryDocRef = doc(db, "memories", memory.id);
      const { id, ...updateFields } = memory;

      await updateDoc(memoryDocRef, updateFields);
      console.log(`Memory ${memory.id} updated successfully.`);
    }
  } catch (error) {
    console.error("Error updating memories:", error);
    throw new Error("Failed to update memories");
  }
};

const deleteMemoryFromDatabase = async (memoryId, postId) => {
  try {
    const memoryDocRef = doc(db, "memories", memoryId);
    await deleteDoc(memoryDocRef);
    const postDocRef = doc(db, "posts", postId);
    await deleteDoc(postDocRef);
    console.log(`Memory ${memoryId} deleted successfully.`);
    return true;
  } catch (error) {
    console.error("Error deleting memory:", error);
    throw new Error(`Failed to delete memory with ID ${memoryId}`);
  }
};

export {
  createMemoryInDatabase,
  fetchMemoriesFromDatabase,
  updateMemoryInDatabase,
  updateMemoriesInDatabase,
  deleteMemoryFromDatabase,
};
