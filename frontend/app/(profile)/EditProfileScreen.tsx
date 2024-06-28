import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Button,
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

  const nameRef = useRef(name);
  const usernameRef = useRef(username);

  const [error, setError] = useState("");

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
        console.log("Profile updated successfully");
        await queryClient.invalidateQueries({
          queryKey: ["profile", user?.id],
        });
      } catch (error: any) {
        setError("Username is taken");
      }
    }
  };

  const openChangePhotoSheet = async () => {
    SheetManager.show("change-photo");
  };

  return (
    <BaseScreen>
      <View style={styles.headerContainer}>
        <BackButton />
        <Text style={styles.header}>Edit Profile</Text>
        <Pressable onPress={applyUpdates}>
          <Text
            style={{
              color: "white",
              fontWeight: "bold",
              marginRight: wp(2),
            }}
          >
            Save
          </Text>
        </Pressable>
      </View>

      <View style={{ alignItems: "center", marginBottom: hp(2) }}>
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
        <Pressable onPress={openChangePhotoSheet}>
          <Text style={{ color: "blue", marginVertical: hp(1), fontSize: 16 }}>
            Edit Profile Picture
          </Text>
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
        {error && <Text>{error}</Text>}
      </View>
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
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  label: {
    width: 80,
    color: "white",
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    paddingHorizontal: 10,
    color: "white",
    backgroundColor: "black",
  },
});
