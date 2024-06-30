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
            userId: friendId,
            profilePhoto: {
              fileUrl: profilePhotoUrl,
            },
            name: friendData.name,
            username: friendData.username,
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

const editUserDetailsInDatabase = async (userId, userDetails) => {
  try {
    const userDocRef = doc(db, "users", userId);
    await updateDoc(userDocRef, userDetails);
    console.log(`User ${userId} updated successfully.`);
  } catch (error) {
    console.error("Error updating user details:", error);
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

      const postsPromises = friends.map(async (friendId) => {
        const q = query(
          collection(db, "posts"),
          where("userId", "==", friendId),
          where("createdAt", ">=", oneWeekAgo),
          orderBy("createdAt", "desc")
        );

        const querySnapshot = await getDocs(q);
        const posts = await Promise.all(
          querySnapshot.docs.map(async (doc) => {
            const postData = doc.data();
            const userInfo = await searchUserInDatabase(postData.userId);
            return { ...postData, userInfo };
          })
        );

        return posts;
      });

      const allFriendsPosts = await Promise.all(postsPromises);
      allFriendsPosts.forEach((posts) => friendsPosts.push(...posts));

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

const updateBackgroundFromDatabase = async (userId, backgroundDetails) => {
  try {
    const userDocRef = doc(db, "users", userId);

    await updateDoc(userDocRef, {
      backgroundDetails,
    });

    return userId;
    console.log("Background details updated successfully.");
  } catch (error) {
    console.error("Error updating background details:", error);
    throw new Error("Failed to update background details");
  }
};
const fetchProfilePicsInDatabase = async (users) => {
  try {
    const userInfoPromises = users.map(async (userId) => {
      const userDoc = await getDoc(doc(db, "users", userId));
      let fileUrl = "";
      if (userDoc.exists() && userDoc.data().profilePhoto?.fileUrl) {
        fileUrl = userDoc.data().profilePhoto.fileUrl;
      } else if (userDoc.exists()) {
        fileUrl = null;
      }
      return { id: userId, name: userDoc.data().name, profilePhoto: fileUrl };
    });

    const userInfo = await Promise.all(userInfoPromises);
    return userInfo;
  } catch (error) {
    console.error("Error fetching profile pictures: ", error);
    throw error;
  }
};

const fetchContactsInDatabase = async (phoneNumbers) => {
  try {
    if (!phoneNumbers || !Array.isArray(phoneNumbers)) {
      return [];
    }

    // Batch the phone number queries if Firestore has a limit on array size
    const batchSize = 10; // Adjust the batch size according to Firestore limits
    let registeredUsers = [];

    const normalizePhoneNumber = (phoneNumber) => {
      const cleaned = phoneNumber.replace(/\D/g, "");

      if (cleaned.length === 10) {
        return `+1${cleaned}`;
      }

      return `+${cleaned}`;
    };

    const normalizedPhoneNumbers = phoneNumbers.map(normalizePhoneNumber);

    for (let i = 0; i < normalizedPhoneNumbers.length; i += batchSize) {
      const batch = normalizedPhoneNumbers.slice(i, i + batchSize);
      const usersSnapshot = await getDocs(
        query(collection(db, "users"), where("phoneNumber", "in", batch))
      );

      const users = usersSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          name: data.name,
          userId: data.userId,
          username: data.username,
          profilePhoto: {
            fileUrl: data.profilePhoto?.fileUrl || null,
          },
        };
      });
      registeredUsers = registeredUsers.concat(users);
    }

    return registeredUsers;
  } catch (error) {
    console.error("Error checking contacts: ", error);
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
  editUserDetailsInDatabase,
  fetchFriendsPostsFromDatabase,
  updateBackgroundFromDatabase,
  fetchProfilePicsInDatabase,
  fetchContactsInDatabase,
};
