import { SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useUser } from "@clerk/clerk-expo";

const EditProfileScreen = () => {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");

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
    <SafeAreaView>
      <View style={{ flexDirection: "row", justifyContent: "center" }}>
        <Text>Edit Profile Screen</Text>
      </View>

      <View style={styles.editContainer}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          placeholder="Name"
          onChangeText={(input) => setName(input)} //CONSIDER CHANGING THIS TO ONSUBMITEDITING
          multiline={false}
          maxLength={30}
          value={name}
          style={styles.input}
        />
      </View>

      <View style={styles.editContainer}>
        <Text style={styles.label}>Username</Text>
        <TextInput
          placeholder="Username"
          onChangeText={(input) => setUsername(input)} //CONSIDER CHANGING THIS TO ONSUBMITEDITING
          multiline={false}
          maxLength={30}
          value={username}
          style={styles.input}
        />
      </View>

      <View style={styles.editContainer}>
        <Text style={styles.label}>Bio</Text>
        <TextInput
          placeholder="Bio"
          onChangeText={(input) => setBio(input)} //CONSIDER CHANGING THIS TO ONSUBMITEDITING
          multiline={false}
          maxLength={30}
          value={bio}
          style={styles.input}
        />
      </View>
    </SafeAreaView>
  );
};

export default EditProfileScreen;

const styles = StyleSheet.create({
  editContainer: {
    flexDirection: "row",
    margin: 4,
  },
  label: {
    width: 100,
  },
  input: {
    // borderWidth: 1,
    // borderColor: "#ccc",
    // borderRadius: 5,
  },
});
