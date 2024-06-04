import BackButton from "@/components/utils/BackButton";
import BaseScreen from "@/components/utils/BaseScreen";
import { useSignIn, useUser } from "@clerk/clerk-expo";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, TextInput, Text, StyleSheet, SafeAreaView } from "react-native";
import { OtpInput } from "react-native-otp-entry";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const LoginVerificationScreen = () => {
  const { signIn, setActive } = useSignIn();
  const { phoneNumberId, phoneNumber } = useLocalSearchParams();
  const [code, setCode] = useState("");
  const router = useRouter();

  const handleFilled = (text: any) => {
    setCode(text);
    handleVerifyCode();
  }
  const handleVerifyCode = async () => {
    if (phoneNumberId && signIn) {
      const result = await signIn.attemptFirstFactor({
        strategy: "phone_code",
        code: code,
      });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
      } else {
        console.log("Error Signing In with Phone SMS");
      }
    }
  };

  return (
    <BaseScreen>
      <SafeAreaView style={styles.container}>
        <BackButton />
        <Text style={styles.header}>
          Enter the 6-digit code sent to the number: {"\n"}
          ******{phoneNumber.slice(-4)}
        </Text>
        <OtpInput
          numberOfDigits={6}
          focusColor="green"
          focusStickBlinkingDuration={500}
          onFilled={(text) => handleFilled(text)}
          theme={{
            pinCodeTextStyle: styles.pinCodeText,
          }}
        />
      </SafeAreaView>
    </BaseScreen>
  );
};

export default LoginVerificationScreen;

const styles = StyleSheet.create({
  container:{
    marginHorizontal: wp(5),
  },
  header:{
    color: "white",
    fontFamily: "Inter",
    fontSize: 26,
    marginTop: hp(10),
    marginBottom: hp(5),
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
  button: {
    borderColor: "white",
    borderWidth: 1,
    borderRadius: 5,
    height: hp(5),
    width: hp(16),
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-end",
  },
  text: {
    color: "white",
    fontFamily: "Inter",
    fontWeight: "bold",
  },
  pinCodeText: {
    color: "white",
  },
})