import {
  SafeAreaView,
  Pressable,
  StyleSheet,
  Text,
  View,
  ScrollView,
  RefreshControl,
  Dimensions,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import { SheetManager } from "react-native-actions-sheet";
import { useUser } from "@clerk/clerk-expo";
import { Image } from "expo-image";
import MemoriesView from "@/components/profile/MemoriesView";
import Animated from "react-native-reanimated";
import { BlurView } from "expo-blur";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import BaseScreen from "@/components/utils/BaseScreen";
import FriendshipButton from "@/components/friends/FriendshipButton";
import BackButton from "@/components/utils/BackButton";
import { useFriendFunctions } from "../utils/FriendFunctions";

interface ProfileViewProps {
  userId: string;
  username: string;
  name: string;
  profilePhoto: string;
  friendStatus: string;
  backgroundColor: string;
  setParentModalVisible: (status: boolean) => void;
  setFriendStatus: (status: string) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({
  userId,
  username,
  name,
  profilePhoto,
  friendStatus,
  backgroundColor,
  setParentModalVisible,
  setFriendStatus,
}) => {
  const router = useRouter();

  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const queryClient = useQueryClient();

  const { removeFriend, blockUser } = useFriendFunctions();

  const fetchMemories = async () => {
    console.log("Fetching Memories in profile screen");
    return axios
      .get(`${process.env.EXPO_PUBLIC_API_URL}/memories/${userId}`)
      .then((res) => res.data);
  };

  const fetchStickers = async () => {
    console.log("Fetching Stickers in Profile Tab");
    return axios
      .get(`${process.env.EXPO_PUBLIC_API_URL}/stickers/${userId}`)
      .then((res) => res.data);
  };

  const [memories, fetchedStickers] = useQueries({
    queries: [
      {
        queryKey: ["memories", userId],
        queryFn: fetchMemories,
        staleTime: 1000 * 60 * 5,
      },
      {
        queryKey: ["stickers", userId],
        queryFn: fetchStickers,
        staleTime: 1000 * 60 * 5,
      },
    ],
  });

  const { data: memoriesData, isPending: isPendingMemories } = memories;
  const { data: stickersData, isPending: isPendingStickers } = fetchedStickers;

  const onRefresh = async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ["memories", userId] });
    setRefreshing(false);
  };

  if (isPendingMemories || isPendingStickers) {
    return (
      <BaseScreen>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingBottom: 28,
          }}
        >
          <BackButton />
          <Text style={styles.headerText}>Loading...</Text>
          <View style={{ width: 32 }} />
        </View>
        <ActivityIndicator size="large" color="#FFF" />
      </BaseScreen>
    );
  }

  const deleteFriend = async (friendId: string) => {
    setParentModalVisible(false);
    setFriendStatus("Not Friends");
    await removeFriend(friendId);
  };

  return (
    <BaseScreen style={styles.container}>
      <View style={styles.navOptions}>
        <Pressable onPress={() => setParentModalVisible(false)}>
          <Ionicons name="chevron-down" size={32} color="white" />
        </Pressable>
        <Text style={styles.userDetailText}>{`@${username}`}</Text>
        <View>
          <Pressable onPress={() => setModalVisible(true)}>
            <Ionicons
              name="ellipsis-horizontal-outline"
              size={30}
              color="white"
            />
          </Pressable>
          <Modal transparent={true} animationType="fade" visible={modalVisible}>
            <Pressable
              style={styles.overlay}
              onPress={() => setModalVisible(false)}
            >
              <View style={styles.modalContainer}>
                <Pressable
                  style={({ pressed }) => [
                    styles.modalButton,
                    pressed
                      ? { backgroundColor: "#3a3a3d" }
                      : { backgroundColor: "#2a2a2d" },
                  ]}
                  onPress={() => {
                    setModalVisible(false);
                    router.push({
                      pathname: "/ReportScreen",
                      params: {
                        userId,
                        username: username,
                      },
                    });
                  }}
                >
                  <Text style={styles.modalButtonText}>Report {username}</Text>
                  <Ionicons name="alert-circle-outline" color="red" size={24} />
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    styles.modalButton,
                    pressed
                      ? { backgroundColor: "#3a3a3d" }
                      : { backgroundColor: "#2a2a2d" },
                  ]}
                  onPress={async () => {
                    setModalVisible(false);

                    blockUser(userId, setParentModalVisible, () =>
                      setFriendStatus("Blocked")
                    );
                  }}
                >
                  <Text style={styles.modalButtonText}>Block {username}</Text>
                  <Ionicons name="ban-outline" color="red" size={24} />
                </Pressable>

                {friendStatus === "Already Friends" && (
                  <Pressable
                    style={({ pressed }) => [
                      styles.modalButton,
                      pressed
                        ? { backgroundColor: "#3a3a3d" }
                        : { backgroundColor: "#2a2a2d" },
                    ]}
                    onPress={() => deleteFriend(userId)}
                  >
                    <Text style={styles.modalButtonText}>
                      Remove friendship
                    </Text>
                    <Ionicons
                      name="person-remove-outline"
                      color="red"
                      size={24}
                    />
                  </Pressable>
                )}
              </View>
            </Pressable>
          </Modal>
        </View>
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollViewContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.userDetails}>
          {profilePhoto ? (
            <Image source={{ uri: profilePhoto }} style={styles.profilePhoto} />
          ) : (
            <View style={[styles.profilePhoto, { backgroundColor: "grey" }]} />
          )}
          <Text style={styles.userText}>{name}</Text>
          {friendStatus !== "Already Friends" && (
            <FriendshipButton
              userId={userId as string}
              status={friendStatus}
              setParentFriendStatus={(status: string) =>
                setFriendStatus(status)
              }
            />
          )}
        </View>
        <Animated.View style={styles.animatedView}>
          <MemoriesView
            userId={userId as string}
            hangouts={memoriesData}
            stickers={stickersData}
            color={backgroundColor}
          />
        </Animated.View>
      </ScrollView>
    </BaseScreen>
  );
};

export default ProfileView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#141417",
  },
  navOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingRight: wp(2),
    paddingBottom: hp(1),
  },
  userDetails: {
    alignItems: "center",
  },
  userText: {
    color: "#FFF",
    fontFamily: "Inter",
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: hp(1),
  },
  userDetailText: {
    position: "absolute",
    left: wp(20),
    right: wp(20),
    textAlign: "center",
    color: "#FFF",
    fontFamily: "Inter",
    fontSize: 14,
    alignSelf: "center",
  },
  profilePhoto: {
    width: wp(25),
    height: wp(25),
    borderRadius: wp(25),
  },
  scrollViewContainer: {
    flexGrow: 1,
    marginHorizontal: wp(2),
  },
  headerText: {
    color: "#FFF",
    fontFamily: "Inter",
    fontSize: 14,
    fontWeight: "bold",
  },
  animatedView: {
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    height: hp("60%"),
    borderRadius: 15,
  },
  upcomingHangouts: {
    paddingTop: hp(2),
  },
  hangoutBanner: {
    marginTop: hp(1),
    height: hp(8),
    flexDirection: "row",
    gap: wp(40),
    backgroundColor: "#202023",
    borderRadius: 5,
    justifyContent: "space-between",
    alignItems: "center",
  },
  hangoutText: {
    paddingLeft: wp(4),
    color: "#FFF",
    fontFamily: "Inter",
    fontSize: 18,
    fontWeight: "bold",
  },
  participants: {
    flexDirection: "row",
    marginRight: wp(4),
    gap: -wp(5),
  },
  participantPhoto: {
    height: 36,
    width: 36,
    borderRadius: 18,
    borderColor: "white",
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  additionalParticipants: {
    height: 36,
    width: 36,
    borderRadius: 18,
    backgroundColor: "#D9D9D9",
    borderColor: "white",
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: wp(70),
    maxWidth: wp(90),
    backgroundColor: "#d9d9d9",
    borderRadius: 10,
    overflow: "hidden",
  },
  modalButton: {
    paddingHorizontal: wp(3),
    paddingVertical: hp(1),
    borderBottomColor: "#4a4a4d",
    borderBottomWidth: 0.5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalButtonText: {
    color: "red",
    fontSize: 16,
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: hp(11),
    paddingRight: wp(3),
  },
  modalContent: {
    padding: 20,
    alignItems: "center",
  },
  modalText: {
    marginBottom: 15,
    fontSize: 18,
  },
});
