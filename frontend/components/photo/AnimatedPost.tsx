import { useUser } from "@clerk/clerk-expo";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "expo-router";
import { Dimensions, Pressable, Text, View } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";

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

  return (
    <Animated.View style={postStyle}>
      {postId && photoData ? (
        <Animated.Image
          source={{ uri: photoData.result.photoUrls[0].fileUrl }}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
        />
      ) : null}
      <Pressable
        onPress={() =>
          router.push({
            pathname: `/(hangout)/${hangoutId}`,
            params: {
              memoryId: memoryId,
            },
          })
        }
        style={{ position: "absolute", width: "100%", height: "100%" }}
      >
        <View />
      </Pressable>
    </Animated.View>
  );
};

export default AnimatedPost;
