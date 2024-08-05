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
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import BaseScreen from "@/components/utils/BaseScreen";
import FriendshipButton from "@/components/friends/FriendshipButton";
import BackButton from "@/components/utils/BackButton";
import { useFriendFunctions } from "@/hooks/useFriendFunctions";
import { BlurView } from "expo-blur";

const ProfileScreen = () => {
  const { user } = useUser();
  const router = useRouter();
  const { userId, incomingFriendStatus } = useLocalSearchParams();

  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const queryClient = useQueryClient();

  const { removeFriend, blockUser } = useFriendFunctions();

  const fetchUser = async () => {
    console.log("Fetching User Information in profile screen");
    return axios
      .get(`${process.env.EXPO_PUBLIC_API_URL}/users/${userId}/${user?.id}`)
      .then((res) => res.data);
  };

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

  const [memories, profile, fetchedStickers] = useQueries({
    queries: [
      {
        queryKey: ["memories", userId],
        queryFn: fetchMemories,
        staleTime: 1000 * 60 * 5,
      },
      {
        queryKey: ["profile", userId],
        queryFn: fetchUser,
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
  const { data: profileDetails, isPending: isPendingProfile } = profile;
  const { data: stickersData, isPending: isPendingStickers } = fetchedStickers;

  const [friendStatus, setFriendStatus] = useState(
    incomingFriendStatus || profileDetails.friendStatus
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ["memories", userId] });
    setRefreshing(false);
  };

  if (isPendingMemories || isPendingProfile || isPendingStickers) {
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
    await removeFriend(friendId);
    router.back();
    queryClient.invalidateQueries({
      queryKey: ["postsData", user?.id],
    });
  };

  return (
    <BaseScreen style={styles.container}>
      <View style={styles.navOptions}>
        <BackButton />
        <Text
          style={styles.userDetailText}
        >{`@${profileDetails.username}`}</Text>
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
                        username: profileDetails.username,
                      },
                    });
                  }}
                >
                  <Text style={styles.modalButtonText}>
                    Report {profileDetails.username}
                  </Text>
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
                    await blockUser(userId as string);
                    router.back();
                    queryClient.invalidateQueries({
                      queryKey: ["postsData", user?.id],
                    });
                  }}
                >
                  <Text style={styles.modalButtonText}>
                    Block {profileDetails.username}
                  </Text>
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
                    onPress={() => deleteFriend(userId as string)}
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
          {profileDetails && profileDetails.profilePhoto ? (
            <Image
              source={{ uri: profileDetails.profilePhoto.fileUrl }}
              style={styles.profilePhoto}
            />
          ) : (
            <View style={[styles.profilePhoto, { backgroundColor: "grey" }]} />
          )}
          <Text style={styles.userText}>{profileDetails.name}</Text>
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
        {/* <Text style={styles.headerText}>Memoryboard</Text> */}
        <Animated.View style={styles.animatedView}>
          <MemoriesView
            userId={userId as string}
            hangouts={memoriesData}
            stickers={stickersData}
            color={profileDetails.backgroundDetails?.backgroundColor}
          />
          {friendStatus !== "Already Friends" && (
            <BlurView
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
              intensity={30}
            />
          )}
        </Animated.View>
        {/* DEFAULT PROFILE PIC NOT CENTERED AND SIZE IS WRONG */}
        {/* <View style={styles.upcomingHangouts}>
          <Text style={styles.headerText}>Upcoming Hangouts</Text>
          {upcomingHangouts?.map((hangout: Hangout) => {
            return (
              <Pressable
                key={hangout.id}
                onPress={() => router.push(`/(hangout)/${hangout.id}`)}
              >
                <View style={styles.hangoutBanner}>
                  <Text style={styles.hangoutText}>{hangout.hangoutName}</Text>
                  <View style={styles.participants}>
                    {hangout.participants.map((participant: Participant) =>
                      participant.profilePhoto ? (
                        <Image
                          key={participant.userId}
                          source={{ uri: participant.profilePhoto.fileUrl }}
                          style={styles.participantPhoto}
                        />
                      ) : (
                        <View
                          key={participant.userId}
                          style={styles.participantPhoto}
                        >
                          <Ionicons
                            name="person-circle"
                            size={40}
                            color="white"
                          />
                        </View>
                      )
                    )}
                    {hangout.participantIds.length > 2 && (
                      <View style={styles.additionalParticipants}>
                        <Text>+{hangout.participantIds.length - 2}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View> */}
      </ScrollView>
    </BaseScreen>
    // <SafeAreaView>
    //   <View
    //     style={{
    //       flexDirection: "row",
    //       justifyContent: "space-between",
    //       alignItems: "center",
    //       paddingHorizontal: 18,
    //       paddingVertical: 10,
    //     }}
    //   >
    //     <View style={{ flexDirection: "row", alignItems: "center" }}>
    //       {profileDetails &&
    //       profileDetails.result &&
    //       profileDetails.result.profilePhoto ? (
    //         <Image
    //           source={{ uri: profileDetails.result.profilePhoto.fileUrl }}
    //           style={styles.profilePhoto}
    //         />
    //       ) : (
    //         <Ionicons name="person-circle" size={64} />
    //       )}

    //       <View>
    //         <Text style={styles.name}>{profileDetails.result.name}</Text>
    //         <Text
    //           style={styles.username}
    //         >{`@${profileDetails.result.username}`}</Text>
    //       </View>
    //     </View>
    //     <View style={{ flexDirection: "row", alignItems: "center" }}>
    //       <Pressable onPress={() => router.push("/(profile)/SettingsScreen")}>
    //         <Ionicons name="menu" size={32} />
    //       </Pressable>
    //     </View>
    //   </View>
    //   <ScrollView
    //     contentContainerStyle={styles.scrollViewContainer}
    //     refreshControl={
    //       <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
    //     }
    //   >
    //     <Animated.View
    //       style={styles.animatedView}
    //       // sharedTransitionTag="MemoriesScreen"
    //     >
    //       <Pressable onPress={() => router.push("/(hangout)/MemoriesScreen")}>
    //         <MemoriesView hangouts={memoriesData} />
    //       </Pressable>
    //       {profileDetails.result.friendStatus === "Not Friends" && (
    //         <BlurView
    //           style={{
    //             position: "absolute",
    //             top: 0,
    //             left: 0,
    //             right: 0,
    //             bottom: 0,
    //           }}
    //           intensity={50}
    //         />
    //       )}
    //     </Animated.View>
    //   </ScrollView>
    // </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#141417",
  },
  navOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: wp(2),
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
