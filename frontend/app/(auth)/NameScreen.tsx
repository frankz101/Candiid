import BackButton from "@/components/utils/BackButton";
import BaseScreen from "@/components/utils/BaseScreen";
import { useRoute } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
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

const NameScreen = () => {
  const [firstName, setFirstName] = useState("");
  const router = useRouter();

  const { phoneNumber } = useLocalSearchParams();

  return (
    <BaseScreen>
      <View style={styles.container}>
        <BackButton />
        <Text style={styles.header}>{"\n"}What's your name?</Text>
        <TextInput
          style={styles.input}
          value={firstName}
          onChangeText={setFirstName}
          autoCapitalize="none"
          placeholder="Enter your first name"
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
              pathname: "/UsernameScreen",
              params: {
                firstName,
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

export default NameScreen;

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
});
