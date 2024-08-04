import React from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { TabBarProps } from "react-native-tab-view";
import { TouchableOpacity } from "react-native-gesture-handler";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const FriendsTabBar: React.FC<TabBarProps<any>> = ({
  navigationState,
  position,
  jumpTo,
}) => {
  const inputRange = navigationState.routes.map((_, i) => i);
  const tabBarWidth = wp("41%"); // Full width minus some padding
  const tabWidth = tabBarWidth / navigationState.routes.length; // Evenly distribute width

  const translateX = position.interpolate({
    inputRange,
    outputRange: inputRange.map((i) => i * tabWidth),
  });

  return (
    <View style={styles.tabBar}>
      <View style={styles.toggleContainer}>
        <Animated.View
          style={[styles.bubble, { transform: [{ translateX }] }]}
        />
        {navigationState.routes.map((route, index) => {
          const isSelected = navigationState.index === index;
          return (
            <TouchableOpacity
              key={route.key}
              style={styles.toggleButton}
              onPress={() => jumpTo(route.key)}
            >
              <Text
                style={[
                  styles.toggleButtonText,
                  isSelected && styles.activeText,
                ]}
              >
                {route.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    zIndex: 1,
    position: "absolute",
    bottom: hp(3),
    width: wp("100%"),
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: hp(1),
  },
  toggleContainer: {
    width: wp("45%"),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#252525",
    borderRadius: 20,
    overflow: "hidden",
  },
  toggleButton: {
    // backgroundColor: "red",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
  },
  toggleButtonText: {
    color: "#555555",
    fontWeight: "bold",
    fontSize: 14,
  },
  bubble: {
    position: "absolute",
    // alignSelf: "center",
    height: hp(3),
    width: wp(20),
    // marginHorizontal: wp(2),
    backgroundColor: "#444444",
    borderRadius: 20,
    left: wp(2),
  },
  activeText: {
    color: "#fff",
  },
});

export default FriendsTabBar;
