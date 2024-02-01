import { createHangout } from "../services/HangoutService.js";

const postHangout = async (req, res) => {
  try {
    const hangoutId = await createHangout(req.body);
    res.status(201).send({ hangoutId });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export { postHangout };
