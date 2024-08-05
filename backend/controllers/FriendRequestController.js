import {
  createFriendRequest,
  retrieveFriendRequests,
  respondToFriendRequest,
  unAddFriend,
} from "../services/FriendRequestService.js";

const getFriendRequests = async (req, res) => {
  try {
    const result = await retrieveFriendRequests(req.params.id);
    res.status(201).send(result);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const sendFriendRequest = async (req, res) => {
  try {
    const result = await createFriendRequest(req.body);
    res.status(201).send(result);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const handleFriendRequest = async (req, res) => {
  try {
    const result = await respondToFriendRequest(req.body);
    res.status(201).send(result);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const removeFriend = async (req, res) => {
  const userId = req.params.id;
  try {
    const result = await unAddFriend(userId, req.body);
    res.status(201).send(result);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export {
  getFriendRequests,
  sendFriendRequest,
  handleFriendRequest,
  removeFriend,
};
