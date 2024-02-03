import { SafeAreaView, Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useHandleAuth } from "@/hooks/useHandleAuth";

const Profile = () => {
  const router = useRouter();

  useHandleAuth();

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
            onPress={() => router.push("/(profile)/NotificationsScreen")}
            style={{ paddingRight: 10 }}
          >
            <Ionicons name="people" size={32} />
          </Pressable>
          <Pressable onPress={() => router.push("/(profile)/SettingsScreen")}>
            <Ionicons name="menu" size={32} />
          </Pressable>
        </View>
      </View>

      <View>
        <Pressable
          onPress={() => router.push("/(hangout)/CreateHangoutScreen")}
        >
          <Ionicons name="add-circle-outline" size={64} />
        </Pressable>
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
