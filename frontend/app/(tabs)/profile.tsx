import { SafeAreaView, Pressable, StyleSheet, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { useRouter } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import { SheetManager } from "react-native-actions-sheet";
import { useUser } from "@clerk/clerk-expo";
import { Image } from "expo-image";

const Profile = () => {
  const router = useRouter();
  const { user } = useUser();

  // const fetchHangouts = async () => {
  //   console.log("Fetching Hangouts");
  //   return axios
  //     .get(
  //       `${process.env.EXPO_PUBLIC_API_URL}/hangouts/users/user_2at1mqV4kVndS3s0ahs9Q0SsrQr`
  //     )
  //     .then((res) => res.data);
  // };

  // const { data: hangouts, isPending } = useQuery({
  //   queryKey: ["hangouts"],
  //   queryFn: fetchHangouts,
  // });

  // if (isPending) {
  //   return <Text>Is Loading...</Text>;
  // }

  const fetchProfilePhoto = async () => {
    console.log("Fetching Profile Photo");
    return axios
      .get(`${process.env.EXPO_PUBLIC_API_URL}/user/${user?.id}/profile-photo`)
      .then((res) => res.data);
  };

  const { data: profileDetails, isPending } = useQuery({
    queryKey: ["profileDetails", user?.id],
    queryFn: fetchProfilePhoto,
  });

  const openChangePhotoSheet = () => {
    SheetManager.show("change-photo");
  };

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
