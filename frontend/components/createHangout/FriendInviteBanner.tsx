import { Pressable, StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

interface FriendInviteBannerProps {
  username: string;
  onInvite: () => void;
  onUninvite: () => void;
}

const FriendInviteBanner: React.FC<FriendInviteBannerProps> = ({
  username,
  onInvite,
  onUninvite,
}) => {
  const [isInvited, setIsInvited] = useState(false);

  const handlePress = () => {
    if (isInvited) {
      setIsInvited(false);
      onUninvite();
    } else {
      setIsInvited(true);
      onInvite();
    }
  };

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: "row" }}>
        <Ionicons name="person-circle-outline" size={40} color="white" />
        <Text style={styles.username}>{username}</Text>
      </View>

      <Pressable style={styles.button} onPress={handlePress}>
        <Text style={styles.buttonText}>
          {isInvited ? "Invited" : "Invite"}
        </Text>
      </Pressable>
    </View>
  );
};

export default FriendInviteBanner;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  username: {
    paddingLeft: wp(1),
    alignSelf: "center",
    fontFamily: "inter",
    fontSize: 14,
    fontWeight: "700",
    color: "#FFF",
  },
  button: {
    backgroundColor: "rgba(85, 85, 85, 0.50)",
    borderWidth: 1,
    borderColor: "#FFF",
    borderRadius: 5,
    width: wp("30%"),
    aspectRatio: 4,
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp(4),
  },
  buttonText: {
    fontFamily: "inter",
    fontSize: 14,
    fontWeight: "700",
    color: "#FFF",
  },
});
