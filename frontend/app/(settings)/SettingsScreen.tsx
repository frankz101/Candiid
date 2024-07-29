import {
  SafeAreaView,
  Pressable,
  StyleSheet,
  Text,
  View,
  Alert,
  Linking,
} from "react-native";
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
import { useQueryClient } from "@tanstack/react-query";

const SettingsScreen = () => {
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useClerk();
  const queryClient = useQueryClient();
  const toEditProfile = () => {
    router.push("/(settings)/EditProfileScreen");
  };
  const deleteAccount = () => {
    try {
      Alert.alert(
        "Delete Account",
        "Are you sure you want to delete your account? This action is irreversible.",
        [
          {
            text: "No",
            style: "cancel",
          },
          {
            text: "Yes",
            style: "destructive",
            onPress: async () => {
              if (user) {
                await user.delete();
                await axios.delete(
                  `${process.env.EXPO_PUBLIC_API_URL}/user/delete/${user.id}`
                );
                console.log("User deleted successfully");
                // Linking.openURL("yourapp://"); to do
              } else {
                console.log("No user to delete");
              }
            },
          },
        ],
        { cancelable: true }
      );
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const contactUs = () => {
    router.push("/ContactUsScreen");
  };

  const toBlockedUsers = () => {
    router.push("/BlockedUsersScreen");
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
        title={"Blocked Users"}
        icon={"ban-outline"}
        onTabPress={toBlockedUsers}
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
