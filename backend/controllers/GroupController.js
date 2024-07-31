import {
  createGroup,
  createGroupRequests,
  fetchGroupRequests,
  fetchGroups,
  handleGroupRequest,
} from "../services/GroupService.js";

const postGroup = async (req, res) => {
  try {
    const result = await createGroup(req.body);
    res.status(201).send(result);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
const getGroup = async (req, res) => {
  try {
    const userId = req.params.groupId;

    const result = await fetchGroups(groupId);
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: err.message });
  }
};

const getGroups = async (req, res) => {
  try {
    const userId = req.params.userId;

    const result = await fetchGroups(userId);
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: err.message });
  }
};

const getGroupRequests = async (req, res) => {
  try {
    const result = await fetchGroupRequests(req.params.userId);
    res.status(201).send(result);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const postGroupRequests = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const result = await createGroupRequests(groupId, req.body);
    res.status(201).send(result);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const putGroupRequest = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const result = await handleGroupRequest(groupId, req.body);
    res.status(201).send(result);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export {
  postGroup,
  getGroup,
  getGroups,
  getGroupRequests,
  postGroupRequests,
  putGroupRequest,
};
