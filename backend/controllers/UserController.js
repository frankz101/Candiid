import { createUser } from "../services/UserService.js";

const postUser = async (req, res) => {
  try {
    const result = await createUser(req.body);
    res.status(201).send({ userId: result.userId, message: result.message });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export { postUser };
