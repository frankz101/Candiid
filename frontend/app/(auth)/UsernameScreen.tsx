import BackButton from "@/components/utils/BackButton";
import { useSignUp, useUser } from "@clerk/clerk-expo";
import axios from "axios";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, SafeAreaView, Text, TextInput } from "react-native";

const UsernameScreen = () => {
  const { phoneNumber, firstName } = useLocalSearchParams();

  const [username, setUsername] = useState("");
  const [code, setCode] = useState("");

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

  const handleSubmit = async () => {
    console.log("Pressed");
    try {
      await signUp?.create({
        username,
        phoneNumber: Array.isArray(phoneNumber) ? phoneNumber[0] : phoneNumber,
        firstName: Array.isArray(firstName) ? firstName[0] : firstName,
      });

      await signUp?.preparePhoneNumberVerification({ strategy: "phone_code" });
    } catch (err: any) {
      console.error(err.message);
    }
  };

  const onPressVerify = async () => {
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
