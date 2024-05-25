import { Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useRouter } from "expo-router";

const CreateHangoutButton = () => {
  const router = useRouter();
  return (
    <View>
      <Pressable onPress={() => router.push("/(hangout)/CreateHangoutScreen")}>
        <View style={styles.createHangoutButton}>
          <View style={{ alignItems: "center" }}>
            <Ionicons name="add-circle-outline" size={36} color="#AEAEB4" />
            <Text style={{ color: "#9B9BA1" }}>Create a hangout</Text>
          </View>
        </View>
      </Pressable>
    </View>
  );
};

export default CreateHangoutButton;

const styles = StyleSheet.create({
  createHangoutButton: {
    width: wp("95%"),
    aspectRatio: 4.5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#282828",
    backgroundColor: "rgba(44, 44, 48, 0.5)",
    marginTop: hp(2),
    justifyContent: "center",
    alignItems: "center",
  },
});
