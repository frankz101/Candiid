import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const screenWidth = Dimensions.get("window").width;
const padding = 2;
const imageWidth = (screenWidth - padding * 6) / 3; // Subtract total padding and divide by 3

interface PhotoSquareSelectProps {
  imageUrl: string;
  onPhotoSelect: (isSelected: boolean) => void;
  isSelected: boolean;
  index: number;
}

const PhotoSquareSelect: React.FC<PhotoSquareSelectProps> = ({
  imageUrl,
  onPhotoSelect,
  isSelected,
  index,
}) => {
  const router = useRouter();
  const handlePhotoPress = () => {
    onPhotoSelect(!isSelected);
  };

  return (
    <View style={styles.imageContainer}>
      <Pressable
        onPress={() => {
          router.push({
            pathname: "/(hangout)/FullScreenImage",
            params: {
              imageUrl,
              index,
            },
          });
        }}
      >
        <Image source={{ uri: imageUrl }} style={styles.image} />
      </Pressable>

      <Pressable style={styles.icon} onPress={handlePhotoPress}>
        {isSelected ? (
          <Ionicons name="checkmark-circle-outline" size={28} color="green" />
        ) : (
          <Ionicons
            name="add-circle"
            size={28}
            color="rgba(100, 100, 100, 0.6)"
          />
        )}
      </Pressable>
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
  icon: {
    position: "absolute",
    top: 2,
    right: 2,
  },
});
