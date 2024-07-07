import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useState, useRef, useCallback } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

interface User {
  name: string;
  username: string;
  profilePhoto: {
    fileUrl: string;
  };
  userId: string;
  friendStatus?: string;
}

type FriendUpdateAction = {
  action: string;
  friendId: string;
};

interface UserBannerProps {
  user: User;
  type: string;
  disabled?: boolean;
  searchPhrase?: string;
  onHandleRequest?: (userId: string) => void;
}

const UserBanner: React.FC<UserBannerProps> = ({
  user,
  type,
  disabled = false,
  searchPhrase = "",
  onHandleRequest,
}) => {
  const { user: currentUser } = useUser();
  const [pendingUpdates, setPendingUpdates] = useState<FriendUpdateAction[]>(
    []
  );
  const [friendStatus, setFriendStatus] = useState(user.friendStatus);
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
              receiverId: user.userId,
              status: "reject",
            }
          );
        }
      })
    );

    setPendingUpdates([]); // Clear pending updates after applying them
  }, [pendingUpdates, currentUser?.id, user.userId]);

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

  const handleRequest = async (status: string) => {
    if (status === "reject") {
      setFriendStatus("Not Friends");
    } else {
      setFriendStatus("Already Friends");
    }
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

  const removeFriendList = (friendId: string) => {
    if (onHandleRequest) {
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
            onPress: () => onHandleRequest(friendId),
          },
        ],
        { cancelable: true }
      );
    }
  };

  return (
    <Pressable
      onPress={() => {
        router.push({
          pathname: "/(profile)/ProfileScreen",
          params: {
            userId: user.userId,
            name: user.name,
            username: user.username,
            profilePhoto: encodeURIComponent(user.profilePhoto?.fileUrl),
            friendStatus: friendStatus ? friendStatus : "",
          },
        });
      }}
      disabled={user.userId === currentUser?.id || disabled}
    >
      <View
        style={[
          {
            padding: wp(3),
            flexDirection: "row",
            alignItems: "flex-start",
          },
        ]}
      >
        {user.profilePhoto && user.profilePhoto.fileUrl ? (
          <Image
            source={{ uri: user.profilePhoto.fileUrl }}
            style={styles.profilePhoto}
          />
        ) : (
          <Ionicons name="person-circle" color="white" size={40} />
        )}
        <View
          style={{
            marginLeft: wp(3),
            flex: 1,
          }}
        >
          <Text style={{ fontSize: 16, color: "white" }}>{user.name}</Text>
          <Text style={{ color: "#777" }}>{"@" + user.username}</Text>
        </View>
        {type === "searchResults" && (
          <View
            style={{ justifyContent: "space-between", alignItems: "center" }}
          >
            {friendStatus === "Already Friends" ? (
              <Pressable
                style={styles.centerRow}
                onPress={() => removeFriend(user.userId)}
              >
                <Ionicons name="close-outline" color="gray" size={20} />
              </Pressable>
            ) : friendStatus === "Friend Requested" ? (
              <Pressable
                style={({ pressed }) => [
                  {
                    backgroundColor: pressed
                      ? "rgba(85, 85, 85, 0.7)"
                      : "rgba(85, 85, 85, 0.5)",
                  },
                  styles.centerRow,
                ]}
                onPress={() => removeRequest(user.userId)}
              >
                <Text style={{ color: "lightgray" }}>Added</Text>
              </Pressable>
            ) : friendStatus === "Incoming Request" ? (
              <View style={{ flexDirection: "row" }}>
                <Pressable
                  style={({ pressed }) => [
                    {
                      backgroundColor: pressed
                        ? "rgba(85, 85, 85, 0.7)"
                        : "rgba(85, 85, 85, 0.5)",
                    },
                    styles.centerRow,
                  ]}
                  onPress={() => handleRequest("accept")}
                >
                  <Text style={{ color: "lightgray" }}>Accept</Text>
                </Pressable>
                <Pressable
                  style={styles.centerRow}
                  onPress={() => handleRequest("reject")}
                >
                  <Ionicons name="close-outline" color="gray" size={20} />
                </Pressable>
              </View>
            ) : (
              <Pressable
                style={({ pressed }) => [
                  {
                    backgroundColor: pressed
                      ? "rgba(85, 85, 85, 0.7)"
                      : "rgba(85, 85, 85, 0.5)",
                  },
                  styles.centerRow,
                ]}
                onPress={() => addFriend(user.userId)}
              >
                <Text style={{ color: "lightgray" }}>Add</Text>
              </Pressable>
            )}
          </View>
        )}

        {type === "friendRequests" && (
          <View style={{ flexDirection: "row" }}>
            <Pressable
              style={({ pressed }) => [
                {
                  backgroundColor: pressed
                    ? "rgba(85, 85, 85, 0.7)"
                    : "rgba(85, 85, 85, 0.5)",
                },
                styles.centerRow,
              ]}
              onPress={() => handleRequest("accept")}
            >
              <Text style={{ color: "lightgray" }}>Accept</Text>
            </Pressable>
            <Pressable
              style={styles.centerRow}
              onPress={() => handleRequest("reject")}
            >
              <Ionicons name="close-outline" color="gray" size={20} />
            </Pressable>
          </View>
        )}
        {type === "friends" && (
          <Pressable
            style={styles.centerRow}
            onPress={() => removeFriendList(user.userId)}
          >
            <Ionicons name="close-outline" color="gray" size={20} />
          </Pressable>
        )}
      </View>
    </Pressable>
  );
};

export default UserBanner;

const styles = StyleSheet.create({
  centerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: wp(3.5),
    paddingVertical: hp(0.7),
  },
  profilePhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});
