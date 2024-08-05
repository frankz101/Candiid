import Animated, {
  SharedValue,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Alert, Image, Pressable, StyleSheet, View } from "react-native";
import { GiphyMedia, GiphyMediaView } from "@giphy/react-native-sdk";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import useStore from "@/store/useStore";
import { MutableRefObject, memo, useEffect, useState } from "react";
import uuid from "react-native-uuid";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { useUser } from "@clerk/clerk-expo";

interface DisplayMediaComponentProps {
  id?: string;
  media: GiphyMedia;
  positionX?: number;
  positionY?: number;
  scale?: SharedValue<number>;
  mediaType: string;
}

const DisplayMediaComponent: React.FC<DisplayMediaComponentProps> = ({
  id,
  media,
  positionX = 0,
  positionY = 0,
  scale,
  mediaType,
}) => {
  const posX = useSharedValue<number>(positionX);
  const posY = useSharedValue<number>(positionY);

  useAnimatedReaction(
    () => positionX,
    (currentPosX, previousPosX) => {
      if (currentPosX !== previousPosX) {
        posX.value = currentPosX;
      }
    },
    [positionX] // Dependency on positionX to re-create the reaction if needed
  );

  useAnimatedReaction(
    () => positionY,
    (currentPosY, previousPosY) => {
      if (currentPosY !== previousPosY) {
        posY.value = currentPosY;
      }
    },
    [positionY] // Dependency on positionY to re-create the reaction if needed
  );

  useEffect(() => {
    console.log(
      `Sticker ${id} positions updated to: x=${positionX}, y=${positionY}`
    );
    console.log("Pos X: " + id + " " + posX.value);
  }, [positionX, positionY]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: posX.value },
        { translateY: posY.value },
        // Apply scaling if scale is provided and valid
        ...(scale ? [{ scale: scale.value }] : []),
      ],
    };
  });

  const renderMedia = () => {
    switch (mediaType) {
      // case "photo":
      //   return <Animated.Image source={{ uri: media }} style={styles.media} />;
      case "gif":
      case "sticker":
        return (
          <Image
            style={{
              width: "100%",
              height: "100%",
              aspectRatio: media.aspectRatio,
            }}
            source={{ uri: media.data.images.original.url }}
            testID={`gph-dynamic-text-view-${media.id}`}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Animated.View style={[animatedStyle, styles.mediaContainer]}>
      {renderMedia()}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  mediaContainer: {
    width: wp(20),
    height: wp(20),
    position: "absolute",
    zIndex: 1,
  },
});

export default DisplayMediaComponent;
