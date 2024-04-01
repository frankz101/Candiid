import {
  saveTokenInDatabase,
  sendPushNotification,
} from "../db/NotificationDatabase.js";

const saveToken = async (tokenData) => {
  const { userId, pushToken } = tokenData;
  const result = await saveTokenInDatabase(userId, pushToken);
  return result;
};

const sendNotificationToUser = async (userId, title, body, screen) => {
  const result = await sendPushNotification(userId, title, body, screen);
  return result;
};

export { saveToken, sendNotificationToUser };
