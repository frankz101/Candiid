import {
  createFriendRequest,
  retrieveFriendRequests,
  respondToFriendRequest,
} from "../services/FriendRequestService.js";

const getFriendRequests = async (req, res) => {
  try {
    const result = await retrieveFriendRequests(req.params.id);
    res.status(201).send({ result });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const sendFriendRequest = async (req, res) => {
  try {
    const result = await createFriendRequest(req.body);
    res.status(201).send({ result });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const handleFriendRequest = async (req, res) => {
  try {
    const result = await respondToFriendRequest(req.body);
    res.status(201).send({ result });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export { getFriendRequests, sendFriendRequest, handleFriendRequest };
