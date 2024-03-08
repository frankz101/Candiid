import {
  changeProfilePhoto,
  createUser,
  fetchUserPosts,
  searchUsers,
} from "../services/UserService.js";

const postUser = async (req, res) => {
  try {
    const result = await createUser(req.body);
    res.status(201).send({ result });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const result = await searchUsers(req.params.username);
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

// const putUserPostPosition = async (req, res) => {
//   try {
//     const { hangoutId } = req.params.hangoutId;
//     const result = await fetchUserPosts(userId);
//     res.status(201).send({ result });
//   } catch (err) {
//     res.status(500).send({ message: err.message });
//   }
// }

export { postUser, putUserProfilePhoto, getUserPosts, getUsers };
