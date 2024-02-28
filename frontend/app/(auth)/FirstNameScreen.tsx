import { useRoute } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, SafeAreaView, Text, TextInput } from "react-native";

const FirstNameScreen = () => {
  const [firstName, setFirstName] = useState("");
  const router = useRouter();

  const { phoneNumber } = useLocalSearchParams();

  return (
    <SafeAreaView>
      <TextInput
        value={firstName}
        onChangeText={setFirstName}
        placeholder="first name"
      />
      <Pressable
        onPress={() =>
          router.push({
            pathname: "/UsernameScreen",
            params: {
              firstName,
              phoneNumber,
            },
          })
        }
      >
        <Text>Next</Text>
      </Pressable>
    </SafeAreaView>
  );
};

export default FirstNameScreen;
