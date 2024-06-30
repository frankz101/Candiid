import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

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
  user: User;
  onHandleRequest?: (userId: string) => void;
}

const FriendshipButton: React.FC<FriendshipButtonProps> = ({
  user,
  onHandleRequest,
}) => {
  const { user: currentUser } = useUser();
  const [pendingUpdates, setPendingUpdates] = useState<FriendUpdateAction[]>(
    []
  );
  const [friendStatus, setFriendStatus] = useState(user.friendStatus);
  const router = useRouter();

  useEffect(() => {
    return () => {
      applyUpdates();
    };
  }, [pendingUpdates]);

  const applyUpdates = async () => {
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

    Object.values(finalUpdates).forEach(async (update: any) => {
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
            senderId: user.userId,
            receiverId: currentUser?.id,
            status: "reject",
          }
        );
      }
    });
  };

  const addFriend = (friendId: string) => {
    setPendingUpdates((currentUpdates) => [
      ...currentUpdates,
      { action: "add", friendId },
    ]);
    setFriendStatus("Friend Requested");
  };

  const removeFriend = (friendId: string) => {
    setPendingUpdates((currentUpdates) => [
      ...currentUpdates,
      { action: "removeFriend", friendId },
    ]);
    setFriendStatus("Not Friends");
  };

  const removeRequest = (friendId: string) => {
    setPendingUpdates((currentUpdates) => [
      ...currentUpdates,
      { action: "removeRequest", friendId },
    ]);
    setFriendStatus("Not Friends");
  };

  return (
    <View>
      <View style={styles.centerRow}>
        {friendStatus === "Already Friends" ? (
          <Pressable
            style={({ pressed }) => [
              {
                backgroundColor: pressed ? "#ddd" : "#ccc",
                padding: 10,
                borderRadius: 5,
              },
              styles.centerRow,
            ]}
            onPress={() => removeFriend(user.userId)}
          >
            <Text style={{ color: "#000" }}>Remove Friend</Text>
          </Pressable>
        ) : friendStatus === "Friend Requested" ? (
          <Pressable
            style={({ pressed }) => [
              {
                backgroundColor: pressed ? "#ddd" : "#ccc",
                padding: 10,
                borderRadius: 5,
              },
              styles.centerRow,
            ]}
            onPress={() => removeRequest(user.userId)}
          >
            <Text style={{ color: "#000" }}>Remove Request</Text>
          </Pressable>
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
            onPress={() => addFriend(user.userId)}
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
