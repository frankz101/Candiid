import {
  getFirestore,
  collection,
  addDoc,
  arrayUnion,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase.js";

const createHangoutInDatabase = async (hangout) => {
  const hangoutCollection = collection(db, "hangouts");
  try {
    const docRef = await addDoc(hangoutCollection, hangout);
    return "Hangout created with id: " + docRef.id;
  } catch (error) {
    console.error("Error adding hangout to database: ", error);
    throw new Error("Failed to add hangout");
  }
};

const addPhotoToHangoutInDatabase = async (hangoutId, fileData) => {
  const hangoutDocRef = doc(db, "hangouts", hangoutId);

  try {
    await updateDoc(hangoutDocRef, {
      sharedAlbum: arrayUnion(fileData),
    });
    return "Photo added to: " + hangoutId;
  } catch (error) {
    console.error("Error updating document: ", error);
    throw new Error("Failed to add photo to hangout.");
  }
};

export { createHangoutInDatabase, addPhotoToHangoutInDatabase };
