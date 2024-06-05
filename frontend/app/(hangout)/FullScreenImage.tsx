import { Dimensions, StyleSheet, Text, View, Image } from "react-native";
import React from "react";
import { useLocalSearchParams } from "expo-router";
// import { Image } from "expo-image";
import Animated from "react-native-reanimated";
// import placeholderImage from "../../assets/images/1709686840466-42B3F6F8-4E3E-4058-9ED5-D1870BB1FE87.jpeg";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const FullScreenImage = () => {
  const { imageUrl, postId: postIdParam } = useLocalSearchParams();

  const postId = Array.isArray(postIdParam) ? postIdParam[0] : postIdParam;

  const imageUri = Array.isArray(imageUrl) ? imageUrl[0] : imageUrl;
  console.log("Image URL" + imageUrl);

  const baseUrl =
    "https://firebasestorage.googleapis.com/v0/b/memories-app-fa831.appspot.com/o/";
  const path =
    "photos/vD6bHopMV1GvTqO9n0KF/1709686840466-42B3F6F8-4E3E-4058-9ED5-D1870BB1FE87.jpeg";
  const encodedPath = path.split("/").map(encodeURIComponent).join("%2F");
  const queryParams = "?alt=media&token=2f976fc1-c9e9-4f9f-99d4-47bb7a4fccd4";

  const fullUrl = baseUrl + encodedPath + queryParams;
  console.log("Encoded Image URL: " + fullUrl);

  return (
    <Animated.View style={{ flex: 1 }}>
      <Animated.Image
        // source={placeholderImage}
        source={{
          uri: "https://firebasestorage.googleapis.com/v0/b/memories-app-fa831.appspot.com/o/photos%2FvD6bHopMV1GvTqO9n0KF%2F1709686840466-42B3F6F8-4E3E-4058-9ED5-D1870BB1FE87.jpeg?alt=media&token=2f976fc1-c9e9-4f9f-99d4-47bb7a4fccd4",
        }}
        style={{ width: screenWidth, height: screenHeight }}
        // sharedTransitionTag={postId + "1"}
      />
    </Animated.View>
  );
};

export default FullScreenImage;

const styles = StyleSheet.create({});
