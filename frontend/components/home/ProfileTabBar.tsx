import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Dimensions,
} from "react-native";
import { TabBarProps } from "react-native-tab-view";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";

const ProfileTabBar: React.FC<TabBarProps<any>> = ({
  navigationState,
  position,
  jumpTo,
}) => {
  const inputRange = navigationState.routes.map((_, i) => i);
  const tabBarWidth = wp("95%");
  const tabWidth = tabBarWidth / navigationState.routes.length;
  const translateX = position.interpolate({
    inputRange,
    outputRange: inputRange.map((i) => i * tabWidth),
  });

  return (
    <View style={styles.container}>
      <View style={[styles.tabBar, { width: tabBarWidth }]}>
        {navigationState.routes.map((route, index) => {
          const isSelected = navigationState.index === index;
          return (
            <Pressable
              key={route.key}
              onPress={() => jumpTo(route.key)}
              style={{ flex: 1, alignItems: "center" }}
            >
              <Text
                style={
                  isSelected ? styles.tabTextStyleSelected : styles.tabTextStyle
                }
              >
                {route.title}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <View style={[styles.tabUnderlineContainer, { width: tabBarWidth }]}>
        <Animated.View
          style={[
            styles.underline,
            {
              transform: [{ translateX }],
              width: tabWidth,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: wp("100%"),
    alignItems: "center",
  },
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    paddingVertical: 10,
  },
  tabTextStyle: {
    color: "#9B9BA1",
    fontFamily: "Inter",
    fontSize: 14,
  },
  tabTextStyleSelected: {
    color: "#FFF",
    fontFamily: "Inter",
    fontSize: 14,
    fontWeight: "bold",
  },
  tabUnderlineContainer: {
    height: 3,
    flexDirection: "row",
  },
  underline: {
    height: 3,
    backgroundColor: "#FFF",
    marginTop: 2,
  },
});

export default ProfileTabBar;
