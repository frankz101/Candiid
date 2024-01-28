import { Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import { useClerk } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";

const Settings = () => {
  const { signOut } = useClerk();
  const router = useRouter();

  return (
    <View>
      <Text>Settings</Text>
      <Pressable
        onPress={() => {
          signOut();
        }}
      >
        <Text>Logout</Text>
      </Pressable>
    </View>
  );
};

export default Settings;

const styles = StyleSheet.create({});
