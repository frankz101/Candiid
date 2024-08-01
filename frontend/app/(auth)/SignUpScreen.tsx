import { Image, StyleSheet, Text } from "react-native";
import React from "react";
import { useWarmUpBrowser } from "@/hooks/useWarmUpBrowser";
import { useLocalSearchParams, useRouter } from "expo-router";
import BaseScreen from "@/components/utils/BaseScreen";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import DebouncedPressable from "@/components/utils/DebouncedPressable";
import { useAuth } from "@clerk/clerk-expo";

const SignUpScreen = () => {
  useWarmUpBrowser();
  const { isSignedIn } = useAuth();

  const router = useRouter();

  return (
    <BaseScreen style={styles.container}>
      <Image
        source={require("../../assets/images/icon.png")}
        style={styles.logo}
      ></Image>
      <DebouncedPressable
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: pressed
              ? "rgba(85, 85, 85, 0.7)"
              : "rgba(85, 85, 85, 0.5)",
          },
        ]}
        onPress={() => {
          router.push("/PhoneNumberScreen");
        }}
      >
        <Text style={styles.text}>Get started</Text>
      </DebouncedPressable>
      <DebouncedPressable
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: pressed
              ? "rgba(85, 85, 85, 0.7)"
              : "rgba(85, 85, 85, 0.5)",
          },
        ]}
        onPress={() => {
          router.push("/LoginScreen");
        }}
      >
        <Text style={styles.text}>I already have an account</Text>
      </DebouncedPressable>
    </BaseScreen>
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: hp(4),
  },
  logo: {
    height: hp(18),
    width: hp(18),
    backgroundColor: "#141417",
    marginBottom: hp(20),
  },
  button: {
    borderColor: "white",
    borderWidth: 1,
    borderRadius: 5,
    height: hp(6),
    width: wp(60),
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "white",
    fontFamily: "Inter",
    fontWeight: "bold",
  },
});
