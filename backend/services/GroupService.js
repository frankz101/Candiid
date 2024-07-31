import {
  createGroupInDatabase,
  createGroupRequestsInDatabase,
  fetchGroupInDatabase,
  fetchGroupRequestsInDatabase,
  fetchGroupsInDatabase,
  handleGroupRequestInDatabase,
} from "../db/GroupDatabase.js";

const createGroup = async (groupData) => {
  const result = await createGroupInDatabase(groupData);
  return result;
};

const fetchGroup = async (groupId) => {
  const result = await fetchGroupInDatabase(groupId);
  return result;
};

const fetchGroups = async (userId) => {
  const result = await fetchGroupsInDatabase(userId);
  return result;
};

const fetchGroupRequests = async (userId) => {
  const result = await fetchGroupRequestsInDatabase(userId);
  return result;
};

const createGroupRequests = async (groupId, groupRequestData) => {
  const { selectedFriends, groupName, userId } = groupRequestData;
  const result = await createGroupRequestsInDatabase(
    groupId,
    selectedFriends,
    groupName,
    userId
  );
  return result;
};

const handleGroupRequest = async (groupId, handleRequestData) => {
  const result = await handleGroupRequestInDatabase(groupId, handleRequestData);
  return result;
};

export {
  createGroup,
  fetchGroup,
  fetchGroups,
  fetchGroupRequests,
  createGroupRequests,
  handleGroupRequest,
};
