import BackButton from "@/components/utils/BackButton";
import BaseScreen from "@/components/utils/BaseScreen";
import { useSignUp, useUser } from "@clerk/clerk-expo";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useLocalSearchParams } from "expo-router";
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { OtpInput } from "react-native-otp-entry";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const CodeVerificationScreen = () => {
  const { phoneNumber } = useLocalSearchParams();
  const { signUp, setActive } = useSignUp();
  const { isLoaded, user } = useUser();
  const [userSignedIn, setUserSignedIn] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [error, setError] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (userSignedIn && isLoaded && user) {
      const userData = {
        userId: user.id,
        phoneNumber: user.primaryPhoneNumber?.phoneNumber,
        name: user.firstName,
        username: user.username,
      };

      queryClient.setQueryData(["profile", user.id], { userData });

      axios
        .post(`${process.env.EXPO_PUBLIC_API_URL}/users`, userData)
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
      setError(true);
    }
  };

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [resendTimer]);

  const handleResendCode = async () => {
    try {
      await signUp?.preparePhoneNumberVerification({ strategy: "phone_code" });
      setResendTimer(60);
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <BaseScreen>
      <View style={styles.container}>
        <BackButton />
        <View style={styles.otp}>
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
          {error && <Text style={styles.error}>The code is incorrect</Text>}
          {resendTimer > 0 ? (
            <Text style={styles.timer}>
              Resend code in {resendTimer} seconds
            </Text>
          ) : (
            <Pressable onPress={handleResendCode}>
              {({ pressed }) => (
                <Text
                  style={[
                    styles.resendText,
                    pressed ? { color: "#1e7e34" } : { color: "#28a745" },
                  ]}
                >
                  Resend Verification Code
                </Text>
              )}
            </Pressable>
          )}
        </View>
      </View>
    </BaseScreen>
  );
};

export default CodeVerificationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp(5),
    paddingBottom: hp(10),
  },
  otp: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontFamily: "Inter",
    color: "white",
    marginBottom: hp(3),
    textAlign: "center",
  },
  pinCodeText: {
    color: "white",
  },
  timer: {
    marginTop: hp(1),
    color: "#555",
  },
  resendText: {
    marginTop: hp(1),
    color: "#fff",
    fontFamily: "Inter",
    textAlign: "center",
  },
  error: {
    color: "#FF0000",
    marginTop: hp(1),
    marginBottom: hp(-1),
  },
});
