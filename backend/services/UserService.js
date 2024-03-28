import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import {
  changeProfilePhotoInDatabase,
  createUserInDatabase,
  fetchUserPostFromDatabase,
  fetchUserPostsFromDatabase,
  fetchUserProfilePhotoFromDatabase,
  searchUsersInDatabase,
  fetchFriendsFromDatabase,
} from "../db/UserDatabase.js";
import { storage } from "../firebase.js";
import {
  retrieveFriendRequests,
  retrieveFriendRequestsSent,
} from "./FriendRequestService.js";

const createUser = async (userData) => {
  const userId = await createUserInDatabase(userData);
  return userId;
};

const searchUsers = async (username, userId) => {
  try {
    const usersIds = await searchUsersInDatabase(username);

    const friends = await fetchFriends(userId);
    const friendIds = friends.map((friend) => friend.id);

    const friendRequests = await retrieveFriendRequestsSent(userId);
    const friendRequestsIds = friendRequests.map(
      (friendRequest) => friendRequest.userId
    );
    const usersWithFriendshipStatus = usersIds.map((user) => {
      let friendStatus = "Not Friends";
      if (friendIds.includes(user.userId)) {
        friendStatus = "Already Friends";
      } else if (friendRequestsIds.includes(user.userId)) {
        friendStatus = "Friend Requested";
      }
      return {
        ...user,
        friendStatus,
      };
    });

    return usersWithFriendshipStatus;
  } catch (error) {
    console.error("Error searching users:", error);
    throw error;
  }
};

const changeProfilePhoto = async (userId, photoData) => {
  const { photoFile, originalFileName } = photoData;
  const fileName = `photos/profile-photos/${Date.now()}-${originalFileName}`;
  const storageRef = ref(storage, fileName);
  const metadata = {
    contentType: "image/jpeg",
  };
  try {
    const snapshot = await uploadBytes(storageRef, photoFile, metadata);
    console.log("Uploaded a photo with metadata!");

    const fileUrl = await getDownloadURL(snapshot.ref);
    const result = await changeProfilePhotoInDatabase(userId, {
      fileUrl,
    });
    return result;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

const fetchUserPosts = async (userId) => {
  const result = await fetchUserPostsFromDatabase(userId);
  return result;
};

const fetchUserPost = async (userId, postId) => {
  const result = await fetchUserPostFromDatabase(userId, postId);
  return result;
};

const fetchUserProfilePhoto = async (userId) => {
  const result = await fetchUserProfilePhotoFromDatabase(userId);
  return result;
};

const fetchFriends = async (userId) => {
  const result = await fetchFriendsFromDatabase(userId);
  return result;
};

export {
  createUser,
  changeProfilePhoto,
  fetchUserPosts,
  searchUsers,
  fetchUserPost,
  fetchUserProfilePhoto,
  fetchFriends,
};
