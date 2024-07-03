import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import {
  changeProfilePhotoInDatabase,
  createUserInDatabase,
  fetchUserPostFromDatabase,
  fetchUserPostsFromDatabase,
  fetchUserProfilePhotoFromDatabase,
  searchUsersInDatabase,
  fetchFriendsFromDatabase,
  searchUserInDatabase,
  editUserDetailsInDatabase,
  fetchFriendsPostsFromDatabase,
  fetchProfilePicsInDatabase,
  updateBackgroundFromDatabase,
  fetchContactsInDatabase,
  deleteUserInDatabase,
  createSupportInDatabase,
  createReportInDatabase,
  createBlockInDatabase,
  fetchBlocksInDatabase,
  removeBlockInDatabase,
} from "../db/UserDatabase.js";
import { storage } from "../firebase.js";
import { retrieveFriendRequestsSent } from "./FriendRequestService.js";

const createUser = async (userData) => {
  const userId = await createUserInDatabase(userData);
  return userId;
};

const searchUser = async (friendId, userId) => {
  try {
    if (friendId === userId) {
      // If the friendId is the same as the userId, return the user data without checking the friend status
      return await searchUserInDatabase(friendId);
    }

    const friendData = await searchUserInDatabase(friendId);

    // Check if the friendId is in the user's friends list
    const friends = await fetchFriends(userId);
    const friendIds = friends.map((friend) => friend.userId);
    const isAlreadyFriend = friendIds.includes(friendId);

    // Check if there's a pending friend request from the user to the friend
    const sentFriendRequests = await retrieveFriendRequestsSent(userId);
    const hasSentRequest = sentFriendRequests.some(
      (request) => request.receiverId === friendId
    );

    const friendsRequests = await retrieveFriendRequestsSent(friendId);
    const incomingFriendRequest = friendsRequests.some(
      (request) => request.receiverId === userId
    );

    let friendStatus = "Not Friends";
    if (isAlreadyFriend) {
      friendStatus = "Already Friends";
    } else if (hasSentRequest) {
      friendStatus = "Friend Requested";
    } else if (incomingFriendRequest) {
      friendStatus = "Incoming Request";
    }

    return {
      ...friendData,
      friendStatus,
    };
  } catch (error) {
    console.error("Error getting friend data with status:", error);
    throw error;
  }
};

const searchUsers = async (username, userId) => {
  try {
    const [usersIds, friends, friendRequests, blockedUsers] = await Promise.all(
      [
        searchUsersInDatabase(username),
        fetchFriends(userId),
        retrieveFriendRequestsSent(userId),
        fetchBlocks(userId),
      ]
    );

    const friendIds = new Set(friends.map((friend) => friend.userId));
    const friendRequestsIds = new Set(
      friendRequests.map((friendRequest) => friendRequest.receiverId)
    );
    const blockedUsersIds = new Set(blockedUsers.map((user) => user.userId));

    const filteredUserIds = usersIds.filter(
      (user) => !blockedUsersIds.has(user.userId)
    );

    const usersWithFriendshipStatus = await Promise.all(
      filteredUserIds.map(async (user) => {
        // Skip users who have blocked the current user
        const userBlocked = await fetchBlocks(user.userId);
        const userBlockedIds = new Set(userBlocked.map((user) => user.userId));
        if (userBlockedIds.has(userId)) {
          return null;
        }

        // Check incoming friend requests
        const incomingFriendRequests = await retrieveFriendRequestsSent(
          user.userId
        );
        const incomingFriendRequest = incomingFriendRequests.some(
          (request) => request.receiverId === userId
        );

        // Determine friendship status
        let friendStatus = "Not Friends";
        if (friendIds.has(user.userId)) {
          friendStatus = "Already Friends";
        } else if (friendRequestsIds.has(user.userId)) {
          friendStatus = "Friend Requested";
        } else if (incomingFriendRequest) {
          friendStatus = "Incoming Request";
        }

        return {
          ...user,
          friendStatus,
        };
      })
    );

    return usersWithFriendshipStatus.filter((user) => user !== null);
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

const editUserDetails = async (userId, userDetails) => {
  const result = await editUserDetailsInDatabase(userId, userDetails);
  return result;
};

const fetchFriendsPosts = async (userId) => {
  const result = await fetchFriendsPostsFromDatabase(userId);
  return result;
};

const fetchProfilePics = async (users) => {
  const result = await fetchProfilePicsInDatabase(users);
  return result;
};

const updateBackground = async (userId, backgroundDetails) => {
  const result = await updateBackgroundFromDatabase(userId, backgroundDetails);
  return result;
};

const fetchContacts = async (batch, userId) => {
  const users = await fetchContactsInDatabase(batch);
  const friends = await fetchFriends(userId);
  const friendIds = friends.map((friend) => friend.userId);

  const sentFriendRequests = await retrieveFriendRequestsSent(userId);
  const friendRequestsIds = sentFriendRequests.map(
    (friendRequest) => friendRequest.userId
  );
  const usersWithFriendshipStatus = users.map((user) => {
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
};

const removeUser = async (userId) => {
  const result = await deleteUserInDatabase(userId);
  return result;
};

const createSupport = async (ticketDetails) => {
  const result = await createSupportInDatabase(ticketDetails);
  return result;
};

const createReport = async (ticketDetails) => {
  const result = await createReportInDatabase(ticketDetails);
  return result;
};

const createBlock = async (details) => {
  const result = await createBlockInDatabase(details);
  return result;
};

const fetchBlocks = async (userId) => {
  const result = await fetchBlocksInDatabase(userId);
  return result;
};

const removeBlock = async (blockId) => {
  const result = await removeBlockInDatabase(blockId);
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
  searchUser,
  editUserDetails,
  fetchFriendsPosts,
  fetchProfilePics,
  updateBackground,
  fetchContacts,
  removeUser,
  createSupport,
  createReport,
  createBlock,
  fetchBlocks,
  removeBlock,
};
