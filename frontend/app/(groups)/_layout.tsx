import React from "react";
import { Stack } from "expo-router";

const Layout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CreateGroupScreen" />
      <Stack.Screen name="InviteGroupScreen" />
    </Stack>
  );
};

export default Layout;
