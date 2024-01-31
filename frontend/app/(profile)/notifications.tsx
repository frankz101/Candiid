import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import BackButton from "@/components/utils/backButton";

const Notifications = () => {
  const router = useRouter();

  return (
    <SafeAreaView>
      <BackButton />
      <Text>Notifications</Text>
    </SafeAreaView>
  );
};

export default Notifications;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
