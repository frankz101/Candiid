import {
  addMessageToDatabase,
  fetchMessagesFromDatabase,
} from "../db/ChatDatabase.js";

const postMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const { roomId } = req.params;
    const result = await addMessageToDatabase(roomId, message);
    res.status(201).send({ result });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const getMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { limit: limitQuery, lastMessageId } = req.query;
    const result = await fetchMessagesFromDatabase(
      roomId,
      limitQuery,
      lastMessageId
    );
    res.status(200).send({ result });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export { postMessage, getMessages };
