import BackButton from "@/components/utils/BackButton";
import BaseScreen from "@/components/utils/BaseScreen";
import { useSignIn, useSignUp, useUser } from "@clerk/clerk-expo";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Pressable,
  TextInput,
  Text,
  StyleSheet,
  SafeAreaView,
  View,
} from "react-native";
import { OtpInput } from "react-native-otp-entry";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const LoginVerificationScreen = () => {
  const { signIn, setActive } = useSignIn();
  const { phoneNumberId, phoneNumber: rawPhoneNumber } = useLocalSearchParams();
  const [resendTimer, setResendTimer] = useState(60);
  const [error, setError] = useState(false);

  const phoneNumber = Array.isArray(rawPhoneNumber)
    ? rawPhoneNumber[0]
    : rawPhoneNumber;

  const verifyCode = async (text: string) => {
    try {
      if (phoneNumberId && signIn) {
        const result = await signIn.attemptFirstFactor({
          strategy: "phone_code",
          code: text,
        });
        if (result.status === "complete") {
          await setActive({ session: result.createdSessionId });
        } else {
          console.log("Error Signing In with Phone SMS");
        }
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
      if (signIn) {
        const { supportedFirstFactors } = await signIn.create({
          identifier: phoneNumber,
        });
        const firstPhoneFactor = supportedFirstFactors.find(
          (factor) => factor.strategy === "phone_code"
        ) as any;

        if (firstPhoneFactor) {
          await signIn.prepareFirstFactor({
            strategy: "phone_code",
            phoneNumberId: firstPhoneFactor.phoneNumberId,
          });
          setResendTimer(60);
        }
      }
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

export default LoginVerificationScreen;

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
  input: {
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 5,
    height: hp(5),
    backgroundColor: "rgba(85, 85, 85, 0.5)",
    padding: wp(3),
    color: "white",
    marginBottom: hp(2),
  },
  text: {
    color: "white",
    fontFamily: "Inter",
    fontWeight: "bold",
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
