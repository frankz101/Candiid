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
  deleteDoc,
  or,
  arrayRemove,
  limit,
  arrayUnion,
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
      limit(8),
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

const deleteProfilePhotoInDatabase = async (userId) => {
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

      await updateDoc(userDocRef, { profilePhoto: null });
      console.log("Profile photo deleted successfully");
    }

    return userId;
  } catch (error) {
    console.error("Error deleting profile photo:", error);
    throw new Error("Failed to delete profile photo.");
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
            return { ...postData, id: doc.id, userInfo };
          })
        );

        return posts;
      });

      const allFriendsPosts = await Promise.all(postsPromises);
      allFriendsPosts.forEach((posts) => friendsPosts.push(...posts));

      friendsPosts.sort((a, b) => {
        const dateA = a.createdAt.toDate();
        const dateB = b.createdAt.toDate();
        return dateB.getTime() - dateA.getTime();
      });

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

const deleteUserInDatabase = async (userId) => {
  try {
    const userDoc = doc(db, "users", userId);
    if (userDoc) {
      deleteDoc(userDoc);
    }

    const friendRequestQuery = query(
      collection(db, "friendRequests"),
      or(where("senderId", "==", userId), where("receiverId", "==", userId))
    );
    const friendRequestSnapshot = await getDocs(friendRequestQuery);
    const friendRequests = friendRequestSnapshot.docs.map((doc) => doc.id);
    await Promise.all(
      friendRequests.map(async (requestId) => {
        const requestDocRef = doc(db, "friendRequests", requestId);
        await deleteDoc(requestDocRef);
      })
    );

    const hangoutRequestQuery = query(
      collection(db, "hangoutRequests"),
      or(where("userId", "==", userId), where("receiverId", "==", userId))
    );
    const hangoutRequestSnapshot = await getDocs(hangoutRequestQuery);
    const hangoutRequests = hangoutRequestSnapshot.docs.map((doc) => doc.id);
    await Promise.all(
      hangoutRequests.map(async (requestId) => {
        const requestDocRef = doc(db, "hangoutRequests", requestId);
        await deleteDoc(requestDocRef);
      })
    );

    const joinHangoutRequestQuery = query(
      collection(db, "joinHangoutRequests"),
      or(where("userId", "==", userId), where("receiverId", "==", userId))
    );
    const joinHangoutRequestSnapshot = await getDocs(joinHangoutRequestQuery);
    const joinHangoutRequests = joinHangoutRequestSnapshot.docs.map(
      (doc) => doc.id
    );
    await Promise.all(
      joinHangoutRequests.map(async (requestId) => {
        const requestDocRef = doc(db, "joinHangoutRequests", requestId);
        await deleteDoc(requestDocRef);
      })
    );

    const hangoutQuery = query(
      collection(db, "hangouts"),
      where("userId", "==", userId)
    );
    const hangoutSnapshot = await getDocs(hangoutQuery);
    const hangouts = hangoutSnapshot.docs.map((doc) => doc.id);
    await Promise.all(
      hangouts.map(async (requestId) => {
        const requestDocRef = doc(db, "hangouts", requestId);
        await deleteDoc(requestDocRef);
      })
    );

    const hangoutParticipantQuery = query(
      collection(db, "hangouts"),
      where("participantIds", "array-contains", userId)
    );
    const hangoutParticipantSnapshot = await getDocs(hangoutParticipantQuery);
    const hangoutParticipants = hangoutParticipantSnapshot.docs.map(
      (doc) => doc.id
    );
    await Promise.all(
      hangoutParticipants.map(async (requestId) => {
        const requestDocRef = doc(db, "hangouts", requestId);
        await updateDoc(requestDocRef, {
          participantIds: arrayRemove(userId),
        });
      })
    );

    const memoriesQuery = query(
      collection(db, "memories"),
      where("userId", "==", userId)
    );
    const memoriesSnapshot = await getDocs(memoriesQuery);
    const memories = memoriesSnapshot.docs.map((doc) => doc.id);
    await Promise.all(
      memories.map(async (requestId) => {
        const requestDocRef = doc(db, "memories", requestId);
        await deleteDoc(requestDocRef);
      })
    );

    const postQuery = query(
      collection(db, "posts"),
      where("userId", "==", userId)
    );
    const postSnapshot = await getDocs(postQuery);
    const posts = postSnapshot.docs.map((doc) => doc.id);
    await Promise.all(
      posts.map(async (requestId) => {
        const requestDocRef = doc(db, "posts", requestId);
        await deleteDoc(requestDocRef);
      })
    );

    const stickerQuery = query(
      collection(db, "stickers"),
      where("userId", "==", userId)
    );
    const stickerSnapshot = await getDocs(stickerQuery);
    const stickers = stickerSnapshot.docs.map((doc) => doc.id);
    await Promise.all(
      stickers.map(async (requestId) => {
        const requestDocRef = doc(db, "stickers", requestId);
        await deleteDoc(requestDocRef);
      })
    );

    const supportQuery = query(
      collection(db, "support"),
      where("userId", "==", userId)
    );
    const supportSnapshot = await getDocs(supportQuery);
    const supports = supportSnapshot.docs.map((doc) => doc.id);
    await Promise.all(
      supports.map(async (requestId) => {
        const requestDocRef = doc(db, "support", requestId);
        await deleteDoc(requestDocRef);
      })
    );

    return "User deleted";
  } catch (error) {
    console.error("Error deleting user: ", error);
    throw error;
  }
};

const createSupportInDatabase = async (ticketDetails) => {
  try {
    const supportCollectionRef = collection(db, "support");
    const docRef = await addDoc(supportCollectionRef, ticketDetails);
    return docRef.id;
  } catch (error) {
    console.error("Error creating support ticket: ", error);
    throw error;
  }
};

const createReportInDatabase = async (ticketDetails) => {
  try {
    const reportCollectionRef = collection(db, "reports");
    const docRef = await addDoc(reportCollectionRef, ticketDetails);
    return docRef.id;
  } catch (error) {
    console.error("Error creating report ticket: ", error);
    throw error;
  }
};

const createBlockInDatabase = async (details) => {
  try {
    const userId = details.userId;
    const blockedUserId = details.blockedUserId;
    const friendRequestQuery = query(
      collection(db, "friendRequests"),
      or(
        (where("senderId", "==", userId),
        where("receiverId", "==", blockedUserId)),
        (where("senderId", "==", blockedUserId),
        where("receiverId", "==", userId))
      )
    );
    const friendRequestSnapshot = await getDocs(friendRequestQuery);
    const friendRequests = friendRequestSnapshot.docs.map((doc) => doc.id);
    await Promise.all(
      friendRequests.map(async (requestId) => {
        const requestDocRef = doc(db, "friendRequests", requestId);
        await deleteDoc(requestDocRef);
      })
    );

    const hangoutRequestQuery = query(
      collection(db, "hangoutRequests"),
      or(
        (where("userId", "==", userId),
        where("receiverId", "==", blockedUserId)),
        (where("userId", "==", blockedUserId),
        where("receiverId", "==", userId))
      )
    );
    const hangoutRequestSnapshot = await getDocs(hangoutRequestQuery);
    const hangoutRequests = hangoutRequestSnapshot.docs.map((doc) => doc.id);
    await Promise.all(
      hangoutRequests.map(async (requestId) => {
        const requestDocRef = doc(db, "hangoutRequests", requestId);
        await deleteDoc(requestDocRef);
      })
    );

    const joinHangoutRequestQuery = query(
      collection(db, "joinHangoutRequests"),
      or(
        (where("userId", "==", userId),
        where("receiverId", "==", blockedUserId)),
        (where("userId", "==", blockedUserId),
        where("receiverId", "==", userId))
      )
    );
    const joinHangoutRequestSnapshot = await getDocs(joinHangoutRequestQuery);
    const joinHangoutRequests = joinHangoutRequestSnapshot.docs.map(
      (doc) => doc.id
    );
    await Promise.all(
      joinHangoutRequests.map(async (requestId) => {
        const requestDocRef = doc(db, "joinHangoutRequests", requestId);
        await deleteDoc(requestDocRef);
      })
    );

    const userDocRef = doc(db, "users", userId);
    await updateDoc(userDocRef, {
      friends: arrayRemove(blockedUserId),
    });
    const blockedUserDocRef = doc(db, "users", blockedUserId);
    await updateDoc(blockedUserDocRef, {
      friends: arrayRemove(userId),
    });
    const blockedCollectionRef = collection(db, "blocked");
    const docRef = await addDoc(blockedCollectionRef, details);

    return docRef.id;
  } catch (error) {
    console.error("Error blocking user: ", error);
    throw error;
  }
};

const fetchBlocksInDatabase = async (userId) => {
  try {
    const blockedCollectionRef = collection(db, "blocked");
    const docSnapshot = await getDocs(
      query(blockedCollectionRef, where("userId", "==", userId))
    );
    const result = await Promise.all(
      docSnapshot.docs.map(async (blockedDoc) => {
        const blockedUserDocRef = doc(
          db,
          "users",
          blockedDoc.data().blockedUserId
        );
        const blockedUserDoc = await getDoc(blockedUserDocRef);

        if (blockedUserDoc.exists()) {
          return {
            id: blockedDoc.id,
            userId: blockedUserDoc.data().userId,
            username: blockedUserDoc.data().username,
          };
        } else {
          console.log(
            `No such document for user ID: ${blockedDoc.data().blockedUserId}`
          );
          return null;
        }
      })
    );
    return result;
  } catch (error) {
    console.error("Error getting blocked users: ", error);
    throw error;
  }
};

const removeBlockInDatabase = async (blockId) => {
  try {
    const docRef = doc(db, "blocked", blockId);
    await deleteDoc(docRef);
    return "success";
  } catch (error) {
    console.error("Error deleting block: ", error);
    throw error;
  }
};

const fetchUserListInDatabase = async (userIds) => {
  try {
    let userDocs = [];
    const chunkSize = 10;
    const chunkedUserIds = [];
    for (let i = 0; i < userIds.length; i += chunkSize) {
      chunkedUserIds.push(userIds.slice(i, i + chunkSize));
    }

    // Iterate over each chunk and perform the query
    for (const chunk of chunkedUserIds) {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("userId", "in", chunk));
      const querySnapshot = await getDocs(q);

      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        userDocs.push({
          id: doc.id,
          userId: userData.userId,
          name: userData.name,
          username: userData.username,
          profilePhoto: {
            fileUrl: userData.profilePhoto?.fileUrl || null,
          },
        });
      });
    }

    return userDocs;
  } catch (error) {
    console.error("Error fetching user list: ", error);
    throw error;
  }
};

const addFriendsInDatabase = async (userId1, userId2) => {
  try {
    if (userId1 !== userId2) {
      const user1Doc = doc(db, "users", userId1);
      const user2Doc = doc(db, "users", userId2);

      await updateDoc(user1Doc, {
        friends: arrayUnion(userId2),
      });

      await updateDoc(user2Doc, {
        friends: arrayUnion(userId1),
      });
      return `${userId1} and ${userId2} are now friends`;
    } else {
      return;
    }
  } catch (error) {
    console.error("Error adding friends from invite: ", error);
    throw error;
  }
};

export {
  createUserInDatabase,
  changeProfilePhotoInDatabase,
  deleteProfilePhotoInDatabase,
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
  deleteUserInDatabase,
  createSupportInDatabase,
  createReportInDatabase,
  createBlockInDatabase,
  fetchBlocksInDatabase,
  removeBlockInDatabase,
  fetchUserListInDatabase,
  addFriendsInDatabase,
};
