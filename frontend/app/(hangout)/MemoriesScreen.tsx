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
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;
const postWidth = screenWidth / 2 - 15;
const postHeight = (postWidth * 5) / 4;

const MemoriesScreen = () => {
  const { user } = useUser();
  const { userId, newPost } = useLocalSearchParams();
  const isNewPost = newPost === "true";
  const [isPlacementMode, setIsPlacementMode] = useState(false);
  const hangoutDetails = useStore((state) => state.hangoutDetails);
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
  const ispostActive = useSharedValue<boolean>(false);

  const screenPan = Gesture.Pan()
    .onStart((e) => {
      screenContext.value = {
        x: screenX.value * scale.value,
        y: screenY.value * scale.value,
      };
    })
    .onUpdate((e) => {
      if (!ispostActive.value) {
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

        screenX.value = Math.min(Math.max(newX, minX), maxX);
        screenY.value = Math.min(Math.max(newY, minY), maxY);

        console.log(`Screen Position: X=${screenX.value}, Y=${screenY.value}`);
      }
    });

  const postPan = Gesture.Pan()
    .onStart(() => {
      ispostActive.value = true;
      postContext.value = {
        x: postX.value * scale.value,
        y: postY.value * scale.value,
      };
    })
    .onUpdate((e) => {
      let newpostX = (e.translationX + postContext.value.x) / scale.value;
      let newpostY = (e.translationY + postContext.value.y) / scale.value;

      const halfPostWidth = postWidth / 2;
      const halfPostHeight = postHeight / 2;

      const minX = -screenWidth / 2 + halfPostWidth;
      const maxX = screenWidth / 2 - halfPostWidth;
      const minY = -screenHeight / 2 + halfPostHeight;
      const maxY = screenHeight / 2 - halfPostHeight;

      postX.value = Math.min(Math.max(newpostX, minX), maxX);
      postY.value = Math.min(Math.max(newpostY, minY), maxY);

      console.log(`Post Position: X=${postX.value}, Y=${postY.value}`);
    })
    .onEnd(() => {
      ispostActive.value = false;
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
      console.log(hangoutResponse.data);

      const memoriesData = {
        userId: user?.id,
        hangoutId: hangoutResponse.data.result,
        postX: postX.value,
        postY: postY.value,
      };

      const memoriesResponse = await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/memories`,
        memoriesData
      );
      console.log(memoriesResponse.data);

      // Navigation and state update
      router.push({
        pathname: "/(tabs)/profile",
      });
      setHangoutDetails({ hangoutName: "" });
    } catch (error) {
      console.error(error);
    }
  };

  return isPending ? (
    <Text>Loading...</Text>
  ) : (
    <View style={{ flex: 1 }}>
      <GestureDetector gesture={combinedGesture}>
        <Animated.View style={[styles.container, containerStyle]}>
          {console.log("Memories Screen: " + hangouts)}
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
    </View>
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
    width: postWidth,
    height: postHeight,
    borderRadius: 10,
    backgroundColor: "blue",
  },
});
