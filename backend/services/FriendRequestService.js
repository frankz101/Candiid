import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { createFriendRequestInDatabase } from "../db/FriendRequestDatabase.js";
import { storage } from "../firebase.js";

const createFriendRequest = async (friendRequestData) => {
  const result = await createFriendRequestInDatabase(friendRequestData);
  return result;
};

export { createFriendRequest };
