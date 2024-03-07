import { useUser } from "@clerk/clerk-expo";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Dimensions, Pressable, Text, View, Image } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
// import placeholderImage from "../../assets/images/1709686840466-42B3F6F8-4E3E-4058-9ED5-D1870BB1FE87.jpeg";
// import { Image } from "expo-image";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;
const postWidth = screenWidth / 2 - 15;
const postHeight = (postWidth * 5) / 4;

interface AnimatedPostProps {
  positionX: number;
  positionY: number;
  postId?: string;
  hangoutId: string;
  memoryId: string;
}

const AnimatedPost = ({
  positionX,
  positionY,
  postId,
  hangoutId,
  memoryId,
}: AnimatedPostProps) => {
  const [isEnlarged, setIsEnlarged] = useState(false);
  const postStyle = useAnimatedStyle(() => ({
    position: "absolute",
    width: postWidth,
    height: postHeight,
    borderRadius: 10,
    transform: [{ translateX: positionX }, { translateY: positionY }],
    backgroundColor: postId ? "transparent" : "blue",
  }));
  const router = useRouter();
  const { user } = useUser();
  const [isImagePrefetched, setIsImagePrefetched] = useState(false);
  const imageUrl =
    "https://firebasestorage.googleapis.com/v0/b/memories-app-fa831.appspot.com/o/photos%2FvD6bHopMV1GvTqO9n0KF%2F1709686840466-42B3F6F8-4E3E-4058-9ED5-D1870BB1FE87.jpeg?alt=media&token=2f976fc1-c9e9-4f9f-99d4-47bb7a4fccd4"; //FOR TESTING
  useEffect(() => {
    Image.prefetch(imageUrl)
      .then(() => {
        setIsImagePrefetched(true);
        console.log("PREFETCHED");
      })
      .catch((error) => {
        console.error("Image prefetch failed:", error);
      });
  }, [imageUrl]);

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

  if (photoData) {
    console.log("PostID: " + postId + " " + "Photo Data: " + photoData);
  }

  const handlePress = () => {
    if (postId && photoData && isImagePrefetched) {
      setIsEnlarged(!isEnlarged);
      router.push({
        pathname: "/(hangout)/FullScreenImage",
        params: {
          imageUrl: photoData.result.photoUrls[0].fileUrl,
          postId: postId,
        },
      });
    } else {
      router.push({
        pathname: `/(hangout)/${hangoutId}`,
        params: {
          memoryId: memoryId,
        },
      });
    }
  };

  return (
    <Animated.View style={postStyle} sharedTransitionTag={postId}>
      {postId && photoData ? (
        <Animated.Image
          // source={{ uri: photoData.result.photoUrls[0].fileUrl }}
          source={{
            uri: imageUrl,
          }}
          style={{ width: "100%", height: "100%" }}
          sharedTransitionTag={postId + "1"}
          resizeMode="cover"
        />
      ) : null}
      <Pressable
        onPress={handlePress}
        style={{ position: "absolute", width: "100%", height: "100%" }}
      >
        <View />
      </Pressable>
    </Animated.View>
  );
};

export default AnimatedPost;
