import { Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import InviteFriends from "@/components/createHangout/InviteFriends";
import BaseScreen from "@/components/utils/BaseScreen";
import { Feather } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const InviteFriendsScreen = () => {
  return (
    <BaseScreen>
      {/* Header */}
      <View style={styles.header}>
        <Text
          style={{
            fontSize: 40,
            color: "#FFF",
            fontFamily: "Inter",
            fontStyle: "italic",
            fontWeight: "700",
          }}
        >
          candiid
        </Text>
        <Pressable style={{ alignSelf: "flex-start" }}>
          <Feather name="bell" size={32} color="#84848B" />
        </Pressable>
      </View>
      <InviteFriends />
    </BaseScreen>
  );
};

export default InviteFriendsScreen;

const styles = StyleSheet.create({
  header: {
    height: hp("5%"),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: wp(4),
    marginVertical: hp(1),
  },
});
