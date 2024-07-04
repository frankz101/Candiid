import { View, Text } from "react-native";
import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const iconNames = {
  index: "home-outline",
  camera: "camera-outline",
  profile: "person-outline",
} as const;

const Layout = () => {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#121212",
          borderTopWidth: 0,
          paddingHorizontal: wp(7),
        },
        tabBarItemStyle: {
          alignItems: "center",
          paddingTop: hp(1.2),
        },
        tabBarIcon: ({ focused, color, size }) => {
          const iconName = iconNames[route.name as keyof typeof iconNames];

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "white",
        tabBarShowLabel: false,
      })}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="camera" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
};

export default Layout;
