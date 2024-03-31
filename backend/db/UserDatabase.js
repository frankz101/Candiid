import {
  getFirestore,
  collection,
  addDoc,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  where,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase.js";
import { deleteObject, ref } from "firebase/storage";
import { storage } from "../firebase.js";

const createUserInDatabase = async (user) => {
  const userDocRef = doc(db, "users", user.userId);
  const userDocSnap = await getDoc(userDocRef);
  let message;

  if (!userDocSnap.exists()) {
    await setDoc(userDocRef, user);
    message = "User created";
  } else {
    //maybe log the last log in with a date? useing update doc
    message = "User logged in";
  }
  return { userId: user.userId, message };
};

const searchUserInDatabase = async (userId) => {
  const userDocRef = doc(db, "users", userId);

  try {
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      console.log("User document data:", userDocSnap.data());
      return userDocSnap.data();
    } else {
      console.log("No such user document!");
      return null;
    }
  } catch (error) {
    console.error("Error getting user document:", error);
    throw error;
  }
};

const searchUsersInDatabase = async (username) => {
  const prefixLowerCase = username.toLowerCase();
  const endValue = prefixLowerCase + "\uf8ff";

  try {
    const usersRef = collection(db, "users");
    const q = query(
      usersRef,
      where("username", ">=", prefixLowerCase),
      where("username", "<=", endValue),
      orderBy("username")
    );

    const querySnapshot = await getDocs(q);

    const users = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return users;
  } catch (error) {
    console.error("Error searching users by username prefix:", error);
    throw error;
  }
};

const changeProfilePhotoInDatabase = async (userId, fileData) => {
  const userDocRef = doc(db, "users", userId);

  try {
    const userDoc = await getDoc(userDocRef);
    const currentProfilePhoto = userDoc.data().profilePhoto?.fileUrl;

    if (currentProfilePhoto) {
      const url = new URL(currentProfilePhoto);
      const fileNameEncoded = url.pathname.split("%2F").pop();
      const fileName = decodeURIComponent(fileNameEncoded);

      const path = `photos/profile-photos/${fileName}`;
      const currentPhotoRef = ref(storage, path);
      await deleteObject(currentPhotoRef)
        .then(() => {
          console.log("File deleted successfully");
        })
        .catch((error) => {
          console.log("Error");
        });
    }

    await updateDoc(userDocRef, {
      profilePhoto: fileData,
    });
    return userId;
  } catch (error) {
    console.error("Error updating document: ", error);
    throw new Error("Failed to change profile photo.");
  }
};

const fetchUserPostsFromDatabase = async (userId) => {
  const postsCollection = collection(db, "posts");

  const postsQuery = query(postsCollection, where("userId", "==", userId));

  try {
    const querySnapshot = await getDocs(postsQuery);
    const posts = [];
    querySnapshot.forEach((doc) => {
      posts.push({ id: doc.id, ...doc.data() });
    });
    return posts;
  } catch (error) {
    console.error("Error fetching user posts: ", error);
    throw error;
  }
};

const fetchUserPostFromDatabase = async (userId, postId) => {
  const postRef = doc(db, "posts", postId);

  try {
    const docSnapshot = await getDoc(postRef);
    if (docSnapshot.exists()) {
      return { id: docSnapshot.id, ...docSnapshot.data() };
    } else {
      console.log("No such post found!");
      return null;
    }
  } catch (error) {
    console.error("Error fetching post by ID: ", error);
    throw error;
  }
};

const fetchUserProfilePhotoFromDatabase = async (userId) => {
  const userRef = doc(db, "users", userId);

  try {
    const docSnapshot = await getDoc(userRef);
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      if (data.profilePhoto && data.profilePhoto.fileUrl) {
        return { imageUrl: data.profilePhoto.fileUrl };
      } else {
        console.log("User does not have profile photo");
        return null;
      }
    } else {
      console.log("No such post found!");
      return null;
    }
  } catch (error) {
    console.error("Error fetching profile photo by ID: ", error);
    throw error;
  }
};

const fetchFriendsFromDatabase = async (userId) => {
  const userRef = doc(db, "users", userId);

  try {
    const docSnapshot = await getDoc(userRef);
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      const friends = data.friends || [];
      const friendsData = [];

      for (const friendId of friends) {
        const friendRef = doc(db, "users", friendId);
        const friendSnapshot = await getDoc(friendRef);
        if (friendSnapshot.exists()) {
          const friendData = friendSnapshot.data();
          const profilePhotoUrl = friendData.profilePhoto?.fileUrl || null;
          friendsData.push({
            id: friendId,
            profilePhoto: profilePhotoUrl,
            firstName: friendData.name,
          });
        }
      }

      return friendsData;
    } else {
      console.log("No such user found!");
      return [];
    }
  } catch (error) {
    console.error("Error fetching friends from database: ", error);
    throw error;
  }
};

const fetchFriendsPostsFromDatabase = async (userId) => {
  const userRef = doc(db, "users", userId);

  try {
    const docSnapshot = await getDoc(userRef);
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      const friends = data.friends || [];
      const friendsPosts = [];

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      for (const friendId of friends) {
        const q = query(
          collection(db, "posts"),
          where("userId", "==", friendId),
          where("createdAt", ">=", oneWeekAgo),
          orderBy("createdAt", "desc")
        );

        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          friendsPosts.push(doc.data());
        });
      }

      return friendsPosts;
    } else {
      console.log("No such user found!");
      return [];
    }
  } catch (error) {
    console.error("Error fetching friends' posts from database: ", error);
    throw error;
  }
};

export {
  createUserInDatabase,
  changeProfilePhotoInDatabase,
  fetchUserPostsFromDatabase,
  fetchUserPostFromDatabase,
  fetchUserProfilePhotoFromDatabase,
  searchUsersInDatabase,
  fetchFriendsFromDatabase,
  searchUserInDatabase,
  fetchFriendsPostsFromDatabase,
};
