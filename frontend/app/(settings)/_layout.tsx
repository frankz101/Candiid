import React from "react";
import { Stack } from "expo-router";

const Layout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="EditProfileScreen" />
      <Stack.Screen name="BlockedUsersScreen" />
      <Stack.Screen name="ContactUsScreen" />
      <Stack.Screen name="ReportScreen" />
      <Stack.Screen name="SettingsScreen" />
    </Stack>
  );
};

export default Layout;
