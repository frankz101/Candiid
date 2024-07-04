import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import Animated from "react-native-reanimated";
import placeholderImage from "../../assets/images/1709686840466-42B3F6F8-4E3E-4058-9ED5-D1870BB1FE87.jpeg";

const screenWidth = Dimensions.get("window").width;
const padding = 2;
const imageWidth = (screenWidth - padding * 6) / 3; // Subtract total padding and divide by 3

interface PhotoSquareSelectProps {
  imageUrl: string;
  index: number;
}

const PhotoSquareSelect: React.FC<PhotoSquareSelectProps> = ({
  imageUrl,
  index,
}) => {
  const router = useRouter();

  return (
    <View style={styles.imageContainer}>
      <Link
        href={{
          pathname: "/(hangout)/FullScreenImage",
          params: { imageUrl, index },
        }}
        asChild
      >
        <Pressable
        // onPress={() => {
        //   router.push({
        //     pathname: "/(hangout)/FullScreenImage",
        //     params: {
        //       imageUrl,
        //       index,
        //     },
        //   });
        // }}
        >
          <Animated.View>
            <Image
              source={{
                uri: imageUrl,
              }}
              style={styles.image}
            />
          </Animated.View>
        </Pressable>
      </Link>
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
