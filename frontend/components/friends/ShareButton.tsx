import { useUser } from "@clerk/clerk-expo";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Share from "react-native-share";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Ionicons } from "@expo/vector-icons";

interface ShareButtonProps {
  type: "hangout" | "user";
  id: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({ type, id }) => {
  const shareLink = async () => {
    let shareOptions;

    if (type === "hangout") {
      shareOptions = {
        title: "Join My Hangout on Candiid!",
        message: "Check out this awesome hangout I'm hosting on Candiid!",
        url: `exp+memories://hangout/${id}`,
        failOnCancel: false,
      };
    } else {
      shareOptions = {
        title: "Invite Friends to Candiid!",
        message: "Add me on Candiid!",
        url: `exp+memories://invite/${id}`,
        failOnCancel: false,
      };
    }

    try {
      await Share.open(shareOptions);
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed
            ? { backgroundColor: "rgba(85, 85, 85, 0.7)" }
            : { backgroundColor: "rgba(85, 85, 85, 0.5)" },
        ]}
        onPress={shareLink}
      >
        <Text style={styles.text}>
          {type === "hangout"
            ? "Invite Friends to this Hangout!"
            : "Invite Friends to Candiid!"}
        </Text>
        <Ionicons name="share-outline" size={25} color="white" />
      </Pressable>
    </View>
  );
};

export default ShareButton;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: hp(2),
  },
  button: {
    borderRadius: 5,
    height: hp(7),
    width: wp(95),
    paddingHorizontal: wp(4),
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  text: {
    color: "white",
    fontWeight: "bold",
  },
});
