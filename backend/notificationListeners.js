import { onSnapshot, collection, doc, getDoc } from "firebase/firestore";
import { sendPushNotification } from "./db/NotificationDatabase.js";
import { db } from "./firebase.js";

const listenToFriendRequests = () => {
  const friendRequestsRef = collection(db, "friendRequests");
  let isInitialLoad = true;

  const unsubscribe = onSnapshot(
    friendRequestsRef,
    (snapshot) => {
      if (isInitialLoad) {
        isInitialLoad = false;
      } else {
        snapshot.docChanges().forEach(async (change) => {
          if (change.type === "added") {
            const data = change.doc.data();
            try {
              const receiverDocRef = doc(db, "users", data.receiverId);
              const senderDocRef = doc(db, "users", data.senderId);
              const senderDocSnap = await getDoc(senderDocRef);
              const userId = receiverDocRef.id;
              if (senderDocSnap.exists()) {
                await sendPushNotification(
                  userId,
                  "New Friend Request yeahhhhhh",
                  `${
                    senderDocSnap.data().username
                  } has sent you a friend request!`,
                  "/(profile)/NotificationsScreen"
                );
              }
            } catch (error) {
              console.error("Error processing friend requests:", error);
            }
          }
        });
      }
    },
    (error) => {
      console.error("Error listening to friend requests:", error);
    }
  );

  return unsubscribe;
};

const listenToHangoutRequests = () => {
  const hangoutRequestRef = collection(db, "hangoutRequests");
  let isInitialLoad = true;

  const unsubscribe = onSnapshot(
    hangoutRequestRef,
    (snapshot) => {
      if (isInitialLoad) {
        isInitialLoad = false;
      } else {
        snapshot.docChanges().forEach(async (change) => {
          if (change.type === "added") {
            const data = change.doc.data();

            try {
              const receiverDocRef = doc(db, "users", data.receiverId);
              const senderDocRef = doc(db, "users", data.userId);
              const senderDocSnap = await getDoc(senderDocRef);
              const userId = receiverDocRef.id;

              if (senderDocSnap.exists()) {
                await sendPushNotification(
                  userId,
                  "New Hangout Request",
                  `${senderDocSnap.data().username} is inviting you to join ${
                    data.hangoutName
                  }!`,
                  "/(profile)/NotificationsScreen"
                );
              } else {
                console.log("Sender document does not exist");
              }
            } catch (error) {
              console.error("Error processing hangout requests:", error);
            }
          }
        });
      }
    },
    (error) => {
      console.error("Error listening to hangout requests:", error);
    }
  );

  return unsubscribe;
};

const listenToJoinHangoutRequests = () => {
  const hangoutRequestRef = collection(db, "joinHangoutRequests");
  let isInitialLoad = true;
  const unsubscribe = onSnapshot(
    hangoutRequestRef,
    (snapshot) => {
      if (isInitialLoad) {
        isInitialLoad = false;
      } else {
        snapshot.docChanges().forEach(async (change) => {
          if (change.type === "added") {
            const data = change.doc.data();
            try {
              const receiverDocRef = doc(db, "users", data.receiverId);
              const senderDocRef = doc(db, "users", data.userId);
              const senderDocSnap = await getDoc(senderDocRef);
              const userId = receiverDocRef.id;
              if (senderDocSnap.exists()) {
                await sendPushNotification(
                  userId,
                  "New Hangout Request",
                  `${senderDocSnap.data().username} wants to join ${
                    data.hangoutName
                  }!`,
                  "/(profile)/NotificationsScreen"
                );
              }
            } catch (error) {
              console.error("Error processing join hangout requests:", error);
            }
          }
        });
      }
    },
    (error) => {
      console.error("Error listening to join hangout requests:", error);
    }
  );
  return unsubscribe();
};

export function initializeListeners() {
  listenToFriendRequests();
  listenToHangoutRequests();
  listenToJoinHangoutRequests();
}
