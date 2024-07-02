import { SafeAreaView, Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import { useClerk, useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import BackButton from "@/components/utils/BackButton";
import BaseScreen from "@/components/utils/BaseScreen";
import SettingsTab from "@/components/profile/SettingsTab";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import axios from "axios";

const SettingsScreen = () => {
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useClerk();
  const toEditProfile = () => {
    router.push("/EditProfileScreen");
  };
  const deleteAccount = async () => {
    try {
      if (user) {
        await user.delete();
        await axios.delete(
          `${process.env.EXPO_PUBLIC_API_URL}/user/delete/${user.id}`
        );
        console.log("User deleted successfully");
      } else {
        console.log("No user to delete");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const contactUs = () => {
    router.push("/ContactUsScreen");
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
        title={"Contact Us"}
        icon={"mail-outline"}
        onTabPress={contactUs}
      />
      <SettingsTab
        title={"Log Out"}
        icon={"log-out-outline"}
        onTabPress={() => signOut()}
      />
      <SettingsTab
        title={"Delete Account"}
        icon={"trash-outline"}
        onTabPress={deleteAccount}
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
    marginBottom: hp(2),
  },
  headerText: {
    color: "white",
    fontFamily: "Inter",
    fontSize: 26,
  },
});
