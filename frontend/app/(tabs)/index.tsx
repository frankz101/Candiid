import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

const Home = () => {
  const router = useRouter();
  return (
    <SafeAreaView>
      <Text>Home</Text>
      <View>
        <Pressable onPress={() => router.push("/(hangout)/MemoriesScreen")}>
          <MaterialIcons name="photo" size={64} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({});
