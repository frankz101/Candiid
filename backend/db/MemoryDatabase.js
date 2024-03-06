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
} from "firebase/firestore";
import { db } from "../firebase.js";

const createMemoryInDatabase = async (memory) => {
  const memoryCollection = collection(db, "memories");
  try {
    const docRef = await addDoc(memoryCollection, {
      ...memory,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding memory to database: ", error);
    throw new Error("Failed to add memory");
  }
};

const fetchMemoriesFromDatabase = async (userId) => {
  const memoriesCollection = collection(db, "memories");

  const userMemoriesQuery = query(
    memoriesCollection,
    where("userId", "==", userId)
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

export {
  createMemoryInDatabase,
  fetchMemoriesFromDatabase,
  updateMemoryInDatabase,
};
