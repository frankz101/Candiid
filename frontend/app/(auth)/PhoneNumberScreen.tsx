import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BackButton from "@/components/utils/BackButton";

const PhoneNumberScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const router = useRouter();

  return (
    <SafeAreaView>
      <BackButton />
      <TextInput
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        placeholder="phone number"
      />
      <Pressable
        onPress={() => {
          router.push({
            pathname: "/FirstNameScreen",
            params: {
              phoneNumber,
            },
          });
        }}
      >
        <Text>Next</Text>
      </Pressable>
    </SafeAreaView>
  );
};

export default PhoneNumberScreen;
