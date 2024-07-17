import { deleteStickerFromDatabase } from "../db/StickerDatabase.js";
import {
  createStickers,
  fetchStickers,
  updateStickers,
} from "../services/StickerService.js";

const postStickers = async (req, res) => {
  try {
    console.log(req.body);
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

const deleteSticker = async (req, res) => {
  const { stickerId } = req.params;
  try {
    const wasDeleted = await deleteStickerFromDatabase(stickerId);
    if (wasDeleted) {
      res.status(204).send();
    } else {
      res.status(404).send({ message: "Sticker not found" });
    }
  } catch (err) {
    console.error("Error while deleting sticker: ", err);
    res.status(500).send({ message: "Internal server error" });
  }
};

export { postStickers, getStickers, putStickers, deleteSticker };
