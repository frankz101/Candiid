import { ViewStyleKey } from "@/app/(hangout)/MemoriesScreen";
import { useUser } from "@clerk/clerk-expo";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Dimensions,
  Pressable,
  Text,
  View,
  Image,
  StyleSheet,
} from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
// import placeholderImage from "../../assets/images/1709686840466-42B3F6F8-4E3E-4058-9ED5-D1870BB1FE87.jpeg";
// import { Image } from "expo-image";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;
// const postWidth = screenWidth / 2 - 15;
// const postHeight = (postWidth * 5) / 4;

const padding = 20;
const imageWidth = (screenWidth - padding * 6) / 3; // Subtract total padding and divide by 3

interface AnimatedPostProps {
  thumbnail: string;
  color?: string;
  viewStyle: ViewStyleKey;
  setViewStyle: (updateFn: (prevStyle: ViewStyleKey) => ViewStyleKey) => void;
}

const AnimatedPost = ({
  thumbnail,
  color = "#FFF",
  viewStyle,
  setViewStyle,
}: AnimatedPostProps) => {
  const [isEnlarged, setIsEnlarged] = useState(false);
  const router = useRouter();
  const { user } = useUser();
  const [isImagePrefetched, setIsImagePrefetched] = useState(false);

  const cycleViewStyle = () => {
    setViewStyle((currentStyle: ViewStyleKey) => {
      switch (currentStyle) {
        case "square":
          return "rectangle";
        case "rectangle":
          return "polaroid";
        case "polaroid":
          return "square";
        default:
          return "rectangle";
      }
    });
  };

  const viewStyles = {
    rectangle: {
      view: {
        width: imageWidth,
        aspectRatio: 4 / 5,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: color,
        borderRadius: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
      },
      image: {
        width: "100%",
        height: "100%",
        borderRadius: 8,
      },
    },
    square: {
      view: {
        width: imageWidth,
        height: imageWidth,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: color,
        borderRadius: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
      },
      image: {
        width: imageWidth,
        height: imageWidth,
        borderRadius: 8,
      },
    },
    polaroid: {
      view: {
        width: imageWidth + wp(4),
        height: imageWidth + hp(6),
        paddingBottom: hp(2),
        backgroundColor: color,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 8,
      },
      image: {
        width: imageWidth,
        height: imageWidth,
      },
    },
  };

  return (
    <Pressable onPress={cycleViewStyle}>
      <Animated.View>
        <View style={[styles.baseImageStyle, viewStyles[viewStyle].view]}>
          {thumbnail ? (
            <Animated.View>
              <Image
                source={{ uri: thumbnail }}
                style={[styles.baseImageStyle, viewStyles[viewStyle].image]}
              />
            </Animated.View>
          ) : null}
        </View>
      </Animated.View>
    </Pressable>
  );
};

export default AnimatedPost;

const styles = StyleSheet.create({
  post: {
    width: imageWidth,
    height: imageWidth,
  },
  polaroid: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: imageWidth + wp(4),
    height: imageWidth + hp(6),
    paddingBottom: hp(2),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  baseImageStyle: {},
});
