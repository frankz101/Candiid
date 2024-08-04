import Animated, {
  SharedValue,
  runOnJS,
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

interface NewMediaComponentProps {
  id: string;
  media: GiphyMedia;
  positionX?: number;
  positionY?: number;
  scale?: SharedValue<number>;
  mediaType: string;
  displayModeRef: MutableRefObject<boolean>;
  isNew?: boolean;
  isDisplay?: boolean;
}

const NewMediaComponent: React.FC<NewMediaComponentProps> = ({
  id,
  media,
  positionX = 0,
  positionY = 0,
  scale,
  mediaType,
  displayModeRef,
  isNew,
  isDisplay,
}) => {
  const mediaContext = useSharedValue({ x: positionX, y: positionY });
  const queryClient = useQueryClient();
  const { user } = useUser();

  console.log("New Media Component");

  const posX = useSharedValue<number>(positionX);
  const posY = useSharedValue<number>(positionY);

  const isMediaActive = useSharedValue<boolean>(false);
  const [isStickerVisible, setIsStickerVisible] = useState<boolean>(true);

  // const { addSticker, updateSticker } = useStore((state) => ({
  //   addSticker: state.addSticker,
  //   updateSticker: state.updateSticker,
  // }));

  const { addTempSticker, updateTempSticker } = useStore((state) => ({
    addTempSticker: state.addTempSticker,
    updateTempSticker: state.updateTempSticker,
  }));

  // useEffect(() => {
  //   if (!isDisplay) {
  //     addTempSticker({
  //       x: posX.value,
  //       y: posY.value,
  //       media: media,
  //     });
  //   }
  // }, []);

  useEffect(() => {
    return () => {
      if (!isStickerVisible) {
        queryClient
          .invalidateQueries({ queryKey: ["stickers", user?.id] })
          .then(() => {
            console.log("Stickers data refreshed after deleting a photo.");
          });
      }
    };
  }, [isStickerVisible, queryClient, user?.id]);

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
          <Pressable
            onLongPress={handleLongPress}
            style={{ position: "absolute", width: "100%", height: "100%" }}
          >
            <Image
              style={{
                width: "100%",
                height: "100%",
                aspectRatio: media.aspectRatio,
              }}
              source={{ uri: media.data.images.original.url }}
              testID={`gph-dynamic-text-view-${media.id}`}
            />
          </Pressable>
        );
      default:
        return null;
    }
  };

  const panGesture = Gesture.Pan()
    .enabled(!displayModeRef.current)
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
      if (id) {
        runOnJS(updateTempSticker)(id, posX.value, posY.value);
      } else {
        console.log("Sticker id is undefined, cannot update.");
      }
    });

  const handleLongPress = () => {};

  if (!isStickerVisible) {
    return <View />;
  }

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

export default NewMediaComponent;
