import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useRouter } from "expo-router";
import { useEffect, useState, useRef, useCallback } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";

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
  onHandleRequest?: (userId: string) => void;
}

const FriendshipButton: React.FC<FriendshipButtonProps> = ({
  userId,
  status,
  onHandleRequest,
}) => {
  const { user: currentUser } = useUser();
  const [pendingUpdates, setPendingUpdates] = useState<FriendUpdateAction[]>(
    []
  );
  const [friendStatus, setFriendStatus] = useState(status);
  const router = useRouter();
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const applyUpdates = useCallback(async () => {
    if (pendingUpdates.length === 0) return;

    const finalUpdates = pendingUpdates.reduce((acc: any, update: any) => {
      if (acc[update.friendId]) {
        if (
          acc[update.friendId].action === "add" &&
          update.action === "removeRequest"
        ) {
          delete acc[update.friendId];
        } else if (
          acc[update.friendId].action === "removeRequest" &&
          update.action === "add"
        ) {
          delete acc[update.friendId];
        }
      } else {
        acc[update.friendId] = update;
      }
      return acc;
    }, {});

    await Promise.all(
      Object.values(finalUpdates).map(async (update: any) => {
        if (update.action === "add") {
          const response = await axios.post(
            `${process.env.EXPO_PUBLIC_API_URL}/friendRequest`,
            {
              senderId: currentUser?.id,
              receiverId: update.friendId,
            }
          );
          if (response.status === 201) {
            console.log("Added");
            await axios.post(
              `${process.env.EXPO_PUBLIC_API_URL}/notification/send`,
              {
                userId: update.friendId,
                title: "New Friend Request",
                body: `${
                  currentUser?.fullName || "Someone"
                } has sent you a friend request!`,
              }
            );
          }
        } else if (update.action === "removeFriend") {
          console.log("Remove Friend");
          await axios.put(
            `${process.env.EXPO_PUBLIC_API_URL}/friends/remove/users/${currentUser?.id}`,
            {
              receiverId: update.friendId,
            }
          );
        } else if (update.action === "removeRequest") {
          await axios.post(
            `${process.env.EXPO_PUBLIC_API_URL}/friendRequest/handle`,
            {
              senderId: currentUser?.id,
              receiverId: userId,
              status: "reject",
            }
          );
        }
      })
    );

    setPendingUpdates([]); // Clear pending updates after applying them
  }, [pendingUpdates, currentUser?.id, userId]);

  useEffect(() => {
    if (pendingUpdates.length > 0) {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
      debounceTimeout.current = setTimeout(() => {
        applyUpdates();
      }, 5000);
    }

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
      applyUpdates();
    };
  }, [pendingUpdates, applyUpdates]);

  const addFriend = async (friendId: string) => {
    setPendingUpdates((currentUpdates) => [
      ...currentUpdates,
      { action: "add", friendId },
    ]);
    setFriendStatus("Friend Requested");
  };

  const removeFriend = (friendId: string) => {
    Alert.alert(
      "Remove Friend",
      "Are you sure you want to remove this friend?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "OK",
          style: "destructive",
          onPress: () => {
            setPendingUpdates((currentUpdates) => [
              ...currentUpdates,
              { action: "removeFriend", friendId },
            ]);
            setFriendStatus("Not Friends");
          },
        },
      ],
      { cancelable: true }
    );
  };

  const removeRequest = (friendId: string) => {
    setPendingUpdates((currentUpdates) => [
      ...currentUpdates,
      { action: "removeRequest", friendId },
    ]);
    setFriendStatus("Not Friends");
  };

  const handleRequest = async (status: string) => {
    try {
      if (status === "reject") {
        setFriendStatus("Not Friends");
      } else {
        setFriendStatus("Already Friends");
      }
      const res = await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/friendRequest/handle`,
        {
          senderId: userId,
          receiverId: currentUser?.id,
          status,
        }
      );
    } catch (err) {
      console.error("Error handling friend request: ", err);
    }
  };

  return (
    <View>
      <View style={styles.centerRow}>
        {friendStatus === "Already Friends" ? (
          <View></View>
        ) : friendStatus === "Friend Requested" ? (
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
