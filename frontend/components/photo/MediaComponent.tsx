import { Image } from "expo-image";
import Animated, {
  SharedValue,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Alert, Pressable, StyleSheet, View } from "react-native";
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

interface MediaComponentProps {
  id?: string;
  media: GiphyMedia;
  positionX?: number;
  positionY?: number;
  scale?: SharedValue<number>;
  mediaType: string;
  displayModeRef: MutableRefObject<boolean>;
  isNew?: boolean;
  isDisplay?: boolean;
}

const MediaComponent: React.FC<MediaComponentProps> = ({
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
  const [stickerId, setStickerId] = useState<string>();
  const queryClient = useQueryClient();
  const { user } = useUser();

  const posX = useSharedValue<number>(positionX);
  const posY = useSharedValue<number>(positionY);

  const isMediaActive = useSharedValue<boolean>(false);
  const [isStickerVisible, setIsStickerVisible] = useState<boolean>(true);

  const { updateSticker } = useStore((state) => ({
    updateSticker: state.updateSticker,
  }));

  console.log("Rendering Sticker ID: " + id);

  useEffect(() => {
    const stickerTempId = id;
    setStickerId(stickerTempId as string);
  }, []);

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
            <GiphyMediaView
              media={media}
              style={{
                width: "100%",
                height: "100%",
                aspectRatio: media.aspectRatio,
              }}
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
      if (stickerId) {
        runOnJS(updateSticker)(stickerId, posX.value, posY.value, true);
      } else {
        console.log("Sticker id is undefined, cannot update.");
      }
    });

  const handleLongPress = () => {
    if (!displayModeRef.current && id) {
      Alert.alert(
        "Confirm Delete",
        "Are you sure you want to delete this sticker?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            onPress: async () => {
              try {
                const response = await axios.delete(
                  `${process.env.EXPO_PUBLIC_API_URL}/stickers/${id}`
                );
                console.log("Sticker deleted successfully:", response.data);
                setIsStickerVisible(false);
                // queryClient.setQueryData(["memories", user?.id], (old: any) => {
                //   return old.filter((m: any) => m.memoryId !== memoryId);
                // });
              } catch (error: any) {
                console.error(
                  "Failed to delete sticker:",
                  error.response ? error.response.data : error.message
                );
              }
            },
            style: "destructive",
          },
        ],
        { cancelable: true }
      );
    }
  };

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

export default MediaComponent;
