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

interface Hangout {
  hangoutName: string;
  description: string;
  id: string;
  participantIds: string[];
  participants: Participant[];
}

interface Participant {
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

  const [memories, profile, hangouts] = useQueries({
    queries: [
      { queryKey: ["memories", user?.id], queryFn: fetchMemories },
      { queryKey: ["profile", user?.id], queryFn: fetchUser },
      {
        queryKey: ["hangouts", user?.id],
        queryFn: fetchUpcomingHangouts,
      },
    ],
  });

  const { data: memoriesData, isPending: isPendingMemories } = memories;
  const { data: profileDetails, isPending: isPendingProfile } = profile;
  const { data: upcomingHangouts, isPending: isPendingHangouts } = hangouts;

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
        <Ionicons
          onPress={() => router.push("/(profile)/SettingsScreen")}
          name="reorder-three-outline"
          size={32}
          color={"white"}
        />
      </View>
      <View style={styles.userDetails}>
        <Text style={styles.userText}>{`@${userProfile.username}`}</Text>

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
      <ScrollView
        contentContainerStyle={styles.scrollViewContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.headerText}>Memoryboard</Text>
        <Animated.View style={styles.animatedView}>
          <Pressable onPress={() => router.push("/(hangout)/MemoriesScreen")}>
            <MemoriesView hangouts={memoriesData} />
          </Pressable>
        </Animated.View>
        {/* DEFAULT PROFILE PIC NOT CENTERED AND SIZE IS WRONG */}
        <View style={styles.upcomingHangouts}>
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
        </View>
      </ScrollView>
    </BaseScreen>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    height: hp(100),
    backgroundColor: "#141417",
  },
  navOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: wp(4),
  },
  userDetails: {
    display: "flex",
    gap: hp(1),
    alignItems: "center",
    marginVertical: hp(2),
  },
  userText: {
    color: "#FFF",
    fontFamily: "Inter",
    fontSize: 18,
    fontWeight: "bold",
  },
  profilePhoto: {
    width: 108,
    height: 108,
    borderRadius: 64,
  },
  scrollViewContainer: {
    flexGrow: 1,
    marginTop: hp(4),
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
