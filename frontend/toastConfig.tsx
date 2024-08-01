import React from "react";
import { BaseToast, BaseToastProps } from "react-native-toast-message";
import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const toastConfig = {
  info: (props: BaseToastProps) => (
    <Pressable onPress={props.onPress}>
      <BaseToast
        {...props}
        style={{ marginTop: hp(2), backgroundColor: "#2a2a2d" }}
        contentContainerStyle={{ paddingHorizontal: wp(3), borderRadius: 10 }}
        text1Style={{
          fontSize: 16,
          fontWeight: "bold",
          color: "white",
        }}
        text2Style={{
          fontSize: 14,
          color: "white",
        }}
      />
    </Pressable>
  ),
  success: (props: BaseToastProps) => (
    <BaseToast
      {...props}
      style={styles.success}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.text1}
      text2Style={styles.text2}
      renderTrailingIcon={() => (
        <View
          style={{
            justifyContent: "center",
            marginRight: wp(3),
          }}
        >
          <Ionicons name="checkmark-circle-outline" size={24} color="#4caf50" />
        </View>
      )}
    />
  ),
};

const styles = StyleSheet.create({
  success: {
    borderLeftColor: "#4caf50",
    backgroundColor: "#4a4a4d",
  },
  contentContainer: {
    paddingHorizontal: wp(4),
  },
  text1: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  text2: {
    color: "#f2f2f2",
    fontSize: 12,
  },
});

export default toastConfig;
