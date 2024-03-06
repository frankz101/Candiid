import { Dimensions, StyleSheet, Text, View } from "react-native";
import React from "react";
import { useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const FullScreenImage = () => {
  const { imageUrl } = useLocalSearchParams();

  const imageUri = Array.isArray(imageUrl) ? imageUrl[0] : imageUrl;
  console.log("Image URL" + imageUrl);

  return (
    <View style={{ flex: 1 }}>
      <Image
        source={{ uri: imageUri }}
        style={{ width: screenWidth, height: screenHeight }}
      />
    </View>
  );
};

export default FullScreenImage;

const styles = StyleSheet.create({});
