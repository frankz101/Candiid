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
import { useRouter } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import { SheetManager } from "react-native-actions-sheet";
import { useUser } from "@clerk/clerk-expo";
import { Image } from "expo-image";
import MemoriesView from "@/components/profile/MemoriesView";
import Animated from "react-native-reanimated";

const Profile = () => {
  const router = useRouter();
  const { user } = useUser();

  const fetchMemories = async () => {
    console.log("Fetching Memories");
    return axios
      .get(`${process.env.EXPO_PUBLIC_API_URL}/memories/${user?.id}`)
      .then((res) => res.data);
  };

  // const { data: memoriesData, isPending } = useQuery({
  //   queryKey: ["memories", user?.id],
  //   queryFn: fetchMemories,
  // });

  const fetchProfilePhoto = async () => {
    console.log("Fetching Profile Photo");
    return axios
      .get(`${process.env.EXPO_PUBLIC_API_URL}/user/${user?.id}/profile-photo`)
      .then((res) => res.data);
  };

  // const { data: profileDetails, isPending } = useQuery({
  //   queryKey: ["profileDetails", user?.id],
  //   queryFn: fetchProfilePhoto,
  // });

  const [memories, profile] = useQueries({
    queries: [
      { queryKey: ["memories", user?.id], queryFn: fetchMemories },
      { queryKey: ["profile", user?.id], queryFn: fetchProfilePhoto },
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
            {profileDetails ? (
              <Image
                source={{ uri: profileDetails.result.imageUrl }}
                style={styles.profilePhoto}
              />
            ) : (
              <Ionicons name="person-circle" size={64} />
            )}
          </Pressable>

          <Text>franklin_zhu</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Pressable
            onPress={() => router.push("/(profile)/AddFriendsScreen")}
            style={{ paddingRight: 10 }}
          >
            <Ionicons name="heart" size={32} />
          </Pressable>
          <Pressable
            onPress={() => router.push("/(profile)/NotificationsScreen")}
            style={{ paddingRight: 10 }}
          >
            <Ionicons name="people" size={32} />
          </Pressable>
          <Pressable onPress={() => router.push("/(profile)/SettingsScreen")}>
            <Ionicons name="menu" size={32} />
          </Pressable>
        </View>
      </View>

      {/* <View>
        {hangouts?.map((hangout: any) => (
          <Pressable
            key={hangout.id}
            onPress={() => router.push(`/(hangout)/${hangout.id}`)}
          >
            <Text>{hangout.hangoutName}</Text>
          </Pressable>
        ))}
      </View> */}
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
        </Animated.View>
      )}

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
    </SafeAreaView>
  );
};

export default Profile;

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
