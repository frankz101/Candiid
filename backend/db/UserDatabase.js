import { getFirestore, collection, addDoc } from "firebase/firestore";
import { db } from "../firebase.js";

const createUserInDatabase = async (user) => {
  const userCollection = collection(db, "users");
  const docRef = await addDoc(userCollection, user);
  return docRef.id;
};

export { createUserInDatabase };
