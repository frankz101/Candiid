import { Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useRouter } from "expo-router";
import DebouncedPressable from "../utils/DebouncedPressable";

interface CompleteHangoutButtonProps {
  hangoutId: string;
}

const CompleteHangoutButton: React.FC<CompleteHangoutButtonProps> = ({
  hangoutId,
}) => {
  const router = useRouter();
  return (
    <View>
      <DebouncedPressable
        onPress={() => {
          router.push({
            pathname: "/(hangout)/SelectPhotosScreen",
            params: { hangoutId: hangoutId },
          });
        }}
      >
        <View style={styles.completeHangoutButton}>
          <View style={{ alignItems: "center" }}>
            <Ionicons name="add-circle-outline" size={36} color="#AEAEB4" />
            <Text style={{ color: "#9B9BA1" }}>Complete Hangout</Text>
          </View>
        </View>
      </DebouncedPressable>
    </View>
  );
};

export default CompleteHangoutButton;

const styles = StyleSheet.create({
  completeHangoutButton: {
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
