import { SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useUser } from "@clerk/clerk-expo";
import { useQueryClient } from "@tanstack/react-query";
import BaseScreen from "@/components/utils/BaseScreen";
import BackButton from "@/components/utils/BackButton";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const EditProfileScreen = () => {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");

  const queryClient = useQueryClient();

  const { user } = useUser();

  const nameRef = useRef(name);
  const usernameRef = useRef(username);
  const bioRef = useRef(bio);

  useEffect(() => {
    nameRef.current = name;
    usernameRef.current = username;
    bioRef.current = bio;
  }, [name, username, bio]);

  useEffect(() => {
    const applyUpdates = async () => {
      const userDetails: Record<string, string> = {};

      if (nameRef.current !== "") {
        userDetails.name = nameRef.current;
      }
      if (usernameRef.current !== "") {
        userDetails.username = usernameRef.current;
      }
      if (bioRef.current !== "") {
        userDetails.bio = bioRef.current;
      }

      if (Object.keys(userDetails).length > 0) {
        try {
          const response = await axios.put(
            `${process.env.EXPO_PUBLIC_API_URL}/user/${user?.id}/details`,
            userDetails
          );
          console.log("Profile updated successfully");
          await queryClient.invalidateQueries({
            queryKey: ["profile", user?.id],
          });
        } catch (error) {
          console.error("Error updating profile:", error);
        }
      }
    };

    return () => {
      applyUpdates();
    };
  }, []);

  return (
    <BaseScreen>
      <View style={styles.header}>
        <View style={{ width: wp(14) }}>
          <BackButton />
        </View>
        <Text style={styles.headerText}>Edit Profile</Text>
        <View style={{ width: wp(14) }} />
      </View>

      <View style={styles.editContainer}>
        <Text style={styles.label}>Name:</Text>
        <TextInput
          placeholder="Enter your new name here"
          onChangeText={(input) => setName(input)} //CONSIDER CHANGING THIS TO ONSUBMITEDITING
          multiline={false}
          maxLength={30}
          value={name}
          placeholderTextColor="#b0abab"
        />
      </View>

      <View style={styles.editContainer}>
        <Text style={styles.label}>Username:</Text>
        <TextInput
          placeholder="Enter your new username here"
          onChangeText={(input) => setUsername(input)} //CONSIDER CHANGING THIS TO ONSUBMITEDITING
          multiline={false}
          maxLength={30}
          value={username}
          placeholderTextColor="#b0abab"
        />
      </View>

      <View style={styles.editContainer}>
        <Text style={styles.label}>Bio:</Text>
        <TextInput
          placeholder="Enter your new bio here"
          onChangeText={(input) => setBio(input)} //CONSIDER CHANGING THIS TO ONSUBMITEDITING
          multiline={false}
          maxLength={30}
          value={bio}
          placeholderTextColor="#b0abab"
        />
      </View>
    </BaseScreen>
  );
};

export default EditProfileScreen;

const styles = StyleSheet.create({
  header:{
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    alignSelf: "center",
    width: wp(95),
    marginBottom: hp(3),
  },
  headerText: {
    color: "white",
    fontFamily: "Inter",
    fontSize: 26,
  },
  editContainer: {
    flexDirection: "row",
    margin: hp(1),
  },
  label: {
    width: wp(27),
    color: "white",
    fontFamily: "Inter",
    fontSize: 18,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
  },
});
