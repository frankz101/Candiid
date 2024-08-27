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

const createBoardInDatabase = async (boardData) => {
  const boardsCollection = collection(db, "boards");
  try {
    const docRef = await addDoc(boardsCollection, {
      ...boardData,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding board to database: ", error);
    throw new Error("Failed to add board");
  }
};

const fetchBoardsFromDatabase = async (userId) => {
  const boardsCollection = collection(db, "boards");

  const boardsQuery = query(boardsCollection, where("userId", "==", userId));

  try {
    const querySnapshot = await getDocs(boardsQuery);

    if (querySnapshot.empty) {
      console.log("No matching documents.");
      return [];
    }

    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching boards for user:", error);
    throw new Error("Failed to fetch boards for user");
  }
};

const fetchBoardFromDatabase = async (boardId) => {
  try {
    const boardDocRef = doc(db, "boards", boardId);

    const boardDoc = await getDoc(boardDocRef);

    if (!boardDoc.exists()) {
      console.log("No matching board found.");
      return null;
    }

    return { id: boardDoc.id, ...boardDoc.data() };
  } catch (error) {
    console.error("Error fetching board:", error);
    throw new Error("Failed to fetch board");
  }
};

const updateBoardBackgroundFromDatabase = async (boardId, backgroundColor) => {
  try {
    const boardDocRef = doc(db, "boards", boardId);

    await updateDoc(boardDocRef, {
      backgroundColor,
    });
    console.log("Background details updated successfully.");
    return boardId;
  } catch (error) {
    console.error("Error updating background details:", error);
    throw new Error("Failed to update background details");
  }
};

const deleteBoardFromDatabase = async (boardId) => {
  try {
    const boardDocRef = doc(db, "boards", boardId);
    await deleteDoc(boardDocRef);
    console.log(`Board ${boardId} deleted successfully.`);
    return true;
  } catch (error) {
    console.error("Error deleting board:", error);
    throw new Error(`Failed to delete board with ID ${boardId}`);
  }
};

export {
  createBoardInDatabase,
  fetchBoardsFromDatabase,
  fetchBoardFromDatabase,
  updateBoardBackgroundFromDatabase,
  deleteBoardFromDatabase,
};
