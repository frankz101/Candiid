import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase.js";
import { Expo } from "expo-server-sdk";
import { expo } from "../index.js";

const saveTokenInDatabase = async (userId, expoPushToken) => {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const result = await updateDoc(userDocRef, {
        expoPushToken: expoPushToken,
      });
      console.log(`Expo push token saved for user ${userId}`);
      return `Expo push token saved for user ${userId}`;
    } else {
      console.log(`User ${userId} does not exist in the database`);
    }
  } catch (error) {
    console.error("Error saving Expo push token in database:", error);
    throw error;
  }
};

const sendPushNotification = async (userId, title, body, screen) => {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      const user = userDocSnap.data();
      if (user.expoPushToken) {
        const pushToken = user.expoPushToken;
        if (!Expo.isExpoPushToken(pushToken)) {
          console.error(
            `Push token ${pushToken} is not a valid Expo push token`
          );
          return;
        }

        const messages = [
          {
            to: pushToken,
            title: title,
            body: body,
            data: {
              screen: screen,
            },
          },
        ];

        const ticketChunk = await expo.sendPushNotificationsAsync(messages);
        console.log(
          `Notification sent with ticket: ${JSON.stringify(ticketChunk)}`
        );
        return ticketChunk;
      } else {
        console.log(`User ${userId} does not have a push token.`);
      }
    } else {
      console.log(`User ${userId} does not exist in the database.`);
    }
  } catch (error) {
    console.error(`Error sending notification to user ${userId}: ${error}`);
    throw error;
  }
};

export { saveTokenInDatabase, sendPushNotification };
