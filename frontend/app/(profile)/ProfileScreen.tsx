import {
  SafeAreaView,
  Pressable,
  StyleSheet,
  Text,
  View,
  ScrollView,
  RefreshControl,
  Dimensions,
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

const screenHeight = Dimensions.get("window").height;
const headerHeight = 120;
const bottomPadding = 20;

const scrollViewHeight = screenHeight - headerHeight - bottomPadding;

//STATE DOES NOT UPDATE WHEN PRESSING BACK BUTTON ONTO SEARCH SCREEN
const ProfileScreen = () => {
  const { user } = useUser();
  const router = useRouter();
  const { userId, username, name, profilePhoto, friendStatus } =
    useLocalSearchParams();
  const userIdStr = Array.isArray(userId) ? userId[0] : userId;
  const profilePhotoStr = Array.isArray(profilePhoto)
    ? profilePhoto[0]
    : profilePhoto;
  const friendStatusStr = Array.isArray(friendStatus)
    ? friendStatus[0]
    : friendStatus;
  const [refreshing, setRefreshing] = useState(false);
  const queryClient = useQueryClient();
  const fetchMemories = async () => {
    console.log("Fetching Memories");
    return axios
      .get(`${process.env.EXPO_PUBLIC_API_URL}/memories/${userId}`)
      .then((res) => res.data);
  };

  const fetchUser = async () => {
    console.log("Fetching User Information");
    return axios
      .get(`${process.env.EXPO_PUBLIC_API_URL}/users/${userId}/${user?.id}`)
      .then((res) => res.data);
  };

  const { data: memories } = useQuery({
    queryKey: ["memories", userId],
    queryFn: fetchMemories,
  });

  const { data: memoriesData, isPending: isPendingMemories } = memories;

  const onRefresh = async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ["memories", userId] });
    setRefreshing(false);
  };

  if (isPendingMemories) {
    return <Text>Is Loading...</Text>;
  }

  return (
    <BaseScreen style={styles.container}>
      <View style={styles.navOptions}>
        <BackButton />
        <Text style={styles.userDetailText}>{`@${username}`}</Text>
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollViewContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.userDetails}>
          {profilePhotoStr !== "undefined" ? (
            <Image
              source={{ uri: profilePhotoStr }}
              style={styles.profilePhoto}
            />
          ) : (
            <Ionicons name="person-circle" size={wp(25)} />
          )}
          <Text style={styles.userText}>{name}</Text>
          <FriendshipButton userId={userIdStr} status={friendStatusStr} />
        </View>
        {/* <Text style={styles.headerText}>Memoryboard</Text> */}
        <Animated.View style={styles.animatedView}>
          <Pressable onPress={() => router.push("/(hangout)/MemoriesScreen")}>
            {/* <MemoriesView hangouts={memoriesData} /> */}
          </Pressable>
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
    height: 300,
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 10,
    overflow: "hidden",
    marginVertical: 10,
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
});
