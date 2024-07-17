import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "../firebase.js";

const addMessageToDatabase = async (roomId, message) => {
  try {
    const messageRef = collection(db, "messages", roomId, "chatMessages");
    await addDoc(messageRef, {
      senderName: message.senderName,
      senderId: message.senderId,
      text: message.text,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error("Error adding message: ", error);
  }
};

const fetchMessagesFromDatabase = async (roomId) => {
  try {
    const messageRef = collection(db, "messages", roomId, "chatMessages");
    const q = query(messageRef, orderBy("createdAt", "asc"));
    const snapshot = await getDocs(q);
    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return messages;
  } catch (error) {
    console.error("Error fetching messages: ", error);
  }
};

export { addMessageToDatabase, fetchMessagesFromDatabase };
