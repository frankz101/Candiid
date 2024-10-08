import { useSignIn, useUser } from "@clerk/clerk-expo";
import BackButton from "@/components/utils/BackButton";
import BaseScreen from "@/components/utils/BaseScreen";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Pressable, TextInput, Text, View, StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import DebouncedPressable from "@/components/utils/DebouncedPressable";

const LoginScreen = () => {
  const { signIn } = useSignIn();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSendCode = async () => {
    try {
      if (signIn) {
        const { supportedFirstFactors } = await signIn.create({
          identifier: phoneNumber,
        });
        const firstPhoneFactor = supportedFirstFactors.find(
          (factor) => factor.strategy === "phone_code"
        ) as any;

        const { phoneNumberId } = firstPhoneFactor;

        if (firstPhoneFactor) {
          await signIn.prepareFirstFactor({
            strategy: "phone_code",
            phoneNumberId: firstPhoneFactor.phoneNumberId,
          });
          setError("");
          router.push({
            pathname: "/LoginVerificationScreen",
            params: {
              phoneNumberId,
              phoneNumber,
            },
          });
        }
      }
    } catch (err: any) {
      setError(err.errors[0].message);
    }
  };

  return (
    <BaseScreen>
      <View style={styles.container}>
        <BackButton />
        <Text style={styles.header}>Welcome Back!</Text>
        <TextInput
          style={styles.input}
          value={phoneNumber}
          keyboardType="numeric"
          onChangeText={setPhoneNumber}
          placeholder="Enter your phone number"
          placeholderTextColor="#555555"
        />
        <DebouncedPressable
          style={({ pressed }) => [
            styles.button,
            pressed
              ? { backgroundColor: "rgba(85, 85, 85, 0.7)" }
              : { backgroundColor: "rgba(85, 85, 85, 0.5)" },
          ]}
          onPress={handleSendCode}
        >
          <Text style={styles.text}>Send Code</Text>
        </DebouncedPressable>
        <Text style={styles.error}>{error}</Text>
      </View>
    </BaseScreen>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: wp(5),
  },
  header: {
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
  error: {
    color: "#FF0000",
    alignSelf: "flex-end",
    marginTop: hp(1),
  },
});
