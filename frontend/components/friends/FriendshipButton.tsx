import { useUser } from "@clerk/clerk-expo";
import axios from "axios";
import { useEffect, useState, useRef, useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { useFriendFunctions } from "../../hooks/useFriendFunctions";

interface User {
  id: number;
  name: string;
  username: string;
  profilePhoto: {
    fileUrl: string;
  };
  userId: string;
  friendStatus: string;
}

type FriendUpdateAction = {
  action: string;
  friendId: string;
};

interface FriendshipButtonProps {
  userId: string;
  status: string;
  setParentFriendStatus?: (status: string) => void;
}

const FriendshipButton: React.FC<FriendshipButtonProps> = ({
  userId,
  status,
  setParentFriendStatus,
}) => {
  const [friendStatus, setFriendStatus] = useState(status);

  const { sendFriendRequest, handleFriendRequest, removeFriendRequest } =
    useFriendFunctions();

  const addFriend = async (friendId: string) => {
    setFriendStatus("Friend Requested");
    setParentFriendStatus && setParentFriendStatus("Friend Requested");
    sendFriendRequest(friendId);
  };

  const removeRequest = (friendId: string) => {
    setFriendStatus("Not Friends");
    setParentFriendStatus && setParentFriendStatus("Not Friends");
    removeFriendRequest(friendId);
  };

  const handleRequest = async (status: string) => {
    try {
      if (status === "reject") {
        setFriendStatus("Not Friends");
        setParentFriendStatus && setParentFriendStatus("Not Friends");
      } else {
        setFriendStatus("Already Friends");
        setParentFriendStatus && setParentFriendStatus("Already Friends");
      }
      await handleFriendRequest(userId, status);
    } catch (err) {
      console.error("Error handling friend request: ", err);
    }
  };

  return (
    <View>
      <View style={styles.centerRow}>
        {friendStatus === "Friend Requested" ? (
          <Pressable
            style={({ pressed }) => [
              {
                backgroundColor: pressed ? "#ddd" : "#ccc",
                padding: 10,
                borderRadius: 5,
                width: wp("95%"),
                aspectRatio: 8,
              },
              styles.centerRow,
            ]}
            onPress={() => removeRequest(userId)}
          >
            <Text style={{ color: "#000" }}>Remove Request</Text>
          </Pressable>
        ) : friendStatus === "Incoming Request" ? (
          <View style={{ flexDirection: "row" }}>
            <Pressable
              style={({ pressed }) => [
                {
                  backgroundColor: pressed ? "#ddd" : "#ccc",
                  borderRadius: 5,
                  width: wp("40%"),
                  aspectRatio: 8,
                },
                styles.centerRow,
              ]}
              onPress={() => handleRequest("reject")}
            >
              <Text style={{ color: "#000" }}>Reject</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                {
                  backgroundColor: pressed ? "#ddd" : "#ccc",
                  borderRadius: 5,
                  width: wp("40%"),
                  aspectRatio: 8,
                },
                styles.centerRow,
              ]}
              onPress={() => handleRequest("accept")}
            >
              <Text style={{ color: "#000" }}>Accept</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            style={({ pressed }) => [
              {
                backgroundColor: pressed ? "#ddd" : "#ccc",
                padding: 10,
                borderRadius: 5,
                width: wp("95%"),
                aspectRatio: 8,
              },
              styles.centerRow,
            ]}
            onPress={() => addFriend(userId)}
          >
            <Text style={{ color: "#000" }}>Add Friend</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
};

export default FriendshipButton;

const styles = StyleSheet.create({
  centerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  profilePhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});
