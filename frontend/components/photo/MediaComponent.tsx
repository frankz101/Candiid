import { Image } from "expo-image";
import Animated, {
  SharedValue,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { StyleSheet, View } from "react-native";
import { GiphyMedia, GiphyMediaView } from "@giphy/react-native-sdk";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import useStore from "@/store/useStore";
import { useEffect, useState } from "react";
import uuid from "react-native-uuid";

interface MediaComponentProps {
  id?: string;
  media: GiphyMedia;
  positionX?: number;
  positionY?: number;
  scale?: SharedValue<number>;
  mediaType: string;
}

const MediaComponent: React.FC<MediaComponentProps> = ({
  id,
  media,
  positionX = 0,
  positionY = 0,
  scale,
  mediaType,
}) => {
  const mediaContext = useSharedValue({ x: positionX, y: positionY });
  const [stickerId, setStickerId] = useState<string>();

  const posX = useSharedValue<number>(positionX);
  const posY = useSharedValue<number>(positionY);

  const isMediaActive = useSharedValue<boolean>(false);

  const { addSticker, updateSticker } = useStore((state) => ({
    addSticker: state.addSticker,
    updateSticker: state.updateSticker,
  }));

  useEffect(() => {
    const stickerTempId = id || uuid.v4();

    setStickerId(stickerTempId as string);

    addSticker({
      id: stickerTempId as string,
      x: posX.value,
      y: posY.value,
      media: media,
      scale: 1,
      rotation: 0,
    });
  }, []);

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
          <GiphyMediaView
            media={media}
            style={{
              width: "100%",
              height: "100%",
              aspectRatio: media.aspectRatio,
            }}
          />
        );
      default:
        return null;
    }
  };

  const panGesture = Gesture.Pan()
    .onStart(() => {
      isMediaActive.value = true;
      mediaContext.value = {
        x: posX.value,
        y: posY.value,
      };
    })
    .onUpdate((e) => {
      posX.value = e.translationX + mediaContext.value.x;
      posY.value = e.translationY + mediaContext.value.y;
    })
    .onEnd(() => {
      isMediaActive.value = false;
      if (stickerId) {
        runOnJS(updateSticker)(stickerId, {
          x: posX.value,
          y: posY.value,
        });
      } else {
        console.log("Sticker id is undefined, cannot update.");
      }
    });

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[animatedStyle, styles.mediaContainer]}>
        {renderMedia()}
      </Animated.View>
    </GestureDetector>
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

export default MediaComponent;
