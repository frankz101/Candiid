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

const screenHeight = Dimensions.get("window").height;
const headerHeight = 120;
const bottomPadding = 20;

const scrollViewHeight = screenHeight - headerHeight - bottomPadding;

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

  const [memories, profile] = useQueries({
    queries: [
      { queryKey: ["memories", user?.id], queryFn: fetchMemories },
      { queryKey: ["profile", user?.id], queryFn: fetchUser },
    ],
  });

  const { data: memoriesData, isPending: isPendingMemories } = memories;
  const { data: profileDetails, isPending: isPendingProfile } = profile;

  const onRefresh = async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ["memories", user?.id] });
    await queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
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
    <SafeAreaView>
      <View // Turn this into one component later
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 18,
          paddingVertical: 10,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Pressable
            onPress={openChangePhotoSheet}
            style={{ paddingRight: 10 }}
          >
            {profileDetails && userProfile && userProfile.profilePhoto ? (
              <Image
                source={{ uri: userProfile.profilePhoto.fileUrl }}
                style={styles.profilePhoto}
              />
            ) : (
              <Ionicons name="person-circle" size={64} />
            )}
          </Pressable>
          <View>
            <Text style={styles.name}>{userProfile.name}</Text>
            <Text style={styles.username}>{`@${userProfile.username}`}</Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Pressable
            onPress={() => router.push("/(profile)/AddFriendsScreen")}
            style={{ paddingRight: 10 }}
          >
            <Ionicons name="people" size={32} />
          </Pressable>
          <Pressable
            onPress={() => router.push("/(profile)/NotificationsScreen")}
            style={{ paddingRight: 10 }}
          >
            <Ionicons name="heart" size={32} />
          </Pressable>
          <Pressable onPress={() => router.push("/(profile)/SettingsScreen")}>
            <Ionicons name="menu" size={32} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollViewContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Animated.View
          style={styles.animatedView}
          sharedTransitionTag="MemoriesScreen"
        >
          <Pressable onPress={() => router.push("/(hangout)/MemoriesScreen")}>
            <MemoriesView hangouts={memoriesData} />
          </Pressable>
        </Animated.View>

        <View>
          <Pressable
            onPress={() => router.push("/(hangout)/CreateHangoutScreen")}
          >
            <Ionicons name="add-circle-outline" size={64} />
          </Pressable>
        </View>
        <View>
          <Pressable onPress={() => router.push("/(hangout)/MemoriesScreen")}>
            <MaterialIcons name="photo" size={64} />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollViewContainer: {
    flexGrow: 1,
    height: scrollViewHeight,
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

  profilePhoto: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
  },
  username: {
    fontSize: 14,
    opacity: 0.8,
  },
});
