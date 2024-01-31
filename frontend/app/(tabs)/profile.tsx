import { SafeAreaView, Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const Profile = () => {
  const router = useRouter();

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
          <Ionicons name="person-circle" size={64} />
          <Text>franklin_zhu</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Pressable
            onPress={() => router.push("/(profile)/notifications")}
            style={{ paddingRight: 10 }}
          >
            <Ionicons name="people" size={32} />
          </Pressable>
          <Pressable onPress={() => router.push("/(profile)/settings")}>
            <Ionicons name="menu" size={32} />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
