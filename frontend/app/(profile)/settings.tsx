import { SafeAreaView, Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import { useClerk } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import BackButton from "@/components/utils/backButton";

const Settings = () => {
  const { signOut } = useClerk();
  const router = useRouter();

  return (
    <SafeAreaView>
      <BackButton />
      <Text>Settings</Text>
      <Pressable
        onPress={() => {
          signOut();
        }}
      >
        <Text>Logout</Text>
      </Pressable>
    </SafeAreaView>
  );
};

export default Settings;

const styles = StyleSheet.create({});
