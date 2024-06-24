import {
  createStickers,
  fetchStickers,
  updateStickers,
} from "../services/StickerService.js";

const postStickers = async (req, res) => {
  try {
    const result = await createStickers(req.body);
    res.status(201).send({ result });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const getStickers = async (req, res) => {
  try {
    const userId = req.params.userId;

    const result = await fetchStickers(userId);
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: err.message });
  }
};

const putStickers = async (req, res) => {
  try {
    const result = await updateStickers(req.body);
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: err.message });
  }
};

export { postStickers, getStickers, putStickers };
