import { StyleSheet, Text, View } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import React from "react";

interface HangoutSelectProps {
  name: string;
  hangoutId: string;
}

const HangoutSelect: React.FC<HangoutSelectProps> = ({ name, hangoutId }) => {
  return (
    <View style={styles.hangoutSelectContainer}>
      <Text style={styles.hangoutSelectText}>{name}</Text>
    </View>
  );
};

export default HangoutSelect;

const styles = StyleSheet.create({
  hangoutSelectContainer: {
    width: wp("95%"),
    aspectRatio: 4,
    backgroundColor: "#202023",
    borderRadius: 5,
    justifyContent: "center",
  },
  hangoutSelectText: {
    fontSize: 16,
    fontFamily: "inter",
    fontWeight: "700",
    color: "#FFF",
    paddingLeft: wp(4),
  },
});
