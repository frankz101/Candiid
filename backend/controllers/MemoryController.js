import {
  createMemory,
  fetchMemories,
  updateMemory,
} from "../services/MemoryService.js";

const postMemory = async (req, res) => {
  try {
    const result = await createMemory(req.body);
    res.status(201).send({ result });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const getMemories = async (req, res) => {
  try {
    const userId = req.params.userId;

    const result = await fetchMemories(userId);
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: err.message });
  }
};

const putMemory = async (req, res) => {
  try {
    const memoryId = req.params.memoryId;

    const memoryData = {
      ...req.body,
    };

    console.log(memoryData);

    const result = await updateMemory(memoryId, memoryData);
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: err.message });
  }
};

export { postMemory, getMemories, putMemory };
