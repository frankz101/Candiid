import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import {
  addPhotoToHangoutInDatabase,
  createHangoutInDatabase,
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

export { createHangout, addPhotoToHangout };
