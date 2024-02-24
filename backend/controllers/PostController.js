import { createPost } from "../services/PostService.js";

const postPost = async (req, res) => {
  try {
    const result = await createPost(req.body);
    res.status(201).send({ result });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export { postPost };
