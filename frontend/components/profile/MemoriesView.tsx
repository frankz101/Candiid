import React, { useEffect, useRef } from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  SharedValue,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import AnimatedMemory from "@/components/photo/AnimatedMemory";
import { GiphyMedia } from "@giphy/react-native-sdk";
import MediaComponent from "../photo/MediaComponent";
import { ViewStyleKey } from "@/app/(hangout)/MemoriesScreen";
import DotGrid from "../utils/DotGrid";
import useStore from "@/store/useStore";
import DisplayMediaComponent from "../photo/DisplayMediaComponent";

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
  frame: ViewStyleKey;
  color: string;
}

interface Sticker {
  media: GiphyMedia;
  positionX: SharedValue<number>;
  positionY: SharedValue<number>;
  mediaType: string;
}

interface MemoriesViewProps {
  hangouts?: Hangout[];
  stickers?: Sticker[];
  color?: string;
}

const MemoriesView: React.FC<MemoriesViewProps> = ({
  hangouts,
  stickers,
  color = "#FFF",
}) => {
  const stickerStore = useStore((state) => state.stickers);
  // console.log(JSON.stringify(stickerStore));
  const screenX = useSharedValue<number>(0);
  const screenY = useSharedValue<number>(0);
  const scale = useSharedValue<number>(1);

  const selectedColor = useSharedValue(color);
  const displayModeRef = useRef(true);

  const containerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { translateX: screenX.value },
        { translateY: screenY.value },
      ],
      backgroundColor: color,
    };
  });

  if (!hangouts) {
    return (
      <View>
        <Animated.View
          style={[styles.container, containerStyle]}
        ></Animated.View>
      </View>
    );
  }

  return (
    <View>
      {/* */}
      <Animated.View style={[styles.container, containerStyle]}>
        {/* <Animated.View style={overlayStyle} /> */}
        {/* <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: screenWidth,
            height: screenHeight,
            backgroundColor: "rgba(44, 44, 48, 0.50)",
          }}
        /> */}
        {/* <DotGrid width={screenWidth} height={screenHeight} /> */}
        {hangouts &&
          hangouts.map((hangout, index) => (
            <AnimatedMemory
              key={index + hangout.hangoutId}
              postId={hangout.postId}
              hangoutId={hangout.hangoutId}
              memoryId={hangout.id}
              positionX={hangout.postX}
              positionY={hangout.postY}
              frame={hangout.frame}
              color={hangout.color}
            />
          ))}

        {stickers && stickers.length > 0 ? (
          stickers.map((sticker: any, index: number) => (
            <DisplayMediaComponent
              key={index}
              id={sticker.id}
              media={sticker.media}
              positionX={sticker.x}
              positionY={sticker.y}
              mediaType={"sticker"} // change this later
            />
          ))
        ) : (
          <View />
        )}
      </Animated.View>
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
