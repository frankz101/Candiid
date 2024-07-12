import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  Pressable,
} from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import BaseScreen from "@/components/utils/BaseScreen";
import BackButton from "@/components/utils/BackButton";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Ionicons } from "@expo/vector-icons";
import { SheetManager } from "react-native-actions-sheet";
import Toast from "react-native-toast-message";
import { useRouter } from "expo-router";

//GET RID OF RESULT WHEN FETCHING PROFILE
interface User {
  result: {
    userId: string;
    name: string;
    username: string;
    profilePhoto?: {
      fileUrl: string;
    };
    friends?: string[];
    phoneNumber: string;
    createdHangouts?: string[];
    upcomingHangouts?: string[];
  };
}

//profile pic updates automatically even without pressing save
const EditProfileScreen = () => {
  const queryClient = useQueryClient();
  const { user } = useUser();
  const cachedData = queryClient.getQueryData<User>(["profile", user?.id]);
  const profile = cachedData?.result;

  const [name, setName] = useState(profile?.name);
  const [username, setUsername] = useState(profile?.username);

  const [originalName] = useState(profile?.name);
  const [originalUsername] = useState(profile?.username);

  const nameRef = useRef(name);
  const usernameRef = useRef(username);

  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    nameRef.current = name;
    usernameRef.current = username;
  }, [name, username]);

  const applyUpdates = async () => {
    const userDetails: Record<string, string> = {};

    if (nameRef.current) {
      userDetails.name = nameRef.current;
    }
    if (usernameRef.current) {
      userDetails.username = usernameRef.current;
    }

    if (Object.keys(userDetails).length > 0) {
      try {
        await user?.update({
          username: usernameRef.current,
          firstName: nameRef.current,
        });

        await axios.put(
          `${process.env.EXPO_PUBLIC_API_URL}/user/${user?.id}/details`,
          userDetails
        );
        router.back();
        Toast.show({
          type: "success",
          text1: "Profile updated successfully!",
          position: "bottom",
          visibilityTime: 1500,
        });
        await queryClient.invalidateQueries({
          queryKey: ["profile", user?.id],
        });
      } catch (error: any) {
        setError(error.errors[0].message);
      }
    }
  };

  const openChangePhotoSheet = async () => {
    SheetManager.show("change-photo");
  };

  const isChanged = name !== originalName || username !== originalUsername;

  return (
    <BaseScreen>
      <View style={styles.headerContainer}>
        <BackButton />
        <Text style={styles.header}>Edit Profile</Text>
        <Pressable onPress={applyUpdates} disabled={!isChanged}>
          <Text
            style={{
              color: isChanged ? "white" : "gray",
              fontWeight: "bold",
              marginRight: wp(2),
            }}
          >
            Save
          </Text>
        </Pressable>
      </View>

      <View style={{ alignItems: "center", marginBottom: hp(2) }}>
        <Pressable onPress={openChangePhotoSheet}>
          {profile?.profilePhoto ? (
            <Image
              source={{ uri: profile?.profilePhoto?.fileUrl }}
              width={50}
              height={50}
              style={styles.profilePhoto}
            />
          ) : (
            <Ionicons name="person-circle-outline" size={50} />
          )}
        </Pressable>
      </View>

      <View style={styles.editContainer}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          onChangeText={(input) => setName(input)} //consider onsubmitediting
          multiline={false}
          maxLength={30}
          value={name}
        />
      </View>

      <View style={styles.editContainer}>
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          onChangeText={(input) => setUsername(input)}
          multiline={false}
          maxLength={30}
          value={username}
        />
      </View>
      {error && (
        <Text style={{ color: "red", marginLeft: wp(25), marginTop: hp(-1.5) }}>
          {error}
        </Text>
      )}
    </BaseScreen>
  );
};

export default EditProfileScreen;

const styles = StyleSheet.create({
  headerContainer: {
    position: "relative",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp(3),
    paddingHorizontal: wp(2),
  },
  header: {
    position: "absolute",
    left: wp(20),
    right: wp(20),
    textAlign: "center",
    color: "white",
    fontWeight: "bold",
    fontSize: 20,
  },
  profilePhoto: {
    width: wp(30),
    height: wp(30),
    borderRadius: wp(15),
  },
  editContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(2),
    paddingHorizontal: wp(3),
  },
  label: {
    width: wp(20),
    color: "white",
  },
  input: {
    flex: 1,
    height: hp(5),
    borderColor: "gray",
    borderWidth: 1,
    paddingHorizontal: wp(2),
    color: "white",
    backgroundColor: "black",
    borderRadius: 5,
  },
});
