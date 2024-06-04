import { useSignIn, useUser } from "@clerk/clerk-expo";
import BackButton from "@/components/utils/BackButton";
import BaseScreen from "@/components/utils/BaseScreen";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Pressable, TextInput, Text, View, StyleSheet, SafeAreaView } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const LoginScreen = () => {
  const { signIn, setActive } = useSignIn();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneNumberId, setPhoneNumberId] = useState("");
  const router = useRouter();

  const handleSendCode = async () => {
    if (signIn) {
      const { supportedFirstFactors } = await signIn.create({
        identifier: phoneNumber,
      });
      const firstPhoneFactor = supportedFirstFactors.find(
        (factor) => factor.strategy === "phone_code"
      ) as any;

      const { phoneNumberId } = firstPhoneFactor;

      await signIn.prepareFirstFactor({
        strategy: "phone_code",
        phoneNumberId,
      });

      if (firstPhoneFactor) {
        setPhoneNumberId(firstPhoneFactor.phoneNumberId);
        await signIn.prepareFirstFactor({
          strategy: "phone_code",
          phoneNumberId: firstPhoneFactor.phoneNumberId,
        });
        router.push({
          pathname: "/LoginVerificationScreen",
          params: {
            phoneNumberId,
            phoneNumber
          }
        })
      }
    }
  };

  return (
    <BaseScreen>
      <SafeAreaView style={styles.container}>
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
        <Pressable 
          style={({ pressed }) => [
            styles.button,
            pressed
              ? { backgroundColor: "rgba(85, 85, 85, 0.7)" }
              : { backgroundColor: "rgba(85, 85, 85, 0.5)" },
          ]}
          onPress={handleSendCode}>
          <Text style={styles.text}>Send Code</Text>
        </Pressable>
      </SafeAreaView>
    </BaseScreen>
  );
};

export default LoginScreen;

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
})