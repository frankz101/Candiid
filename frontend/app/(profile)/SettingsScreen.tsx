import { SafeAreaView, Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import { useClerk } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import BackButton from "@/components/utils/BackButton";

const SettingsScreen = () => {
  const { signOut } = useClerk();
  const router = useRouter();

  return (
    <SafeAreaView>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <BackButton />
        <Text style={{ fontSize: 24 }}>Settings</Text>
        <View style={{ width: 32 }} />
      </View>
      <Pressable
        onPress={() => {
          router.push("/(profile)/EditProfileScreen");
        }}
        style={styles.listItem}
      >
        <Text>Edit Profile</Text>
      </Pressable>
      <Pressable
        onPress={() => {
          signOut();
        }}
        style={styles.listItem}
      >
        <Text>Logout</Text>
      </Pressable>
    </SafeAreaView>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  listItem: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    margin: 8,
  },
});
