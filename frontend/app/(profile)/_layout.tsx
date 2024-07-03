import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";

const Layout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="NotificationsScreen" />
      <Stack.Screen name="ProfileScreen" />

      <Stack.Screen name="FriendsScreen" />
    </Stack>
  );
};

export default Layout;
