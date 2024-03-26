import {
  createFriendRequestInDatabase,
  getFriendRequestInDatabase,
} from "../db/FriendRequestDatabase.js";

const createFriendRequest = async (friendRequestData) => {
  const result = await createFriendRequestInDatabase(friendRequestData);
  return result;
};

const retrieveFriendRequests = async (userId) => {
  const result = await getFriendRequestInDatabase(userId);
  return result;
};

export { createFriendRequest, retrieveFriendRequests };
