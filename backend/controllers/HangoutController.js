import {
  addPhotoToHangout,
  createHangout,
  fetchHangout,
  fetchRecentHangouts,
  fetchUpcomingHangouts,
  fetchHangoutRequests,
  createHangoutRequests,
  handleHangoutRequest,
  fetchFreshHangouts,
  createJoinHangoutRequest,
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

const getUpcomingHangouts = async (req, res) => {
  try {
    const userId = req.params.userId;
    const result = await fetchUpcomingHangouts(userId);
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

const getHangoutRequests = async (req, res) => {
  try {
    const result = await fetchHangoutRequests(req.params.userId);
    res.status(201).send({ result });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const postHangoutRequests = async (req, res) => {
  try {
    const hangoutId = req.params.hangoutId;
    const result = await createHangoutRequests(hangoutId, req.body);
    res.status(201).send({ result });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const putHangoutRequest = async (req, res) => {
  try {
    const hangoutId = req.params.hangoutId;
    const result = await handleHangoutRequest(hangoutId, req.body);
    res.status(201).send({ result });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const getFreshHangouts = async (req, res) => {
  try {
    const userId = req.params.userId;
    const result = await fetchFreshHangouts(userId);
    res.status(201).send({ result });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const postJoinHangoutRequest = async (req, res) => {
  try {
    const { userId, recipientId, hangoutName, hangoutId } = req.body;
    const result = await createJoinHangoutRequest(
      userId,
      recipientId,
      hangoutName,
      hangoutId
    );
    res.status(201).send({ result });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export {
  postHangout,
  postPhotoToHangout,
  getRecentHangouts,
  getHangout,
  getHangoutRequests,
  getUpcomingHangouts,
  postHangoutRequests,
  putHangoutRequest,
  getFreshHangouts,
  postJoinHangoutRequest,
};
