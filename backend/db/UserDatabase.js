import {
  getFirestore,
  collection,
  addDoc,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebase.js";

const createUserInDatabase = async (user) => {
  const userDocRef = doc(db, "users", user.userId);
  const userDocSnap = await getDoc(userDocRef);
  let message;

  if (!userDocSnap.exists()) {
    await setDoc(userDocRef, user);
    message = "User created";
  } else {
    //maybe log the last log in with a date? useing update doc
    message = "User logged in";
  }
  return { userId: user.userId, message };
};

export { createUserInDatabase };
