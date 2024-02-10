import {
  addPhotoToHangout,
  createHangout,
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
      ...req.body, // Spread any additional data you have in req.body
      photoFile: req.file.buffer, // Include the photo buffer under the expected property name
      originalFileName: req.file.originalname,
    };

    const result = await addPhotoToHangout(hangoutId, photoData);
    res.status(201).send({ result });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: err.message });
  }
};

export { postHangout, postPhotoToHangout };
