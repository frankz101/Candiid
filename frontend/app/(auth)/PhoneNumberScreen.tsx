import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BackButton from "@/components/utils/BackButton";
import BaseScreen from "@/components/utils/BaseScreen";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const PhoneNumberScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const router = useRouter();

  return (
    <BaseScreen>
      <View style={styles.container}>
        <BackButton />
        <Text style={styles.header}>What's your phone {"\n"}number?</Text>
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
          onPress={() => {
            router.push({
              pathname: "/FirstNameScreen",
              params: {
                phoneNumber,
              },
            });
          }}
        >
          <Text style={styles.text}>Confirm</Text>
        </Pressable>
      </View>
    </BaseScreen>
  );
};

export default PhoneNumberScreen;

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
