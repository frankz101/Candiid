import {
  saveToken,
  sendNotificationToUser,
} from "../services/NotificationService.js";

const postToken = async (req, res) => {
  try {
    const result = await saveToken(req.body);
    res.status(201).send(result);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const sendNotification = async (req, res) => {
  try {
    const { userId, title, body, screen } = req.body;
    const result = await sendNotificationToUser(userId, title, body, screen);
    res.status(200).send(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error sending notification", error: error.message });
  }
};

export { postToken, sendNotification };
