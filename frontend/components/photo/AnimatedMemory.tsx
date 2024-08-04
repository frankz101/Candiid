import { useUser } from "@clerk/clerk-expo";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { MutableRefObject, memo, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Pressable,
  Text,
  View,
  StyleSheet,
  Alert,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import useStore from "@/store/useStore";
import uuid from "react-native-uuid";
import * as Haptics from "expo-haptics";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;
// const postWidth = screenWidth / 2 - 15;
// const postHeight = (postWidth * 5) / 4;

const padding = 20;
const imageWidth = (screenWidth - padding * 6) / 3; // Subtract total padding and divide by 3

type ViewStyleKey = "square" | "rectangle" | "polaroid";

interface AnimatedMemoryProps {
  positionX: number;
  positionY: number;
  postId?: string;
  hangoutId: string;
  memoryId: string;
  color?: string;
  frame?: ViewStyleKey;
  displayModeRef?: MutableRefObject<boolean>;
  isDisplay?: boolean;
  userId: string;
}

const AnimatedMemory = ({
  positionX,
  positionY,
  postId,
  hangoutId,
  memoryId,
  frame = "polaroid",
  color = "#FFF",
  displayModeRef = useRef(true),
  isDisplay,
  userId,
}: AnimatedMemoryProps) => {
  const [isEnlarged, setIsEnlarged] = useState(false);
  const [tempMemoryId, setTempMemoryId] = useState<string>(); // change the name
  const isMemoryActive = useSharedValue<boolean>(false);
  const [isPhotoVisible, setIsPhotoVisible] = useState<boolean>(true);
  const queryClient = useQueryClient();

  const memoryContext = useSharedValue({ x: positionX, y: positionY });
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

  const postStyle = useAnimatedStyle(() => ({
    position: "absolute",
    transform: [{ translateX: posX.value }, { translateY: posY.value }],
    // backgroundColor: "#FFF",
  }));
  const router = useRouter();
  const { user } = useUser();

  const { addMemory, updateMemory } = useStore((state) => ({
    addMemory: state.addMemory,
    updateMemory: state.updateMemory,
  }));

  useEffect(() => {
    const memoryTempId = memoryId || uuid.v4();

    setTempMemoryId(memoryTempId as string);

    if (!isDisplay) {
      addMemory({
        id: memoryTempId as string,
        postX: posX.value,
        postY: posY.value,
        scale: 1,
        rotation: 0,
      });
    }
  }, []);

  const fetchHangout = async () => {
    return axios
      .get(`${process.env.EXPO_PUBLIC_API_URL}/user/${user?.id}/post/${postId}`)
      .then((res) => res.data);
  };

  const { data: photoData, isPending } = useQuery({
    queryKey: ["photo", postId],
    queryFn: fetchHangout,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    return () => {
      if (!isPhotoVisible) {
        queryClient
          .invalidateQueries({ queryKey: ["memories", user?.id] })
          .then(() => {
            console.log("Memories data refreshed after deleting a photo.");
          });
      }
    };
  }, [isPhotoVisible, queryClient, user?.id]);

  const handleLongPress = () => {
    if (!displayModeRef.current) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Alert.alert(
        "Confirm Delete",
        "Are you sure you want to delete this photo?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            onPress: async () => {
              try {
                const response = await axios.delete(
                  `${process.env.EXPO_PUBLIC_API_URL}/memories/${memoryId}/${postId}`
                );
                console.log("Photo deleted successfully:", response.data);
                setIsPhotoVisible(false);
                // queryClient.setQueryData(["memories", user?.id], (old: any) => {
                //   return old.filter((m: any) => m.memoryId !== memoryId);
                // });
              } catch (error: any) {
                console.error(
                  "Failed to delete photo:",
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

  if (!isPhotoVisible) {
    return <View />;
  }

  if (isPending) {
    return <View />;
  }

  const viewStyles = {
    rectangle: {
      view: {
        width: imageWidth,
        aspectRatio: 4 / 5,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: color,
        borderRadius: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
      },
      imageContainer: {},
      image: {
        width: imageWidth,
        height: "100%",
        borderRadius: 5,
      },
    },
    square: {
      view: {
        width: imageWidth,
        height: imageWidth,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: color,
        borderRadius: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
      },
      imageContainer: {},
      image: {
        width: imageWidth,
        height: imageWidth,
        borderRadius: 5,
      },
    },
    polaroid: {
      view: {
        width: imageWidth + wp(4),
        height: imageWidth + hp(6),
        paddingBottom: hp(2),
        backgroundColor: color,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 5,
      },
      imageContainer: {
        width: imageWidth,
        height: imageWidth,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        borderRadius: 5,
      },
      image: {
        borderRadius: 5,
        width: imageWidth,
        height: imageWidth,
      },
    },
  };

  const handlePress = () => {
    router.push({
      pathname: `/(hangout)/${hangoutId}`,
      params: {
        memoryId: memoryId,
        userId: userId,
      },
    });
  };

  const panGesture = Gesture.Pan()
    .enabled(!displayModeRef.current)
    .onStart(() => {
      isMemoryActive.value = true;
      memoryContext.value = {
        x: posX.value,
        y: posY.value,
      };
    })
    .onUpdate((e) => {
      posX.value = e.translationX + memoryContext.value.x;
      posY.value = e.translationY + memoryContext.value.y;
    })
    .onEnd(() => {
      isMemoryActive.value = false;
      if (tempMemoryId) {
        runOnJS(updateMemory)(tempMemoryId, {
          postX: posX.value,
          postY: posY.value,
        });
      } else {
        console.log("Memory id is undefined, cannot update.");
      }
    });

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={postStyle}>
        <View style={[styles.baseImageStyle, viewStyles[frame].view]}>
          {/* work around pls fix*/}
          {postId && photoData ? (
            <View
              style={[styles.baseImageStyle, viewStyles[frame].imageContainer]}
            >
              <Animated.View>
                <Image
                  source={{ uri: photoData.photoUrls[0].fileUrl }}
                  style={[styles.baseImageStyle, viewStyles[frame].image]}
                />
              </Animated.View>
            </View>
          ) : (
            <Animated.View />
          )}
          <Pressable
            onPress={handlePress}
            onLongPress={handleLongPress}
            style={{ position: "absolute", width: "100%", height: "100%" }}
          >
            <View />
          </Pressable>
        </View>
      </Animated.View>
    </GestureDetector>
  );
};

export default AnimatedMemory;

const styles = StyleSheet.create({
  post: {
    width: imageWidth,
    height: imageWidth,
  },
  polaroid: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: imageWidth + wp(4),
    height: imageWidth + hp(6),
    paddingBottom: hp(2),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  baseImageStyle: {},
});
