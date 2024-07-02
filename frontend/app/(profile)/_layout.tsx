import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";

const Layout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SettingsScreen" />
      <Stack.Screen name="NotificationsScreen" />
      <Stack.Screen name="ProfileScreen" />
      <Stack.Screen name="EditProfileScreen" />
      <Stack.Screen name="FriendsScreen" />
      <Stack.Screen name="ContactUsScreen" />
      <Stack.Screen name="ReportScreen" />
    </Stack>
  );
};

export default Layout;
