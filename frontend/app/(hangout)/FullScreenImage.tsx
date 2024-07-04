import {
  Dimensions,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import Animated from "react-native-reanimated";
import placeholderImage from "../../assets/images/1709686840466-42B3F6F8-4E3E-4058-9ED5-D1870BB1FE87.jpeg";
import { BlurView } from "expo-blur";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const FullScreenImage = () => {
  const { imageUrl, index } = useLocalSearchParams();
  const router = useRouter();

  console.log("Image URL" + imageUrl);

  function encodeURLPathAfterKeyword(url: any, keyword: any) {
    const [baseUrl, params] = url.split("?");
    const [protocol, path] = baseUrl.split("//");
    let keywordIndex = path.indexOf(keyword) + keyword.length;

    // Take the part of the path after the keyword
    let preKeywordPath = path.substring(0, keywordIndex);
    let postKeywordPath = path.substring(keywordIndex);

    // Encode the path segment after the keyword
    postKeywordPath = postKeywordPath
      .split("/")
      .map((part: any) => encodeURIComponent(part))
      .join("%2F");

    // Reassemble the URL
    return `${protocol}//${preKeywordPath}${postKeywordPath}${
      params ? "?" + params : ""
    }`;
  }

  const keyword = "photos";
  const encodedUrl = encodeURLPathAfterKeyword(imageUrl, keyword);
  console.log(encodedUrl);

  console.log(index);
  return (
    <BlurView style={{ flex: 1, justifyContent: "center" }}>
      <Pressable
        onPress={() => router.back()}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View>
        <Image
          source={{
            uri: encodedUrl,
          }}
          style={{ width: screenWidth, aspectRatio: 4 / 5 }}
        />
      </Animated.View>
    </BlurView>
  );
};

export default FullScreenImage;

const styles = StyleSheet.create({});
