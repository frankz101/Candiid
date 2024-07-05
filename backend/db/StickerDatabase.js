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
      createdDocRefs.push({ tempId: id, id: docRef.id });
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

const updateStickersInDatabase = async (stickerData) => {
  try {
    if (
      !Array.isArray(stickerData.modifiedStickers) ||
      stickerData.modifiedStickers.length === 0
    ) {
      throw new Error("No stickers provided for update.");
    }

    for (const sticker of stickerData.modifiedStickers) {
      if (!sticker.id) {
        throw new Error("Sticker missing an id, cannot update.");
      }

      const stickerDocRef = doc(db, "stickers", sticker.id);
      const { id, ...updateFields } = sticker;

      await updateDoc(stickerDocRef, updateFields);
      console.log(`Sticker ${sticker.id} updated successfully.`);
    }
  } catch (error) {
    console.error("Error updating stickers:", error);
    throw new Error("Failed to update stickers");
  }
};

const deleteStickerFromDatabase = async (stickerId) => {
  try {
    const stickerDocRef = doc(db, "stickers", stickerId);
    await deleteDoc(stickerDocRef);
    console.log(`Sticker ${stickerId} deleted successfully.`);
    return true;
  } catch (error) {
    console.error("Error deleting sticker:", error);
    throw new Error(`Failed to delete sticker with ID ${stickerId}`);
  }
};

export {
  createStickersInDatabase,
  fetchStickersFromDatabase,
  updateStickersInDatabase,
  deleteStickerFromDatabase,
};
