import {
  createGroup,
  createGroupRequests,
  fetchGroupRequests,
  handleGroupRequest,
} from "../services/GroupService.js";

const postGroup = async (req, res) => {
  try {
    const result = await createGroup(req.body);
    res.status(201).send({ result });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const getGroupRequests = async (req, res) => {
  try {
    const result = await fetchGroupRequests(req.params.userId);
    res.status(201).send({ result });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const postGroupRequests = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const result = await createGroupRequests(groupId, req.body);
    res.status(201).send({ result });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const putGroupRequest = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const result = await handleGroupRequest(groupId, req.body);
    res.status(201).send({ result });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export { postGroup, getGroupRequests, postGroupRequests, putGroupRequest };
