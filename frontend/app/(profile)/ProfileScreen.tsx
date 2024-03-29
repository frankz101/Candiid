import {
  SafeAreaView,
  Pressable,
  StyleSheet,
  Text,
  View,
  ScrollView,
} from "react-native";
import { useQueries, useQuery } from "@tanstack/react-query";
import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import { SheetManager } from "react-native-actions-sheet";
import { useUser } from "@clerk/clerk-expo";
import { Image } from "expo-image";
import MemoriesView from "@/components/profile/MemoriesView";
import Animated from "react-native-reanimated";
import { BlurView } from "expo-blur";

const ProfileScreen = () => {
  const { user } = useUser();
  const router = useRouter();
  const { userId } = useLocalSearchParams();

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

  const [memories, profile] = useQueries({
    queries: [
      { queryKey: ["memories", userId], queryFn: fetchMemories },
      { queryKey: ["profile", userId], queryFn: fetchUser },
    ],
  });

  const { data: memoriesData, isPending: isPendingMemories } = memories;
  const { data: profileDetails, isPending: isPendingProfile } = profile;

  const openChangePhotoSheet = () => {
    SheetManager.show("change-photo");
  };

  if (isPendingProfile) {
    return <Text>Is Loading...</Text>;
  }

  return (
    <SafeAreaView>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          padding: 12,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Pressable
            onPress={openChangePhotoSheet}
            style={{ paddingRight: 10 }}
          >
            {profileDetails &&
            profileDetails.result &&
            profileDetails.result.profilePhoto ? (
              <Image
                source={{ uri: profileDetails.result.profilePhoto.fileUrl }}
                style={styles.profilePhoto}
              />
            ) : (
              <Ionicons name="person-circle" size={64} />
            )}
          </Pressable>

          <Text>{profileDetails.result.username}</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Pressable onPress={() => router.push("/(profile)/SettingsScreen")}>
            <Ionicons name="menu" size={32} />
          </Pressable>
        </View>
      </View>
      {isPendingMemories ? (
        <View
          style={{
            height: "50%",
            borderWidth: 1,
            borderColor: "black",
            borderRadius: 10,
          }}
        />
      ) : (
        <Animated.View
          style={{
            justifyContent: "center",
            alignItems: "center",
            height: "50%",
            borderWidth: 1,
            borderColor: "black",
            borderRadius: 10,
            overflow: "hidden",
          }}
          sharedTransitionTag="MemoriesScreen"
        >
          <Pressable onPress={() => router.push("/(hangout)/MemoriesScreen")}>
            <MemoriesView hangouts={memoriesData} />
          </Pressable>
          {profileDetails.result.friendStatus === "Not Friends" && (
            <BlurView
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
              intensity={50}
            />
          )}
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profilePhoto: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
});
