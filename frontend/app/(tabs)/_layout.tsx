import { View, Text } from "react-native";
import React from "react";
import { Tabs } from "expo-router";

const Layout = () => {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ tabBarLabel: "Home" }} />
    </Tabs>
  );
};

export default Layout;
