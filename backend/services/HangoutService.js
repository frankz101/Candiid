import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import {
  addPhotoToHangoutInDatabase,
  createHangoutInDatabase,
  fetchHangoutFromDatabase,
  fetchRecentHangoutsFromDatabase,
  fetchHangoutRequestsInDatabase,
  fetchUpcomingHangoutsFromDatabase,
  createHangoutRequestsInDatabase,
  handleHangoutRequestInDatabase,
  fetchFreshHangoutsInDatabase,
  createJoinHangoutRequestInDatabase,
} from "../db/HangoutDatabase.js";
import { storage } from "../firebase.js";

const createHangout = async (hangoutData) => {
  const result = await createHangoutInDatabase(hangoutData);
  return result;
};

const addPhotoToHangout = async (hangoutId, photoData) => {
  const { photoFile, originalFileName, takenBy, takenAt } = photoData;

  const fileName = `photos/${hangoutId}/${Date.now()}-${originalFileName}`;
  const storageRef = ref(storage, fileName);
  const metadata = {
    contentType: "image/jpeg",
    customMetadata: {
      takenBy: takenBy,
      takenAt: takenAt,
    },
  };

  try {
    const snapshot = await uploadBytes(storageRef, photoFile, metadata);
    console.log("Uploaded a photo with metadata!");

    const fileUrl = await getDownloadURL(snapshot.ref);
    const result = await addPhotoToHangoutInDatabase(hangoutId, {
      fileUrl,
      takenBy,
      takenAt,
    });
    return result;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

const fetchRecentHangouts = async (userId) => {
  const result = await fetchRecentHangoutsFromDatabase(userId);
  return result;
};
const fetchUpcomingHangouts = async (userId) => {
  const result = await fetchUpcomingHangoutsFromDatabase(userId);
  return result;
};

const fetchHangout = async (hangoutId) => {
  console.log(hangoutId);
  const result = await fetchHangoutFromDatabase(hangoutId);
  return result;
};

const fetchHangoutRequests = async (userId) => {
  const result = await fetchHangoutRequestsInDatabase(userId);
  return result;
};

const createHangoutRequests = async (hangoutId, hangoutRequestData) => {
  const { selectedFriends, hangoutName, userId } = hangoutRequestData;
  const result = await createHangoutRequestsInDatabase(
    hangoutId,
    selectedFriends,
    hangoutName,
    userId
  );
  return result;
};

const handleHangoutRequest = async (hangoutId, handleRequestData) => {
  const result = await handleHangoutRequestInDatabase(
    hangoutId,
    handleRequestData
  );
  return result;
};

const fetchFreshHangouts = async (userId) => {
  const result = await fetchFreshHangoutsInDatabase(userId);
  return result;
};

const createJoinHangoutRequest = async (
  userId,
  recipientId,
  hangoutName,
  hangoutId
) => {
  const result = await createJoinHangoutRequestInDatabase(
    userId,
    recipientId,
    hangoutName,
    hangoutId
  );
  return result;
};

export {
  createHangout,
  addPhotoToHangout,
  fetchRecentHangouts,
  fetchHangout,
  fetchHangoutRequests,
  fetchUpcomingHangouts,
  createHangoutRequests,
  handleHangoutRequest,
  fetchFreshHangouts,
  createJoinHangoutRequest,
};
