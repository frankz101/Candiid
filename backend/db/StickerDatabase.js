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

const createStickersInDatabase = async (stickers) => {
  const stickerCollection = collection(db, "stickers");
  const createdDocRefs = [];

  try {
    for (const sticker of stickers.newStickers) {
      const { id, ...stickerData } = sticker;
      const docRef = await addDoc(stickerCollection, {
        userId: stickers.userId,
        ...stickerData,
        createdAt: serverTimestamp(),
      });
      createdDocRefs.push(docRef.id);
    }
    return createdDocRefs;
  } catch (error) {
    console.error("Error adding stickers to database: ", error);
    throw new Error("Failed to add sticker");
  }
};

const fetchStickersFromDatabase = async (userId) => {
  const stickersCollection = collection(db, "stickers");

  const stickersQuery = query(
    stickersCollection,
    where("userId", "==", userId)
  );

  try {
    const querySnapshot = await getDocs(stickersQuery);

    if (querySnapshot.empty) {
      console.log("No matching documents.");
      return [];
    }

    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching stickers for user:", error);
    throw new Error("Failed to fetch stickers for user");
  }
};

const updateStickersInDatabase = async (memoryId, memoryData) => {
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

export {
  createStickersInDatabase,
  fetchStickersFromDatabase,
  updateStickersInDatabase,
};
