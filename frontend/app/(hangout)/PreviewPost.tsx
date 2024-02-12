import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";

const PreviewPost = () => {
  const info = useLocalSearchParams();
  console.log(info);
  return (
    <SafeAreaView>
      <Text>PreviewPost</Text>
    </SafeAreaView>
  );
};

export default PreviewPost;

const styles = StyleSheet.create({});
