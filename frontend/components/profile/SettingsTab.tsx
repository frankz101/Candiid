import { Ionicons } from "@expo/vector-icons";
import React, { ReactNode } from "react";
import { StyleSheet, View, Text, Pressable } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import DebouncedPressable from "../utils/DebouncedPressable";

type IoniconNames = keyof typeof Ionicons.glyphMap;

interface SettingsTabProps {
  title: string;
  icon: IoniconNames;
  onTabPress: () => void;
}

const SettingsTab: React.FC<SettingsTabProps> = ({
  title,
  icon,
  onTabPress,
}) => {
  return (
    <DebouncedPressable onPress={onTabPress}>
      <View style={styles.container}>
        <View style={styles.leftContainer}>
          <Ionicons
            name={`${icon}`}
            size={30}
            color="#FFF"
            style={{ marginRight: wp(3) }}
          />
          <Text style={styles.tabText}>{title}</Text>
        </View>
        <View>
          <Ionicons name={"chevron-forward"} size={24} color="gray" />
        </View>
      </View>
    </DebouncedPressable>
  );
};

export default SettingsTab;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    alignSelf: "center",
    width: wp(95),
    marginVertical: hp(1),
  },
  leftContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  tabText: {
    color: "white",
    fontFamily: "Inter",
    fontSize: 18,
  },
});
