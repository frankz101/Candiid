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
  const { phoneNumber: rawPhoneNumber, firstName: rawFirstName } =
    useLocalSearchParams();
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const { signUp } = useSignUp();
  const router = useRouter();
  const phoneNumber = Array.isArray(rawPhoneNumber)
    ? rawPhoneNumber[0]
    : rawPhoneNumber;
  const firstName = Array.isArray(rawFirstName)
    ? rawFirstName[0]
    : rawFirstName;

  const handleSubmit = async () => {
    try {
      if (username && phoneNumber && firstName && phoneNumber.length === 10) {
        await signUp?.create({
          username,
          phoneNumber: Array.isArray(phoneNumber)
            ? phoneNumber[0]
            : phoneNumber,
          firstName: Array.isArray(firstName) ? firstName[0] : firstName,
        });

        await signUp?.preparePhoneNumberVerification({
          strategy: "phone_code",
        });
        router.push({
          pathname: "/CodeVerificationScreen",
          params: {
            phoneNumber,
          },
        });
      } else {
        let missingFields = [];
        if (
          !phoneNumber ||
          phoneNumber.trim() === "" ||
          phoneNumber.length !== 10
        ) {
          missingFields.push("phone number");
        }
        if (!firstName || firstName.trim() === "") {
          missingFields.push("name");
        }
        if (!username || username.trim() === "") {
          missingFields.push("username");
        }
        setError(`Please input a valid ${missingFields.join(", ")}.`);
      }
    } catch (err: any) {
      setError(err.errors[0].message);
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
        <Text style={styles.error}>{error}</Text>
      </View>
    </BaseScreen>
  );
};

export default UsernameScreen;

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
    width: wp(35),
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
