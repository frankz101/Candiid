import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";

const Layout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SignUpScreen" />
      <Stack.Screen name="PhoneNumberScreen" />
      <Stack.Screen name="FirstNameScreen" />
      <Stack.Screen name="LoginScreen" />
    </Stack>
  );
};

export default Layout;
