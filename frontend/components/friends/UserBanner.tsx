import ProfileScreen from "@/app/(profile)/ProfileScreen";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useState, useRef, useCallback } from "react";
import { Alert, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import ProfileView from "../profile/ProfileView";
import { useFriendFunctions } from "../utils/FriendFunctions";

interface User {
  name: string;
  username: string;
  profilePhoto: {
    fileUrl: string;
  };
  userId: string;
  friendStatus?: string;
  backgroundDetails?: {
    backgroundColor: string;
  };
}

interface UserBannerProps {
  user: User;
  type: string;
  disabled?: boolean;
}

const UserBanner: React.FC<UserBannerProps> = ({
  user,
  type,
  disabled = false,
}) => {
  const { user: currentUser } = useUser();

  const [friendStatus, setFriendStatus] = useState(user.friendStatus);
  const router = useRouter();

  const {
    sendFriendRequest,
    removeFriendRequest,
    handleFriendRequest,
    removeFriend,
  } = useFriendFunctions();

  const handleRequest = async (status: string) => {
    if (status === "reject") {
      setFriendStatus("Not Friends");
    } else {
      setFriendStatus("Already Friends");
    }
    await handleFriendRequest(user.userId, status);
  };

  const addFriend = (friendId: string) => {
    setFriendStatus("Friend Requested");
    sendFriendRequest(friendId);
  };

  const deleteFriend = async (friendId: string) => {
    setFriendStatus("Not Friends");
    await removeFriend(friendId);
  };

  const removeRequest = (friendId: string) => {
    setFriendStatus("Not Friends");
    removeFriendRequest(friendId);
  };

  const [modalVisible, setModalVisible] = useState(false);

  const pressBanner = () => {
    if (type === "searchResults") {
      setModalVisible(true);
    } else {
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
    }
  };

  if (friendStatus === "Blocked") {
    return <View></View>;
  }

  return (
    <View>
      <Modal animationType="slide" visible={modalVisible} transparent={true}>
        <ProfileView
          userId={user.userId}
          name={user.name}
          username={user.username}
          profilePhoto={user.profilePhoto?.fileUrl}
          friendStatus={friendStatus as string}
          backgroundColor={user.backgroundDetails?.backgroundColor as string}
          setParentModalVisible={(status) => setModalVisible(status)}
          setFriendStatus={(status) => setFriendStatus(status)}
        />
      </Modal>
      <Pressable
        onPress={pressBanner}
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
                  onPress={() => deleteFriend(user.userId)}
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
              onPress={async () => await removeFriend(user.userId)}
            >
              <Ionicons name="close-outline" color="gray" size={20} />
            </Pressable>
          )}
        </View>
      </Pressable>
    </View>
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
