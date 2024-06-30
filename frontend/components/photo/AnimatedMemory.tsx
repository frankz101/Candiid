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

type ViewStyleKey = "square" | "rectangle" | "polaroid";

interface AnimatedMemoryProps {
  positionX: number;
  positionY: number;
  postId?: string;
  hangoutId: string;
  memoryId: string;
  color?: string;
  frame?: ViewStyleKey;
}

const AnimatedMemory = ({
  positionX,
  positionY,
  postId,
  hangoutId,
  memoryId,
  frame = "polaroid",
  color = "#FFF",
}: AnimatedMemoryProps) => {
  const [isEnlarged, setIsEnlarged] = useState(false);
  const postStyle = useAnimatedStyle(() => ({
    position: "absolute",
    transform: [{ translateX: positionX }, { translateY: positionY }],
    // backgroundColor: "#FFF",
  }));
  const router = useRouter();
  const { user } = useUser();

  const fetchHangout = async () => {
    return axios
      .get(`${process.env.EXPO_PUBLIC_API_URL}/user/${user?.id}/post/${postId}`)
      .then((res) => res.data);
  };

  const { data: photoData, isPending } = useQuery({
    queryKey: ["photo", postId],
    queryFn: fetchHangout,
  });

  if (isPending) {
    return <Text>Loading...</Text>;
  }

  const viewStyles = {
    rectangle: {
      view: {
        width: imageWidth,
        aspectRatio: 4 / 5,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: color,
        borderRadius: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
      },
      imageContainer: {},
      image: {
        width: imageWidth,
        height: "100%",
        borderRadius: 5,
      },
    },
    square: {
      view: {
        width: imageWidth,
        height: imageWidth,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: color,
        borderRadius: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
      },
      imageContainer: {},
      image: {
        width: imageWidth,
        height: imageWidth,
        borderRadius: 5,
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
        borderRadius: 5,
      },
      imageContainer: {
        width: imageWidth,
        height: imageWidth,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        borderRadius: 5,
      },
      image: {
        borderRadius: 5,
        width: imageWidth,
        height: imageWidth,
      },
    },
  };

  const handlePress = () => {
    router.push({
      pathname: `/(hangout)/${hangoutId}`,
      params: {
        memoryId: memoryId,
      },
    });
  };

  return (
    <Animated.View style={postStyle}>
      <View style={[styles.baseImageStyle, viewStyles[frame].view]}>
        {/* work around pls fix*/}
        {postId && photoData ? (
          <View
            style={[styles.baseImageStyle, viewStyles[frame].imageContainer]}
          >
            <Animated.Image
              source={{ uri: photoData.result.photoUrls[0].fileUrl }}
              style={[styles.baseImageStyle, viewStyles[frame].image]}
              resizeMode="cover"
            />
          </View>
        ) : (
          <Animated.View />
        )}
        <Pressable
          onPress={handlePress}
          style={{ position: "absolute", width: "100%", height: "100%" }}
        >
          <View />
        </Pressable>
      </View>
    </Animated.View>
  );
};

export default AnimatedMemory;

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
