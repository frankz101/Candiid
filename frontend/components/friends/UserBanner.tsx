import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

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

interface UserBannerProps {
  user: User;
  type: string;
  onHandleRequest?: (userId: string) => void;
}

const UserBanner: React.FC<UserBannerProps> = ({
  user,
  type,
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
        await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/friendRequest`, {
          senderId: currentUser?.id,
          receiverId: update.friendId,
        });
        console.log("Added");
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

  const handleRequest = async (status: string) => {
    const res = await axios.post(
      `${process.env.EXPO_PUBLIC_API_URL}/friendRequest/handle`,
      {
        senderId: user.userId,
        receiverId: currentUser?.id,
        status,
      }
    );

    if (res.status === 201 && onHandleRequest) {
      onHandleRequest(user.userId);
    }
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
    <Pressable
      onPress={async () => {
        router.push({
          pathname: "/(profile)/ProfileScreen",
          params: { userId: user.userId },
        });
        await applyUpdates();
      }}
    >
      <View
        style={[
          { padding: 10, flexDirection: "row", alignItems: "flex-start" },
        ]}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
          }}
        >
          {user.profilePhoto && user.profilePhoto.fileUrl ? (
            <Image
              source={{ uri: user.profilePhoto.fileUrl }}
              style={styles.profilePhoto}
            />
          ) : (
            <Ionicons name="person-circle" size={40} />
          )}
        </View>
        <View style={{ marginLeft: 10, flex: 1 }}>
          <Text style={{ fontSize: 16 }}>{user.name}</Text>
          <Text style={{ color: "#777" }}>{"@" + user.username}</Text>
        </View>
        {type === "searchResults" && (
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
                  },
                  styles.centerRow,
                ]}
                onPress={() => addFriend(user.userId)}
              >
                <Text style={{ color: "#000" }}>Add Friend</Text>
              </Pressable>
            )}
          </View>
        )}

        {type === "friendRequests" && (
          <View style={{ flexDirection: "row" }}>
            <Pressable
              style={({ pressed }) => [
                {
                  backgroundColor: pressed ? "#ddd" : "#ccc",
                  padding: 10,
                  borderRadius: 5,
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
                  padding: 10,
                  borderRadius: 5,
                },
                styles.centerRow,
              ]}
              onPress={() => handleRequest("accept")}
            >
              <Text style={{ color: "#000" }}>Accept</Text>
            </Pressable>
          </View>
        )}
      </View>
    </Pressable>
  );
};

export default UserBanner;

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
