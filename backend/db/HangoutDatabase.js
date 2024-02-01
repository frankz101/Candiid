import { getFirestore, collection, addDoc } from "firebase/firestore";
import { db } from "../firebase.js";

const createHangoutInDatabase = async (hangout) => {
  const hangoutCollection = collection(db, "hangouts");
  const docRef = await addDoc(hangoutCollection, hangout);
  return docRef.id;
};

export { createHangoutInDatabase };
