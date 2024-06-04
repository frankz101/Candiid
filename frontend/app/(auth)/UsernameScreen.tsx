import BackButton from "@/components/utils/BackButton";
import BaseScreen from "@/components/utils/BaseScreen";
import { useSignUp, useUser } from "@clerk/clerk-expo";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  Text,
  TextInput,
  StyleSheet,
  View,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const UsernameScreen = () => {
  const { phoneNumber, firstName } = useLocalSearchParams();
  const [username, setUsername] = useState("");
  const { signUp } = useSignUp();
  const router = useRouter();

  const handleSubmit = async () => {
    try {
      await signUp?.create({
        username,
        phoneNumber: Array.isArray(phoneNumber) ? phoneNumber[0] : phoneNumber,
        firstName: Array.isArray(firstName) ? firstName[0] : firstName,
      });

      await signUp?.preparePhoneNumberVerification({ strategy: "phone_code" });
      router.push({
        pathname: "/CodeVerificationScreen",
        params: {
          phoneNumber,
        },
      });
    } catch (err: any) {
      console.error(err.message);
    }
  };

  return (
    <BaseScreen>
      <View style={styles.container}>
        <BackButton />
        <Text style={styles.header}>{"\n"}Create a username.</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          placeholder="Enter a username"
          placeholderTextColor="#555555"
        />
        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed
              ? { backgroundColor: "rgba(85, 85, 85, 0.7)" }
              : { backgroundColor: "rgba(85, 85, 85, 0.5)" },
          ]}
          onPress={() => handleSubmit()}
        >
          <Text style={styles.text}>Confirm</Text>
        </Pressable>
      </View>
    </BaseScreen>
  );
};

export default UsernameScreen;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: wp(5),
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
});
