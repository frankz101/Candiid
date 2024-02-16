import { Pressable, StyleSheet, Text, View } from "react-native";
import React, { useRef } from "react";
import { FontAwesome } from "@expo/vector-icons";
import ActionSheet from "react-native-actions-sheet";

const ChangeProfilePhoto = () => {
  return (
    <View>
      <ActionSheet></ActionSheet>
      <Pressable>
        <FontAwesome name="pencil-square-o" size={32} />
      </Pressable>
    </View>
  );
};

export default ChangeProfilePhoto;

const styles = StyleSheet.create({});
