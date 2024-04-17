import {
  createFriendRequestInDatabase,
  getFriendRequestInDatabase,
  handleFriendRequestInDatabase,
  removeFriendInDatabase,
  getFriendRequestSentInDatabase,
} from "../db/FriendRequestDatabase.js";

const retrieveFriendRequests = async (userId) => {
  const result = await getFriendRequestInDatabase(userId);
  return result;
};

const retrieveFriendRequestsSent = async (userId) => {
  const result = await getFriendRequestSentInDatabase(userId);
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

const unAddFriend = async (userId, friendData) => {
  console.log("Removing");
  const result = await removeFriendInDatabase(userId, friendData.receiverId);
  return result;
};

export {
  retrieveFriendRequests,
  createFriendRequest,
  respondToFriendRequest,
  unAddFriend,
  retrieveFriendRequestsSent,
};
