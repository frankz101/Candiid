import React from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import AnimatedPost from "@/components/photo/AnimatedMemory";
import { Ionicons } from "@expo/vector-icons";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;
const postWidth = screenWidth / 2 - 15;
const postHeight = (postWidth * 5) / 4;

interface Hangout {
  postId: string;
  hangoutId: string;
  id: string;
  postX: number;
  postY: number;
}

interface MemoriesViewProps {
  hangouts: Hangout[];
}

const MemoriesView: React.FC<MemoriesViewProps> = ({ hangouts }) => {
  const screenX = useSharedValue<number>(0);
  const screenY = useSharedValue<number>(0);
  const postX = useSharedValue<number>(0);
  const postY = useSharedValue<number>(0);
  const scale = useSharedValue<number>(1);
  const scaleContext = useSharedValue({ scale: 1 });
  const screenContext = useSharedValue({ x: 0, y: 0 });
  const isPostActive = useSharedValue<boolean>(false);

  const springBorder = () => {
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
      let newX = (e.translationX + screenContext.value.x) / scale.value;
      let newY = (e.translationY + screenContext.value.y) / scale.value;

      const containerWidth = screenWidth * scale.value;
      const containerHeight = screenHeight * scale.value; // Use the scaled dimensions of the inner container
      const extraSpace = 35;
      const maxX = Math.max(0, (containerWidth - screenWidth) / 2 + extraSpace);
      const maxY =
        Math.max(0, (containerHeight - screenHeight) / 2 + extraSpace) * 9.5;
      const minX = -maxX;
      const minY = -maxY;

      if (newX >= maxX || newY >= maxY || newX <= minX || newY <= minY) {
        runOnJS(springBorder)();
      }

      screenX.value = Math.min(Math.max(newX, minX), maxX);
      screenY.value = Math.min(Math.max(newY, minY), maxY);
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
  // console.log("ScreenHeight: " + screenHeight);
  // console.log("ScreenWidth: " + screenWidth);
  // console.log("Hangout Data " + hangouts);

  return (
    <View>
      <GestureDetector gesture={combinedGesture}>
        <Animated.View style={[styles.container, containerStyle]}>
          {hangouts &&
            hangouts.map((hangout, index) => (
              <AnimatedPost
                key={index + hangout.hangoutId}
                postId={hangout.postId}
                hangoutId={hangout.hangoutId}
                memoryId={hangout.id}
                positionX={hangout.postX}
                positionY={hangout.postY}
              />
            ))}
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

export default MemoriesView;

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "grey",
    width: screenWidth,
    height: screenHeight,
  },
  post: {
    width: postWidth,
    height: postHeight,
    borderRadius: 10,
    backgroundColor: "blue",
  },
});
