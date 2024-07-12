import {
  getFirestore,
  collection,
  addDoc,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
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

const fetchPostInDatabase = async (userId, hangoutId) => {
  const postCollection = collection(db, "posts");
  try {
    const postSnapshot = await getDocs(
      query(
        postCollection,
        where("userId", "==", userId),
        where("hangoutId", "==", hangoutId)
      )
    );

    if (!postSnapshot.empty) {
      return postSnapshot.docs[0].data();
    }
    return {};
  } catch (error) {
    console.error("Error fetching post:", error);
    throw error;
  }
};

export { createPostInDatabase, fetchPostInDatabase };
