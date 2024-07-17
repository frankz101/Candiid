import {
  addDoc,
  collection,
  getDocs,
  getDoc,
  limit,
  orderBy,
  query,
  startAfter,
  doc,
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

const fetchMessagesFromDatabase = async (roomId, limitQuery, lastMessageId) => {
  try {
    const messageRef = collection(db, "messages", roomId, "chatMessages");
    let messageQuery = query(
      messageRef,
      orderBy("createdAt", "desc"),
      limit(parseInt(limitQuery, 10))
    );

    if (lastMessageId) {
      const lastMessageDoc = await getDoc(
        doc(db, "messages", roomId, "chatMessages", lastMessageId)
      );
      messageQuery = query(
        messageRef,
        orderBy("createdAt", "desc"),
        startAfter(lastMessageDoc),
        limit(parseInt(limitQuery, 10))
      );
    }

    const snapshot = await getDocs(messageQuery);
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
