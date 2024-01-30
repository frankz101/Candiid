import { createUserInDatabase } from "../db/UserDatabase.js";

const createUser = async (userData) => {
  const userId = await createUserInDatabase(userData);
  return userId;
};

export { createUser };
