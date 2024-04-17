import { useSignIn, useUser } from "@clerk/clerk-expo";
import { useState } from "react";
import { Pressable, TextInput, Text, View, SafeAreaView } from "react-native";

const LoginScreen = () => {
  const { signIn, setActive } = useSignIn();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [code, setCode] = useState("");

  const handleSendCode = async (e: any) => {
    e.preventDefault();

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
      }
    }
  };

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
    <SafeAreaView
      style={{
        flex: 1,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <TextInput
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        placeholder="Enter your phone number"
      />
      <Pressable onPress={handleSendCode}>
        <Text>Send Code</Text>
      </Pressable>

      {phoneNumberId && (
        <>
          <TextInput
            value={code}
            onChangeText={setCode}
            placeholder="Enter the code"
          />
          <Pressable onPress={handleVerifyCode}>
            <Text>Verify Code</Text>
          </Pressable>
        </>
      )}
    </SafeAreaView>
  );
};

export default LoginScreen;
