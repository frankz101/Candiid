import {
  SafeAreaView,
  Pressable,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Dimensions,
  RefreshControl,
} from "react-native";
import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { useRouter } from "expo-router";
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
import MemoriesScreen from "../(hangout)/MemoriesScreen";
import ProfileHangout from "@/components/profile/ProfileHangout";

export interface Hangout {
  hangoutName: string;
  hangoutDescription: string;
  id: string;
  participantIds: string[];
  participants: Participant[];
}

export interface Participant {
  userId: string;
  profilePhoto: null | { fileUrl: string };
}

const Profile = () => {
  const router = useRouter();
  const { user } = useUser();
  const [refreshing, setRefreshing] = useState(false);
  const queryClient = useQueryClient();

  const fetchMemories = async () => {
    console.log("Fetching Memories");
    return axios
      .get(`${process.env.EXPO_PUBLIC_API_URL}/memories/${user?.id}`)
      .then((res) => res.data);
  };

  const fetchUser = async () => {
    console.log("Fetching User Information");
    return axios
      .get(`${process.env.EXPO_PUBLIC_API_URL}/users/${user?.id}/${user?.id}`)
      .then((res) => res.data);
  };

  const fetchUpcomingHangouts = async () => {
    return axios
      .get(`${process.env.EXPO_PUBLIC_API_URL}/hangout/upcoming/${user?.id}`)
      .then((res) => res.data);
  };

  const fetchStickers = async () => {
    console.log("Fetching Stickers");
    return axios
      .get(`${process.env.EXPO_PUBLIC_API_URL}/stickers/${user?.id}`)
      .then((res) => res.data);
  };

  const [memories, profile, hangouts, fetchedStickers] = useQueries({
    queries: [
      { queryKey: ["memories", user?.id], queryFn: fetchMemories },
      { queryKey: ["profile", user?.id], queryFn: fetchUser },
      {
        queryKey: ["hangouts", user?.id],
        queryFn: fetchUpcomingHangouts,
      },
      { queryKey: ["stickers", user?.id], queryFn: fetchStickers },
    ],
  });

  const { data: memoriesData, isPending: isPendingMemories } = memories;
  const { data: profileDetails, isPending: isPendingProfile } = profile;
  const { data: upcomingHangouts, isPending: isPendingHangouts } = hangouts;
  const { data: stickersData, isPending: isPendingStickers } = fetchedStickers;

  const onRefresh = async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ["memories", user?.id] });
    await queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
    await queryClient.invalidateQueries({ queryKey: ["hangouts", user?.id] });
    setRefreshing(false);
  };

  const openChangePhotoSheet = () => {
    SheetManager.show("change-photo");
  };

  if (isPendingMemories || isPendingProfile) {
    return <Text>Is Loading...</Text>;
  }

  const userProfile = profileDetails?.result || {
    name: "Unknown User",
    username: "unknown_user",
    profilePhoto: null,
  };

  return (
    <BaseScreen style={styles.container}>
      <View style={styles.navOptions}>
        <Ionicons
          onPress={() => router.push("/(profile)/FriendsScreen")}
          name="people-outline"
          size={32}
          color={"white"}
        />
        <Text style={styles.userDetailText}>{`@${userProfile.username}`}</Text>
        <Ionicons
          onPress={() => router.push("/(settings)/SettingsScreen")}
          name="reorder-three-outline"
          size={32}
          color={"white"}
        />
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollViewContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.userDetails}>
          <Pressable onPress={openChangePhotoSheet}>
            {profileDetails && userProfile && userProfile.profilePhoto ? (
              <Image
                source={{ uri: userProfile.profilePhoto.fileUrl }}
                style={styles.profilePhoto}
              />
            ) : (
              <Ionicons name="person-circle" size={108} color={"white"} />
            )}
          </Pressable>
          <Text style={styles.userText}>{userProfile.name}</Text>
        </View>
        {/* <Text style={styles.headerText}>Memoryboard</Text> */}
        <Animated.View style={styles.animatedView}>
          <Pressable onPress={() => router.push("/(hangout)/MemoriesScreen")}>
            <MemoriesView hangouts={memoriesData} stickers={stickersData} />
          </Pressable>
        </Animated.View>
        {/* DEFAULT PROFILE PIC NOT CENTERED AND SIZE IS WRONG */}
        <Text style={styles.headerText}>Upcoming Hangouts</Text>
        <View style={styles.upcomingHangouts}>
          {upcomingHangouts?.map((hangout: Hangout) => {
            return (
              <View>
                <ProfileHangout key={hangout.id} hangout={hangout} />
              </View>
            );
          })}
        </View>
      </ScrollView>
    </BaseScreen>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#141417",
  },
  navOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: wp(4),
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
    marginTop: hp(1),
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
    marginTop: hp(1),
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
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
