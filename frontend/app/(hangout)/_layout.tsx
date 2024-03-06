import { View, Text } from "react-native";
import React, { useState } from "react";
import { Stack } from "expo-router";

const Layout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CreateHangoutScreen" />
      <Stack.Screen name="[hangoutId]" />
      <Stack.Screen name="PreviewPost" />
      <Stack.Screen name="MemoriesScreen" />
      <Stack.Screen name="FullScreenImage" />
    </Stack>
  );
};

export default Layout;
