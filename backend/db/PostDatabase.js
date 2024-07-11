import {
  getFirestore,
  collection,
  addDoc,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase.js";

const markPhotosAsUsed = async (hangoutId, photoUrls) => {
  try {
    const batch = writeBatch(db);
    const hangoutDocRef = doc(db, "hangouts", hangoutId);

    const hangoutDoc = await getDoc(hangoutDocRef);
    if (!hangoutDoc.exists()) {
      throw new Error("Hangout document does not exist.");
    }

    const updatedSharedAlbum = hangoutDoc.data().sharedAlbum.map((photo) => {
      if (photoUrls.includes(photo.fileUrl)) {
        return { ...photo, used: true };
      }
      return photo;
    });

    batch.update(hangoutDocRef, { sharedAlbum: updatedSharedAlbum });

    await batch.commit();

    console.log("Photos marked as used successfully.");
  } catch (error) {
    console.error("Error marking photos as used: ", error);
    throw new Error("Failed to mark photos as used");
  }
};

const createPostInDatabase = async (post) => {
  const postCollection = collection(db, "posts");
  try {
    const docRef = await addDoc(postCollection, {
      ...post,
      createdAt: serverTimestamp(),
    });

    const photoUrls = post.photoUrls.map((photo) => photo.fileUrl);
    await markPhotosAsUsed(post.hangoutId, photoUrls);

    return docRef.id;
  } catch (error) {
    console.error("Error adding post to database: ", error);
    throw new Error("Failed to add post");
  }
};

export { createPostInDatabase };
