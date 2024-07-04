import { StyleSheet, Text, View } from "react-native";
import React from "react";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

interface HangoutDetailCardProps {
  name: string;
  description: string;
}

const HangoutDetailCard: React.FC<HangoutDetailCardProps> = ({
  name,
  description,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.nameText}>{name}</Text>
      <Text style={styles.descriptionText}>{description}</Text>
    </View>
  );
};

export default HangoutDetailCard;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(44, 44, 48, 0.50)",
    width: wp("95%"),
    aspectRatio: 1.75,
    marginTop: hp(2),
    borderRadius: 15,
  },
  nameText: {
    padding: 10,
    fontFamily: "inter",
    fontSize: 24,
    fontWeight: "500",
    color: "#FFF",
  },
  descriptionText: {
    paddingLeft: 10,
    fontFamily: "inter",
    fontSize: 16,
    fontWeight: "500",
    color: "#FFF",
  },
});
