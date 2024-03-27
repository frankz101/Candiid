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

const createUser = async (userData) => {
  const userId = await createUserInDatabase(userData);
  return userId;
};

const searchUsers = async (username) => {
  const userId = await searchUsersInDatabase(username);
  return userId;
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
