import {
  addFriendsInDatabase,
  deleteProfilePhotoInDatabase,
} from "../db/UserDatabase.js";
import {
  changeProfilePhoto,
  createUser,
  fetchUserPost,
  fetchUserPosts,
  fetchUserProfilePhoto,
  searchUsers,
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
  fetchUserList,
} from "../services/UserService.js";

const postUser = async (req, res) => {
  try {
    const result = await createUser(req.body);
    res.status(201).send(result);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const getUserWithId = async (req, res) => {
  try {
    const result = await searchUser(req.params.friendId, req.params.userId);
    res.status(201).send(result);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const result = await searchUsers(req.params.username, req.params.userId);
    res.status(201).send(result);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const putUserProfilePhoto = async (req, res) => {
  try {
    const userId = req.params.id;

    const photoData = {
      ...req.body,
      photoFile: req.file.buffer,
      originalFileName: req.file.originalname,
    };

    const result = await changeProfilePhoto(userId, photoData);
    res.status(201).send(result);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const deleteUserProfilePhoto = async (req, res) => {
  try {
    const userId = req.params.userId;

    const result = await deleteProfilePhotoInDatabase(userId);
    if (result) {
      res.status(200).json({ message: "Profile photo deleted successfully." });
    } else {
      res
        .status(404)
        .json({ message: "User not found or no profile photo to delete." });
    }
  } catch (error) {
    console.error("Error deleting profile photo:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const getUserPosts = async (req, res) => {
  try {
    const userId = req.params.id;
    const result = await fetchUserPosts(userId);
    res.status(201).send(result);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const getUserPost = async (req, res) => {
  try {
    const userId = req.params.userId;
    const postId = req.params.postId;
    const result = await fetchUserPost(userId, postId);
    res.status(201).send(result);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const getUserProfilePhoto = async (req, res) => {
  console.log("Profile Getting Called");
  try {
    const userId = req.params.id;
    const result = await fetchUserProfilePhoto(userId);
    res.status(201).send(result);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// const putUserPostPosition = async (req, res) => {
//   try {
//     const { hangoutId } = req.params.hangoutId;
//     const result = await fetchUserPosts(userId);
//     res.status(201).send(result);
//   } catch (err) {
//     res.status(500).send({ message: err.message });
//   }
// }

const getFriends = async (req, res) => {
  try {
    const userId = req.params.id;
    const result = await fetchFriends(userId);
    res.status(201).send(result);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const putUserDetails = async (req, res) => {
  const userId = req.params.id;
  try {
    const result = await editUserDetails(userId, req.body);
    res.status(201).send(result);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const getPosts = async (req, res) => {
  try {
    const userId = req.params.id;
    const result = await fetchFriendsPosts(userId);
    res.status(201).send(result);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const getProfilePics = async (req, res) => {
  try {
    const users = req.body.users;
    const result = await fetchProfilePics(users);
    res.status(201).send(result);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const putUserBackground = async (req, res) => {
  try {
    const userId = req.params.id;
    const result = await updateBackground(userId, req.body);
    res.status(201).send(result);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const getContacts = async (req, res) => {
  try {
    const batch = req.body.phoneNumbers;
    const userId = req.body.userId;
    const result = await fetchContacts(batch, userId);
    res.status(201).send(result);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const result = await removeUser(userId);
    res.status(201).send(result);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const postSupport = async (req, res) => {
  try {
    const ticketDetails = req.body.ticketDetails;
    const result = await createSupport(ticketDetails);
    res.status(201).send(result);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const postReport = async (req, res) => {
  try {
    const ticketDetails = req.body.ticketDetails;
    const result = await createReport(ticketDetails);
    res.status(201).send(result);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const postBlock = async (req, res) => {
  try {
    const details = req.body.details;
    const result = await createBlock(details);
    res.status(201).send(result);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const getBlocks = async (req, res) => {
  try {
    const userId = req.params.userId;
    const result = await fetchBlocks(userId);
    res.status(201).send(result);
  } catch (error) {
    res.status(500).send({ message: err.message });
  }
};

const deleteBlock = async (req, res) => {
  try {
    const blockId = req.params.id;
    const result = await removeBlock(blockId);
    res.status(201).send(result);
  } catch (error) {
    res.status(500).send({ message: err.message });
  }
};

const getUserList = async (req, res) => {
  try {
    const userIds = req.body.userIds;
    const result = await fetchUserList(userIds);
    res.status(201).send(result);
  } catch (error) {
    res.status(500).send({ message: err.message });
  }
};

const putFriends = async (req, res) => {
  try {
    const { userId1, userId2 } = req.body;
    const result = await addFriendsInDatabase(userId1, userId2);
    res.status(201).send(result);
  } catch (error) {
    res.status(500).send({ message: err.message });
  }
};

export {
  postUser,
  putUserProfilePhoto,
  deleteUserProfilePhoto,
  getUserPosts,
  getUsers,
  getUserPost,
  getUserProfilePhoto,
  getFriends,
  getUserWithId,
  putUserDetails,
  getPosts,
  putUserBackground,
  getProfilePics,
  getContacts,
  deleteUser,
  postSupport,
  postReport,
  postBlock,
  getBlocks,
  deleteBlock,
  getUserList,
  putFriends,
};
