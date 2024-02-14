import {
  getFirestore,
  collection,
  addDoc,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase.js";

const createPostInDatabase = async (post) => {
  const postCollection = collection(db, "posts");
  try {
    const docRef = await addDoc(postCollection, {
      ...post,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding post to database: ", error);
    throw new Error("Failed to add post");
  }
};

export { createPostInDatabase };
