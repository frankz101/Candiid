import {
  addPhotoToHangout,
  createHangout,
  fetchHangout,
  fetchRecentHangouts,
} from "../services/HangoutService.js";

const postHangout = async (req, res) => {
  try {
    const result = await createHangout(req.body);
    res.status(201).send({ result });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const postPhotoToHangout = async (req, res) => {
  try {
    const hangoutId = req.params.id;

    const photoData = {
      ...req.body,
      photoFile: req.file.buffer,
      originalFileName: req.file.originalname,
    };

    const result = await addPhotoToHangout(hangoutId, photoData);
    res.status(201).send({ result });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: err.message });
  }
};

const getRecentHangouts = async (req, res) => {
  try {
    const userId = req.params.userId;

    const result = await fetchRecentHangouts(userId);
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: err.message });
  }
};

const getHangout = async (req, res) => {
  try {
    const hangoutId = req.params.hangoutId;

    const result = await fetchHangout(hangoutId);
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: err.message });
  }
};

export { postHangout, postPhotoToHangout, getRecentHangouts, getHangout };
