import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Modal,
} from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import BaseScreen from "@/components/utils/BaseScreen";
import BackButton from "@/components/utils/BackButton";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { useRouter } from "expo-router";
import ChangePhotoSheet from "@/components/profile/ChangePhotoSheet";
import { Image } from "expo-image";

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
  // const cachedData = queryClient.getQueryData<User>(["profile", user?.id]);
  // const profile = cachedData?.result;
  const [photoSheetVisible, setPhotoSheetVisible] = useState(false);

  const fetchUser = async () => {
    console.log("Fetching User Information in Settings tab");
    return axios
      .get(`${process.env.EXPO_PUBLIC_API_URL}/users/${user?.id}/${user?.id}`)
      .then((res) => res.data);
  };

  const { data: profile, isPending } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: fetchUser,
  });

  const [name, setName] = useState(profile?.result.name);
  const [username, setUsername] = useState(profile?.result.username);

  const [originalName] = useState(profile?.result.name);
  const [originalUsername] = useState(profile?.result.username);

  const nameRef = useRef(name);
  const usernameRef = useRef(username);

  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    nameRef.current = name;
    usernameRef.current = username;
  }, [name, username]);

  const applyUpdates = async () => {
    console.log("apply updates");
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
        <Pressable onPress={() => setPhotoSheetVisible(true)}>
          {profile?.result.profilePhoto ? (
            <Image
              source={{ uri: profile?.result.profilePhoto?.fileUrl }}
              style={styles.profilePhoto}
            />
          ) : (
            <View style={[styles.profilePhoto, { backgroundColor: "grey" }]} />
          )}
        </Pressable>
        <Modal
          transparent={true}
          visible={photoSheetVisible}
          animationType="slide"
        >
          <Pressable
            style={styles.overlay}
            onPress={() => setPhotoSheetVisible(false)}
          >
            <View style={styles.modalContainer}>
              <ChangePhotoSheet />
            </View>
          </Pressable>
        </Modal>
      </View>

      <View style={styles.editContainer}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          onChangeText={(input) => setName(input)}
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
    width: wp(25),
    height: wp(25),
    borderRadius: wp(25) / 2,
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
  overlay: {
    flex: 1,
    paddingTop: hp(11),
    paddingRight: wp(3),
  },
  modalContainer: {
    position: "absolute",
    bottom: 0,
    width: wp(100),
  },
});
