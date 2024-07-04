import { Dimensions, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import React from "react";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

interface PhotoPostProps {
  imageUrl: string;
}

const screenWidth = Dimensions.get("window").width;
const postHeight = screenWidth * (5 / 4);

const PhotoPost: React.FC<PhotoPostProps> = ({ imageUrl }) => {
  return <Image source={{ uri: imageUrl }} style={styles.image} />;
};

export default PhotoPost;

const styles = StyleSheet.create({
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
});
