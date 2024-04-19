import React from "react";
import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const BackButton = () => {
  const router = useRouter();

  return (
    <Pressable onPress={() => router.back()}>
      <Ionicons name="chevron-back" size={32} />
    </Pressable>
  );
};

export default BackButton;
