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
  createHangout: "add-circle-outline",
  profile: "person-outline",
} as const;

const Layout = () => {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#121212",
          borderTopWidth: 0.5,
          borderTopColor: "#3a3a3d",
          paddingHorizontal: wp(7),
        },
        tabBarItemStyle: {
          alignItems: "center",
          paddingTop: hp(1.2),
        },
        tabBarIcon: ({ color }) => {
          const iconName = iconNames[route.name as keyof typeof iconNames];
          let iconSize;

          switch (route.name) {
            case "index":
              iconSize = 24; // Size for the index tab
              break;
            case "createHangout":
              iconSize = 30; // Size for the createHangout tab
              break;
            case "profile":
              iconSize = 24; // Size for the profile tab
              break;
            default:
              iconSize = 24; // Default size
              break;
          }

          return <Ionicons name={iconName} size={iconSize} color={color} />;
        },
        tabBarActiveTintColor: "white",
        tabBarShowLabel: false,
      })}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="createHangout" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
};

export default Layout;
