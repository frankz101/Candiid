import { useUser } from "@clerk/clerk-expo";
import axios from "axios";
import { useEffect, useState, useRef, useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
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
  useEffect(() => {
    setFriendStatus(status);
  }, [status]);

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
                backgroundColor: pressed ? "#ddd" : "#FFF",
              },
              styles.centerRow,
              styles.largeButtonStyle,
            ]}
            onPress={() => removeRequest(userId)}
          >
            <Text style={styles.buttonText}>Remove Request</Text>
          </Pressable>
        ) : friendStatus === "Incoming Request" ? (
          <View style={{ flexDirection: "row" }}>
            <Pressable
              style={({ pressed }) => [
                {
                  backgroundColor: pressed ? "#ddd" : "#FFF",
                  borderRadius: 5,
                  marginHorizontal: wp(1),
                  width: wp("46%"),
                  marginBottom: wp(2),
                  height: hp(5),
                },
                styles.centerRow,
              ]}
              onPress={() => handleRequest("reject")}
            >
              <Text style={styles.buttonText}>Reject</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                {
                  backgroundColor: pressed ? "#ddd" : "#FFF",
                  borderRadius: 5,
                  marginHorizontal: wp(1),
                  marginBottom: wp(2),
                  width: wp("46%"),
                  height: hp(5),
                },
                styles.centerRow,
              ]}
              onPress={() => handleRequest("accept")}
            >
              <Text style={styles.buttonText}>Accept</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            style={({ pressed }) => [
              {
                backgroundColor: pressed ? "#ddd" : "#FFF",
              },
              styles.centerRow,
              styles.largeButtonStyle,
            ]}
            onPress={() => addFriend(userId)}
          >
            <Text style={styles.buttonText}>Add Friend</Text>
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
  largeButtonStyle: {
    padding: wp(2),
    marginBottom: hp(1),
    borderRadius: 5,
    width: wp("95%"),
    height: hp(6),
  },
  buttonText: {
    color: "#000",
    fontFamily: "Inter",
    fontWeight: "600",
  },
});
