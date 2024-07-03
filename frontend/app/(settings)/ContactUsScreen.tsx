import BackButton from "@/components/utils/BackButton";
import BaseScreen from "@/components/utils/BaseScreen";
import { useUser } from "@clerk/clerk-expo";
import axios from "axios";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Toast from "react-native-toast-message";

const ContactUsScreen = () => {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [disabled, setDisabled] = useState(true);

  const router = useRouter();
  const { user } = useUser();

  const handleSend = async () => {
    try {
      const ticketDetails = {
        userId: user?.id,
        subject,
        description,
      };
      const res = await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/user/support`,
        {
          ticketDetails,
        }
      );
      console.log(res.data.result);
      if (res.status === 201) {
        Toast.show({
          type: "success",
          text1: "Support ticket created successfully",
          text2: "We'll get back to you shortly!",
          position: "bottom",
          visibilityTime: 1500,
        });
        router.navigate("/profile");
      }
    } catch (err: any) {
      console.error("Error submitting support: ", err.message);
    }
  };

  return (
    <BaseScreen>
      <View style={styles.headerContainer}>
        <BackButton />
        <Text style={styles.headerText}>Contact us</Text>
      </View>
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Subject"
          placeholderTextColor={"#3A3A3D"}
          onChangeText={(text) => {
            setSubject(text);
            setDisabled(text.length == 0 || description.length <= 25);
          }}
          maxLength={50}
          returnKeyType="done"
        />
        <TextInput
          style={[styles.input, styles.description]}
          placeholder="Describe your problem (min 25 chars)"
          placeholderTextColor={"#3A3A3D"}
          onChangeText={(text) => {
            setDescription(text);
            setDisabled(text.length <= 25 || subject.length == 0);
          }}
          maxLength={300}
          multiline
        />
        <Pressable
          style={[
            styles.button,
            { backgroundColor: disabled ? "#4A4A4D" : "white" },
          ]}
          onPress={handleSend}
          disabled={disabled}
        >
          <Text
            style={[styles.buttonText, { color: disabled ? "white" : "black" }]}
          >
            Send
          </Text>
        </Pressable>
      </View>
    </BaseScreen>
  );
};

export default ContactUsScreen;

const styles = StyleSheet.create({
  headerContainer: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(3),
    paddingHorizontal: wp(2),
  },
  headerText: {
    position: "absolute",
    left: wp(20),
    right: wp(20),
    textAlign: "center",
    color: "white",
    fontWeight: "bold",
    fontSize: 20,
  },
  form: {
    paddingHorizontal: wp(2),
    gap: hp(2),
  },
  input: {
    borderWidth: 1,
    borderRadius: 5,
    borderColor: "#4A4A4D",
    paddingVertical: hp(1),
    paddingHorizontal: wp(2),
    color: "white",
  },
  description: {
    minHeight: hp(15),
  },
  button: {
    borderRadius: 10,
    paddingVertical: hp(1.5),
  },
  buttonText: {
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
});
