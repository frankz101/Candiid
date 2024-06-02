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
  deleteDoc,
  arrayRemove,
} from "firebase/firestore";
import { db } from "../firebase.js";

// const createHangoutInDatabase = async (hangout) => {
//   const hangoutCollection = collection(db, "hangouts");
//   try {
//     const { selectedFriends, ...hangoutData } = hangout;
//     const docRef = await addDoc(hangoutCollection, {
//       ...hangoutData,
//       participantIds: arrayUnion(hangout.userId),
//       pendingRequests: arrayUnion(...selectedFriends),
//       createdAt: serverTimestamp(),
//     });

//     // const userDocRef = doc(db, "users", hangout.userId); ADD THIS IF YOU WANT TO IMPLEMENET MOST RECENT 12 HANGOUTS

//     // await updateDoc(userDocRef, {
//     //   recentHangouts: arrayUnion(docRef.id),
//     // });

//     return docRef.id;
//   } catch (error) {
//     console.error("Error adding hangout to database: ", error);
//     throw new Error("Failed to add hangout");
//   }
// };

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

    return docRef.id;
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
    return hangoutId;
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

const fetchUpcomingHangoutsFromDatabase = async (userId) => {
  const hangoutsCollection = collection(db, "hangouts");

  const upcomingHangoutsQuery = query(
    hangoutsCollection,
    where("completed", "==", false),
    where("participantIds", "array-contains", userId),
    orderBy("createdAt", "desc"),
    limit(12)
  );

  try {
    const querySnapshot = await getDocs(upcomingHangoutsQuery);

    if (querySnapshot.empty) {
      console.log("No matching documents.");
      return [];
    } else {
      const hangouts = [];
      const userIdsToFetch = [];

      querySnapshot.forEach((doc) => {
        const hangout = { id: doc.id, ...doc.data() };
        const participantIds = hangout.participantIds.slice(0, 2); // Get first two participants
        hangout.participantIds = participantIds; // Update the hangout object with only the first two participants
        hangouts.push(hangout);

        participantIds.forEach((userId) => userIdsToFetch.push(userId));
      });

      // Fetch user profiles in a batch
      const userCollection = collection(db, "users");
      const userDocs = await Promise.all(
        userIdsToFetch.map((userId) => getDoc(doc(userCollection, userId)))
      );

      const userProfiles = {};
      userDocs.forEach((userDoc) => {
        if (userDoc.exists()) {
          userProfiles[userDoc.id] = userDoc.data();
        }
      });

      // Map the profile photos to the respective participants in the hangouts
      hangouts.forEach((hangout) => {
        hangout.participants = hangout.participantIds.map((userId) => ({
          userId,
          profilePhoto: userProfiles[userId]?.profilePhoto || null,
        }));
      });
      return hangouts;
    }

    // return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching upcoming hangouts in service:", error);
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

const createHangoutRequestsInDatabase = async (
  hangoutId,
  selectedFriends,
  hangoutName
) => {
  try {
    const hangoutRequestRef = collection(db, "hangoutRequests");
    let messages = [];

    for (const friendId of selectedFriends) {
      const hangoutRequestDoc = {
        hangoutId: hangoutId,
        hangoutName: hangoutName,
        receiverId: friendId,
        status: "pending",
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(hangoutRequestRef, hangoutRequestDoc);
      messages.push({
        hangoutRequestId: docRef.id,
        receiverId: friendId,
        message: "Hangout invite sent",
      });
    }

    return messages;
  } catch (error) {
    console.error("Error creating hangout invites:", error);
    throw error;
  }
};

const fetchHangoutRequestsInDatabase = async (userId) => {
  try {
    const hangoutRequestsRef = collection(db, "hangoutRequests");
    const q = query(hangoutRequestsRef, where("receiverId", "==", userId));
    const querySnapshot = await getDocs(q);
    const hangoutRequests = [];

    querySnapshot.forEach((doc) => {
      hangoutRequests.push({ id: doc.id, ...doc.data() });
    });

    return hangoutRequests;
  } catch (error) {
    console.error("Error fetching hangout requests:", error);
    throw error;
  }
};

const handleHangoutRequestInDatabase = async (hangoutId, hangoutRequest) => {
  try {
    const hangoutRequestRef = collection(db, "hangoutRequests");
    const q = query(
      hangoutRequestRef,
      where("hangoutId", "==", hangoutId),
      where("receiverId", "==", hangoutRequest.receiverId)
    );

    const docSnap = await getDocs(q);

    if (!docSnap.empty) {
      const documentSnapshot = docSnap.docs[0];
      const docRef = documentSnapshot.ref;
      await deleteDoc(docRef);
      console.log("Hangout request deleted");
    } else {
      console.log("No hangout request found");
    }

    if (hangoutRequest.status == "accept") {
      const hangoutDocRef = doc(db, "hangouts", hangoutId);

      updateDoc(hangoutDocRef, {
        pendingRequests: arrayRemove(hangoutRequest.receiverId),
        participantIds: arrayUnion(hangoutRequest.receiverId),
      })
        .then(() => {
          console.log(
            `User ${hangoutRequest.receiverId} added to hangout: ${hangoutId}'s.`
          );
        })
        .catch((error) => {
          console.error("Error updating document:", error);
        });
    }
  } catch (error) {
    console.error("Error handling friend request: ", error);
    throw error;
  }
};

export {
  createHangoutInDatabase,
  addPhotoToHangoutInDatabase,
  fetchRecentHangoutsFromDatabase,
  fetchUpcomingHangoutsFromDatabase,
  fetchHangoutFromDatabase,
  createHangoutRequestsInDatabase,
  fetchHangoutRequestsInDatabase,
  handleHangoutRequestInDatabase,
};
