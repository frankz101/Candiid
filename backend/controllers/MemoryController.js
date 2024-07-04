import { deleteMemoryFromDatabase } from "../db/MemoryDatabase.js";
import {
  createMemory,
  fetchMemories,
  updateMemory,
  updateMemories,
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

const putMemories = async (req, res) => {
  try {
    const result = await updateMemories(req.body);
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: err.message });
  }
};

const deleteMemory = async (req, res) => {
  const { memoryId } = req.params;
  try {
    const wasDeleted = await deleteMemoryFromDatabase(memoryId);
    if (wasDeleted) {
      res.status(204).send();
    } else {
      res.status(404).send({ message: "Memory not found" });
    }
  } catch (err) {
    console.error("Error while deleting memory: ", err);
    res.status(500).send({ message: "Internal server error" });
  }
};

export { postMemory, getMemories, putMemory, putMemories, deleteMemory };
