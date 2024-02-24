import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import {
  changeProfilePhotoInDatabase,
  createUserInDatabase,
  fetchUserPostsFromDatabase,
} from "../db/UserDatabase.js";
import { storage } from "../firebase.js";

const createUser = async (userData) => {
  const userId = await createUserInDatabase(userData);
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

export { createUser, changeProfilePhoto, fetchUserPosts };
