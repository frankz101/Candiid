import BackButton from "@/components/utils/BackButton";
import { useSignUp } from "@clerk/clerk-expo";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, SafeAreaView, Text, TextInput } from "react-native";

const UsernameScreen = () => {
  const { phoneNumber, firstName } = useLocalSearchParams();

  const [username, setUsername] = useState("");
  const [code, setCode] = useState("");

  const { signUp, setActive } = useSignUp();
  const handleSubmit = async () => {
    try {
      await signUp?.create({
        username,
        phoneNumber,
        firstName,
      });

      await signUp?.preparePhoneNumberVerification({ strategy: "phone_code" });
    } catch (err: any) {
      console.error();
    }
  };

  const onPressVerify = async () => {
    try {
      const completeSignUp = await signUp?.attemptPhoneNumberVerification({
        code,
      });
      if (completeSignUp?.status === "complete" && setActive !== undefined) {
        await setActive({ session: completeSignUp.createdSessionId });
      } else {
        console.log("error signing up");
      }
    } catch (err: any) {
      console.error();
    }
  };

  return (
    <SafeAreaView>
      <BackButton />
      <TextInput
        value={username}
        onChangeText={setUsername}
        placeholder="username"
      />
      <Pressable onPress={() => handleSubmit()}>
        <Text>Next</Text>
      </Pressable>

      <TextInput
        value={code}
        onChangeText={setCode}
        placeholder="Verify Code"
      />
      <Pressable onPress={() => onPressVerify()}>
        <Text>Verify</Text>
      </Pressable>
    </SafeAreaView>
  );
};

export default UsernameScreen;
