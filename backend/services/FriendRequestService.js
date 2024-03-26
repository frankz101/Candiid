import {
  createFriendRequestInDatabase,
  getFriendRequestInDatabase,
  handleFriendRequestInDatabase,
} from "../db/FriendRequestDatabase.js";

const retrieveFriendRequests = async (userId) => {
  const result = await getFriendRequestInDatabase(userId);
  return result;
};

const createFriendRequest = async (friendRequestData) => {
  const result = await createFriendRequestInDatabase(friendRequestData);
  return result;
};

const respondToFriendRequest = async (friendRequestData) => {
  const result = await handleFriendRequestInDatabase(friendRequestData);
  return result;
};

export { retrieveFriendRequests, createFriendRequest, respondToFriendRequest };
