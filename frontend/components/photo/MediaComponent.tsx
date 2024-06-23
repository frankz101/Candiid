import { Image } from "expo-image";
import Animated, {
  SharedValue,
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

interface MediaComponentProps {
  key: number;
  media: GiphyMedia;
  scale?: SharedValue<number>;
  mediaType: string;
}

const MediaComponent: React.FC<MediaComponentProps> = ({
  media,
  scale,
  mediaType,
}) => {
  const mediaContext = useSharedValue({ x: 0, y: 0 });

  const positionX = useSharedValue<number>(0);
  const positionY = useSharedValue<number>(0);

  const isMediaActive = useSharedValue<boolean>(false);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: positionX.value },
        { translateY: positionY.value },
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
        x: positionX.value,
        y: positionY.value,
      };
    })
    .onUpdate((e) => {
      positionX.value = e.translationX + mediaContext.value.x;
      positionY.value = e.translationY + mediaContext.value.y;
    })
    .onEnd(() => {
      isMediaActive.value = false;
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
