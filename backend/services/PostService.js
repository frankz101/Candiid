import {
  createPostInDatabase,
  fetchPostInDatabase,
} from "../db/PostDatabase.js";

const createPost = async (postData) => {
  const postId = await createPostInDatabase(postData);
  return postId;
};

const fetchPost = async (userId, hangoutId) => {
  const result = await fetchPostInDatabase(userId, hangoutId);
  return result;
};

export { createPost, fetchPost };
