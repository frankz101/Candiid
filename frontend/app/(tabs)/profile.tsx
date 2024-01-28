import { Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import { useRouter } from "expo-router";

const Profile = () => {
  const router = useRouter();

  return (
    <View>
      <Text>Profile</Text>
      <Pressable onPress={() => router.push("/(profile)/settings")}>
        <Text>Settings</Text>
      </Pressable>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({});
