import {
  getFirestore,
  collection,
  addDoc,
  arrayUnion,
  doc,
  updateDoc,
  serverTimestamp,
  getDocs,
  where,
  orderBy,
  limit,
  query,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase.js";

const createHangoutInDatabase = async (hangout) => {
  const hangoutCollection = collection(db, "hangouts");
  try {
    const docRef = await addDoc(hangoutCollection, {
      ...hangout,
      participantIds: arrayUnion(hangout.userId),
      createdAt: serverTimestamp(),
    });

    // const userDocRef = doc(db, "users", hangout.userId); ADD THIS IF YOU WANT TO IMPLEMENET MOST RECENT 12 HANGOUTS

    // await updateDoc(userDocRef, {
    //   recentHangouts: arrayUnion(docRef.id),
    // });

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

const fetchRecentHangoutsFromDatabase = async (userId) => {
  const hangoutsCollection = collection(db, "hangouts");

  const recentHangoutsQuery = query(
    hangoutsCollection,
    where("participantIds", "array-contains", userId),
    orderBy("createdAt", "desc"),
    limit(12)
  );

  try {
    const querySnapshot = await getDocs(recentHangoutsQuery);

    if (querySnapshot.empty) {
      console.log("No matching documents.");
      return [];
    }

    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching recent hangouts in service:", error);
    throw new Error("Failed to fetch recent hangouts");
  }
};

const fetchHangoutFromDatabase = async (hangoutId) => {
  const hangoutDocRef = doc(db, "hangouts", hangoutId);
  try {
    const docSnap = await getDoc(hangoutDocRef);

    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      console.log("No such document!");
      return null;
    }
  } catch (err) {
    console.error("Error fetching hangout:", err);
    throw err;
  }
};

export {
  createHangoutInDatabase,
  addPhotoToHangoutInDatabase,
  fetchRecentHangoutsFromDatabase,
  fetchHangoutFromDatabase,
};
