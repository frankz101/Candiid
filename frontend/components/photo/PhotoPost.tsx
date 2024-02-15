import { Dimensions, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import React from "react";

interface PhotoPostProps {
  imageUrl: string;
}

const screenWidth = Dimensions.get("window").width;
const postHeight = screenWidth * (5 / 4);

const PhotoPost: React.FC<PhotoPostProps> = ({ imageUrl }) => {
  return (
    <View style={styles.postContainer}>
      <Image source={{ uri: imageUrl }} style={styles.image} />
    </View>
  );
};

export default PhotoPost;

const styles = StyleSheet.create({
  postContainer: {
    width: screenWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
});
