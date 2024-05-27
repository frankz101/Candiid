import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

const screenWidth = Dimensions.get("window").width;
const padding = 2;
const imageWidth = (screenWidth - padding * 6) / 3; // Subtract total padding and divide by 3

interface PhotoSquareSelectProps {
  imageUrl: string;
}

const PhotoSquareSelect: React.FC<PhotoSquareSelectProps> = ({ imageUrl }) => {
  return (
    <View style={styles.imageContainer}>
      <Image source={{ uri: imageUrl }} style={styles.image} />
    </View>
  );
};

export default PhotoSquareSelect;

const styles = StyleSheet.create({
  imageContainer: {
    width: imageWidth,
    height: imageWidth,
    margin: padding,
  },
  image: {
    width: "100%",
    height: "100%",
    aspectRatio: 1,
  },
});
