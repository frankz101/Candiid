import { SafeAreaView, Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import { useClerk } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import BackButton from "@/components/utils/BackButton";
import BaseScreen from "@/components/utils/BaseScreen";
import SettingsTab from "@/components/profile/SettingsTab";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const SettingsScreen = () => {
  const router = useRouter();
  const { signOut } = useClerk();
  const toEditProfile = () => {
    router.push("/EditProfileScreen");
  };
  return (
    <BaseScreen>
      <View style={styles.header}>
        <View style={{ width: wp(14) }}>
          <BackButton />
        </View>
        <Text style={styles.headerText}>Settings</Text>
        <View style={{ width: wp(14) }} />
      </View>
      <SettingsTab
        title={"Edit Profile"}
        icon={"pencil-outline"}
        onTabPress={toEditProfile}
      />
      <SettingsTab
        title={"Log Out"}
        icon={"log-out-outline"}
        onTabPress={() => signOut()}
      />
    </BaseScreen>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    alignSelf: "center",
    width: wp(95),
    marginBottom: hp(5),
  },
  headerText: {
    color: "white",
    fontFamily: "Inter",
    fontSize: 26,
  },
});
