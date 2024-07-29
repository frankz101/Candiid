import { createPost, fetchPost } from "../services/PostService.js";

const postPost = async (req, res) => {
  try {
    const result = await createPost(req.body);
    res.status(201).send(result);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const getPost = async (req, res) => {
  try {
    const { userId, hangoutId } = req.params;
    const result = await fetchPost(userId, hangoutId);
    res.status(201).send(result);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export { postPost, getPost };
