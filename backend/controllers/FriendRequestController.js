import { createFriendRequest } from "../services/FriendRequestService.js";

const sendFriendRequest = async (req, res) => {
  try {
    const result = await createFriendRequest(req.body);
    res.status(201).send({ result });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export { sendFriendRequest };
