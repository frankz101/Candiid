import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const Hangout = () => {
  const { hangoutId } = useLocalSearchParams();

  return (
    <SafeAreaView>
      <Text>{hangoutId}</Text>
    </SafeAreaView>
  );
};

export default Hangout;

const styles = StyleSheet.create({});
