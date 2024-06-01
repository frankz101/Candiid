import { Pressable, StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Image } from "expo-image";
import PlaceholderProfilePicture from "../photo/PlaceholderProfilePicture";

interface FriendInviteBannerProps {
  username: string;
  profilePhoto?: string;
  onInvite: () => void;
  onUninvite: () => void;
}

const FriendInviteBanner: React.FC<FriendInviteBannerProps> = ({
  username,
  profilePhoto,
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
        {profilePhoto ? (
          <Image source={{ uri: profilePhoto }} style={styles.profilePhoto} />
        ) : (
          <PlaceholderProfilePicture name={username} />
        )}

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
  profilePhoto: { width: 40, height: 40, borderRadius: 20 },
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp(1),
  },
  username: {
    paddingLeft: wp(2),
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
