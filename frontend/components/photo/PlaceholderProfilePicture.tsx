import React from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

interface PlaceholderProfilePictureProps {
  name: string;
}

const PlaceholderProfilePicture: React.FC<PlaceholderProfilePictureProps> = ({
  name,
}) => {
  const firstLetter = name.charAt(0).toUpperCase();
  return (
    <View style={styles.circle}>
      <Text style={styles.circleText}>{firstLetter}</Text>
    </View>
  );
};

export default PlaceholderProfilePicture;

const styles = StyleSheet.create({
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#555",
    justifyContent: "center",
    alignItems: "center",
  },
  circleText: {
    color: "white",
    fontFamily: "inter",
    fontSize: 20,
    fontWeight: "bold",
  },
});
