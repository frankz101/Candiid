import BackButton from "@/components/utils/BackButton";
import BaseScreen from "@/components/utils/BaseScreen";
import { useSignUp, useUser } from "@clerk/clerk-expo";
import axios from "axios";
import { useLocalSearchParams } from "expo-router";
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { OtpInput } from "react-native-otp-entry";

const CodeVerificationScreen = () => {
  const { phoneNumber } = useLocalSearchParams();
  const { signUp, setActive } = useSignUp();
  const { isLoaded, user } = useUser();
  const [userSignedIn, setUserSignedIn] = useState(false);

  useEffect(() => {
    if (userSignedIn && isLoaded && user) {
      const userData = {
        userId: user.id,
        phoneNumber: user.primaryPhoneNumber?.phoneNumber,
        name: user.firstName,
        username: user.username,
      };

      axios
        .post("http://localhost:3001/users", userData)
        .then((response) => {
          console.log(response.data.message);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, [userSignedIn, isLoaded, user]);

  const verifyCode = async (code: string) => {
    try {
      const completeSignUp = await signUp?.attemptPhoneNumberVerification({
        code,
      });
      if (completeSignUp?.status === "complete" && setActive !== undefined) {
        setUserSignedIn(true);
        await setActive({ session: completeSignUp.createdSessionId });
      } else {
        console.log("error signing up");
      }
    } catch (err: any) {
      console.error(err.message);
    }
  };

  return (
    <BaseScreen>
      <BackButton />
      <View style={styles.container}>
        <Text style={styles.title}>
          Enter the 6-digit code sent to the number: {"\n"}
          ******{phoneNumber.slice(-4)}
        </Text>
        <OtpInput
          numberOfDigits={6}
          focusColor="green"
          focusStickBlinkingDuration={500}
          onFilled={(text) => verifyCode(text)}
          theme={{
            pinCodeTextStyle: styles.pinCodeText,
          }}
        />
      </View>
    </BaseScreen>
  );
};

export default CodeVerificationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontFamily: "Inter",
    color: "white",
    marginBottom: 20,
    textAlign: "center",
  },
  pinCodeText: {
    color: "white",
  },
});
