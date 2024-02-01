import { createHangoutInDatabase } from "../db/HangoutDatabase.js";

const createHangout = async (hangoutData) => {
  const hangoutId = await createHangoutInDatabase(hangoutData);
  return hangoutId;
};

export { createHangout };
