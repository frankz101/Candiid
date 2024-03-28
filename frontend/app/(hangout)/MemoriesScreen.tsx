import AnimatedPost from "@/components/photo/AnimatedPost";
import useStore from "@/store/useStore";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import axios, { AxiosResponse } from "axios";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { runOnJS } from "react-native-reanimated";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;
// const postWidth = screenWidth / 2 - 15;
// const postHeight = (postWidth * 5) / 4;

const padding = 20;
const imageWidth = (screenWidth - padding * 6) / 3; // Subtract total padding and divide by 3

const MemoriesScreen = () => {
  const { user } = useUser();
  const { userId, newPost } = useLocalSearchParams();
  let hangoutId = useLocalSearchParams().hangoutId;
  const isNewPost = newPost === "true";
  const [isPlacementMode, setIsPlacementMode] = useState(false);
  const hangoutDetails = useStore((state) => state.hangoutDetails) || {
    hangoutName: "",
    selectedFriends: [],
  };
  const setHangoutDetails = useStore((state) => state.setHangoutDetails);

  useEffect(() => {
    if (isNewPost) {
      setIsPlacementMode(true);
    }
  }, [isNewPost]);

  const fetchHangouts = async () => {
    console.log("Fetching Memories");
    console.log(`${process.env.EXPO_PUBLIC_API_URL}/memories/${user?.id}`);
    return axios
      .get(`${process.env.EXPO_PUBLIC_API_URL}/memories/${user?.id}`)
      .then((res) => res.data);
  };

  const { data: hangouts, isPending } = useQuery({
    queryKey: ["hangouts"],
    queryFn: fetchHangouts,
  });

  const screenX = useSharedValue<number>(0);
  const screenY = useSharedValue<number>(0);

  const postX = useSharedValue<number>(0);
  const postY = useSharedValue<number>(0);

  const scale = useSharedValue<number>(1);

  const scaleContext = useSharedValue({ scale: 1 });
  const screenContext = useSharedValue({ x: 0, y: 0 });
  const postContext = useSharedValue({ x: 0, y: 0 });
  const isPostActive = useSharedValue<boolean>(false);

  const springBorder = () => {
    console.log("SPRING");
    screenX.value = withSpring(0, {
      stiffness: 60,
    });
    screenY.value = withSpring(0, {
      stiffness: 60,
    });
  };

  const screenPan = Gesture.Pan()
    .onStart((e) => {
      screenContext.value = {
        x: screenX.value * scale.value,
        y: screenY.value * scale.value,
      };
    })
    .onUpdate((e) => {
      if (!isPostActive.value) {
        let newX = (e.translationX + screenContext.value.x) / scale.value;
        let newY = (e.translationY + screenContext.value.y) / scale.value;

        const extraSpace = 50;
        const maxX = Math.max(
          0,
          ((screenWidth * scale.value - screenWidth) / 2 + extraSpace) /
            scale.value
        );
        const maxY = Math.max(
          0,
          ((screenHeight * scale.value - screenHeight) / 2 + extraSpace) /
            scale.value
        );
        const minX = -maxX;
        const minY = -maxY;

        if (newX >= maxX || newY >= maxY || newX <= minX || newY <= minY) {
          runOnJS(springBorder)();
        }

        screenX.value = Math.min(Math.max(newX, minX), maxX);
        screenY.value = Math.min(Math.max(newY, minY), maxY);

        // console.log("newX:", newX, "newY:", newY);
        // console.log("maxX:", maxX, "maxY:", maxY, "minX:", minX, "minY:", minY);
        // console.log(`Screen Position: X=${screenX.value}, Y=${screenY.value}`);
      }
    });

  const postPan = Gesture.Pan()
    .onStart(() => {
      isPostActive.value = true;
      postContext.value = {
        x: postX.value * scale.value,
        y: postY.value * scale.value,
      };
    })
    .onUpdate((e) => {
      let newpostX = (e.translationX + postContext.value.x) / scale.value;
      let newpostY = (e.translationY + postContext.value.y) / scale.value;

      // const halfPostWidth = postWidth / 2;
      // const halfPostHeight = postHeight / 2;

      const halfPostWidth = imageWidth / 2;
      const halfPostHeight = imageWidth / 2;

      const minX = -screenWidth / 2 + halfPostWidth;
      const maxX = screenWidth / 2 - halfPostWidth;
      const minY = -screenHeight / 2 + halfPostHeight;
      const maxY = screenHeight / 2 - halfPostHeight;

      postX.value = Math.min(Math.max(newpostX, minX), maxX);
      postY.value = Math.min(Math.max(newpostY, minY), maxY);

      // console.log(`Post Position: X=${postX.value}, Y=${postY.value}`);
    })
    .onEnd(() => {
      isPostActive.value = false;
    });

  const pinch = Gesture.Pinch()
    .onStart((e) => {
      scaleContext.value = { scale: scale.value };
    })
    .onUpdate((e) => {
      const newScale = e.scale * scaleContext.value.scale;
      scale.value = Math.min(Math.max(newScale, 0.9), 2);
    });

  const combinedGesture = Gesture.Simultaneous(screenPan, pinch);

  const containerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { translateX: screenX.value },
        { translateY: screenY.value },
      ],
    };
  });

  const postStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: postX.value }, { translateY: postY.value }],
    };
  });

  const handleHangoutSubmit = async () => {
    if (!hangoutId) {
      const hangoutData = {
        userId: user?.id,
        completed: false,
        ...hangoutDetails,
      };

      try {
        const hangoutResponse = await axios.post(
          `${process.env.EXPO_PUBLIC_API_URL}/hangout`,
          hangoutData
        );
        hangoutId = hangoutResponse.data.result;
        console.log(hangoutResponse.data);
      } catch (error) {
        console.error("Error creating hangout:", error);
        return;
      }
    }

    try {
      const memoriesData = {
        userId: user?.id,
        hangoutId: hangoutId,
        postX: postX.value,
        postY: postY.value,
      };

      const memoriesResponse = await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/memories`,
        memoriesData
      );
      console.log(memoriesResponse.data);

      if (hangoutDetails.selectedFriends.length > 0) {
        const hangoutRequestsResponse = await axios.post(
          `${process.env.EXPO_PUBLIC_API_URL}/hangout/${hangoutId}/requests`,
          {
            selectedFriends: hangoutDetails.selectedFriends,
            hangoutName: hangoutDetails.hangoutName,
          }
        );
        console.log(hangoutRequestsResponse.data);
      }

      router.push({
        pathname: "/(tabs)/profile",
      });
      setHangoutDetails({ hangoutName: "", selectedFriends: [] });
    } catch (error) {
      console.error("Error creating memories or hangout requests:", error);
    }
  };

  return isPending ? (
    <Text>Loading...</Text>
  ) : (
    <Animated.View style={{ flex: 1 }} sharedTransitionTag="MemoriesScreen">
      <GestureDetector gesture={combinedGesture}>
        <Animated.View style={[styles.container, containerStyle]}>
          {hangouts?.map((hangout: any, index: number) => (
            <AnimatedPost
              key={index}
              postId={hangout.postId}
              hangoutId={hangout.hangoutId}
              memoryId={hangout.id}
              positionX={hangout.postX}
              positionY={hangout.postY}
            />
          ))}
          {isPlacementMode && (
            <GestureDetector gesture={postPan}>
              <Animated.View
                style={[
                  styles.post,
                  postStyle,
                  {
                    position: "absolute",
                    zIndex: 1,
                  },
                ]}
              />
            </GestureDetector>
          )}
        </Animated.View>
      </GestureDetector>
      {isPlacementMode && (
        <Pressable
          onPress={handleHangoutSubmit}
          style={{ position: "absolute", right: 14, bottom: 75 }}
        >
          <Ionicons name="checkmark-circle" size={64} />
        </Pressable>
      )}
    </Animated.View>
  );
};

export default MemoriesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "grey",
  },
  post: {
    // width: postWidth,
    // height: postHeight,
    width: imageWidth,
    height: imageWidth,
    borderRadius: 10,
    backgroundColor: "blue",
  },
});
