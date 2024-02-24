import { createPostInDatabase } from "../db/PostDatabase.js";

const createPost = async (postData) => {
  const postId = await createPostInDatabase(postData);
  return postId;
};

export { createPost };
