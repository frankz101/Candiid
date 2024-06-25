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
  updateBackground,
} from "../services/UserService.js";

const postUser = async (req, res) => {
  try {
    const result = await createUser(req.body);
    res.status(201).send({ result });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const getUserWithId = async (req, res) => {
  try {
    const result = await searchUser(req.params.friendId, req.params.userId);
    res.status(201).send({ result });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const result = await searchUsers(req.params.username, req.params.userId);
    res.status(201).send({ result });
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
    res.status(201).send({ result });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const getUserPosts = async (req, res) => {
  try {
    const userId = req.params.id;
    const result = await fetchUserPosts(userId);
    res.status(201).send({ result });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const getUserPost = async (req, res) => {
  try {
    const userId = req.params.userId;
    const postId = req.params.postId;
    const result = await fetchUserPost(userId, postId);
    res.status(201).send({ result });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const getUserProfilePhoto = async (req, res) => {
  console.log("Profile Getting Called");
  try {
    const userId = req.params.id;
    const result = await fetchUserProfilePhoto(userId);
    res.status(201).send({ result });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// const putUserPostPosition = async (req, res) => {
//   try {
//     const { hangoutId } = req.params.hangoutId;
//     const result = await fetchUserPosts(userId);
//     res.status(201).send({ result });
//   } catch (err) {
//     res.status(500).send({ message: err.message });
//   }
// }

const getFriends = async (req, res) => {
  try {
    const userId = req.params.id;
    const result = await fetchFriends(userId);
    res.status(201).send({ result });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const putUserDetails = async (req, res) => {
  const userId = req.params.id;
  try {
    const result = await editUserDetails(userId, req.body);
    res.status(201).send({ result });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const getPosts = async (req, res) => {
  try {
    const userId = req.params.id;
    const result = await fetchFriendsPosts(userId);
    res.status(201).send({ result });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const putUserBackground = async (req, res) => {
  try {
    const userId = req.params.id;
    const result = await updateBackground(userId, req.body);
    res.status(201).send({ result });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export {
  postUser,
  putUserProfilePhoto,
  getUserPosts,
  getUsers,
  getUserPost,
  getUserProfilePhoto,
  getFriends,
  getUserWithId,
  putUserDetails,
  getPosts,
  putUserBackground,
};
