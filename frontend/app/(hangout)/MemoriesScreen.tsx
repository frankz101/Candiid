import AnimatedPost from "@/components/photo/AnimatedPost";
import AnimatedMemory from "@/components/photo/AnimatedMemory";
import useStore from "@/store/useStore";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosResponse } from "axios";
import { router, useLocalSearchParams } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { runOnJS } from "react-native-reanimated";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import DotGrid from "@/components/utils/DotGrid";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import {
  GiphyContent,
  GiphyGridView,
  GiphyMedia,
  GiphyMediaType,
  GiphyMediaView,
  GiphySDK,
} from "@giphy/react-native-sdk";
import MediaComponent from "@/components/photo/MediaComponent";
import { StickerDetails } from "@/store/createStickerSlice";
import ColorPicker, { Panel5 } from "reanimated-color-picker";
import type { returnedResults } from "reanimated-color-picker";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const initialLayout = { width: Dimensions.get("window").width };

const padding = 20;
const imageWidth = (screenWidth - padding * 6) / 3 + wp(4);
const imageHeight = (screenWidth - padding * 6) / 3 + hp(6);

const mediaWidth = wp(20);

GiphySDK.configure({ apiKey: "QDW5PFQZJ8MYnbeJ6mjQhPrRC5v9UI1b" });

export type ViewStyleKey = "square" | "rectangle" | "polaroid";

interface Sticker {
  media: GiphyMedia;
  positionX: SharedValue<number>;
  positionY: SharedValue<number>;
  mediaType: string;
}

const MemoriesScreen = () => {
  const { user } = useUser();
  const { newPost, frameColor, hangoutId } = useLocalSearchParams();
  const isNewPost = newPost === "true";
  const [isPostPlacementMode, setIsPostPlacementMode] = useState(false);
  const [isMediaPlacementMode, setIsMediaPlacementMode] = useState(false);
  const setHangoutDetails = useStore((state) => state.setHangoutDetails);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [media, setMedia] = useState<GiphyMedia | null>(null);
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const stickerArray = useStore((state) => state.stickers);
  const [activeStickerIndex, setActiveStickerIndex] = useState<number | null>(
    null
  );
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isEditBackgroundMode, setIsEditBackgroundMode] =
    useState<boolean>(false);
  const [modalContent, setModalContent] = useState("");
  const [viewStyle, setViewStyle] = useState<ViewStyleKey>("polaroid");
  const displayModeRef = useRef(true); // SAVE THIS FOR IS EDIT MODE

  const postDetails = useStore((state) => state.postDetails);

  const [color, setColor] = useState("#FFF");
  const selectedColor = useSharedValue(color);

  const queryClient = useQueryClient();

  useEffect(() => {
    if (isNewPost) {
      setIsPostPlacementMode(true);
    }
  }, [isNewPost]);

  useEffect(() => {
    if (media) {
      setIsMediaPlacementMode(true);
    }
  }, [media]);

  const fetchHangouts = async () => {
    console.log("Fetching Memories");
    return axios
      .get(`${process.env.EXPO_PUBLIC_API_URL}/memories/${user?.id}`)
      .then((res) => res.data);
  };

  const fetchStickers = async () => {
    console.log("Fetching Stickers");
    return axios
      .get(`${process.env.EXPO_PUBLIC_API_URL}/stickers/${user?.id}`)
      .then((res) => res.data);
  };

  const fetchUser = async () => {
    console.log("Fetching User Information");
    return axios
      .get(`${process.env.EXPO_PUBLIC_API_URL}/users/${user?.id}/${user?.id}`)
      .then((res) => res.data);
  };

  const [hangouts, fetchedStickers, profile] = useQueries({
    queries: [
      { queryKey: ["hangouts-2"], queryFn: fetchHangouts },
      { queryKey: ["stickers", user?.id], queryFn: fetchStickers },
      { queryKey: ["profile", user?.id], queryFn: fetchUser },
    ],
  });

  const { data: hangoutsData, isPending: isPendingHangouts } = hangouts;
  const { data: stickersData, isPending: isPendingStickers } = fetchedStickers;
  const { data: profileDetails, isPending: isPendingProfile } = profile;

  const handleBackgroundSubmit = async () => {
    setIsEditBackgroundMode(false);

    try {
      const backgroundChangeResponse = await axios.put(
        `${process.env.EXPO_PUBLIC_API_URL}/user/${user?.id}/background`,
        { backgroundColor: selectedColor.value }
      );
      console.log(backgroundChangeResponse);
    } catch {
      console.log("Error changing background");
    }
  };

  const handleStickerSubmit = async () => {
    setIsEditMode(false);
    displayModeRef.current = false;
    const newStickers: StickerDetails[] = [];
    // console.log("New Stickers: " + newStickers);
    const existingStickers: StickerDetails[] = [];
    // console.log("Sticker Array: " + stickerArray);

    stickerArray.forEach((sticker) => {
      if (sticker.id && sticker.id.length > 20) {
        newStickers.push(sticker);
      } else if (sticker.id) {
        existingStickers.push(sticker);
      } else {
        console.error("Sticker has no ID: ", sticker);
      }
    });

    const newStickerRequestBody = {
      userId: user?.id,
      newStickers,
    };

    const existingStickerRequestBody = {
      userId: user?.id,
      existingStickers,
    };

    try {
      const newStickersResponse = await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/stickers`,
        newStickerRequestBody
      );
      // console.log(newStickersResponse);

      const existingStickersResponse = await axios.put(
        `${process.env.EXPO_PUBLIC_API_URL}/stickers`,
        existingStickerRequestBody
      );
      // console.log(existingStickersResponse);
    } catch {}
    console.log("All operations done");
  };

  if (!isPendingProfile) {
    selectedColor.value =
      profileDetails.result.backgroundDetails?.backgroundColor;
  }

  const backgroundColorStyle = useAnimatedStyle(() => ({
    backgroundColor: selectedColor.value,
  }));

  const onColorSelect = (color: returnedResults) => {
    "worklet";
    selectedColor.value = color.hex;
  };

  const screenX = useSharedValue<number>(0);
  const screenY = useSharedValue<number>(0);

  const postX = useSharedValue<number>(0);
  const postY = useSharedValue<number>(0);

  const mediaX = useSharedValue<number>(0);
  const mediaY = useSharedValue<number>(0);

  const scale = useSharedValue<number>(1);

  const scaleContext = useSharedValue({ scale: 1 });
  const screenContext = useSharedValue({ x: 0, y: 0 });

  const postContext = useSharedValue({ x: 0, y: 0 });
  const mediaContext = useSharedValue({ x: 0, y: 0 });

  const isPostActive = useSharedValue<boolean>(false);
  const isMediaActive = useSharedValue<boolean>(false);

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
      if (!isPostActive.value && !isMediaActive.value) {
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
      const halfPostHeight = imageHeight / 2;

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

  // console.log("Stickers: " + stickers[1].positionX);
  const mediaPan = Gesture.Pan()
    .onStart(() => {
      isMediaActive.value = true;

      if (activeStickerIndex) {
        mediaContext.value = {
          x: stickers[activeStickerIndex].positionX.value * scale.value,
          y: stickers[activeStickerIndex].positionY.value * scale.value,
        };
      }
    })
    .onUpdate((e) => {
      if (activeStickerIndex !== null) {
        console.log("Selected: " + activeStickerIndex);
        const sticker = stickers[activeStickerIndex];
        let newMediaX = (e.translationX + mediaContext.value.x) / scale.value;
        let newMediaY = (e.translationY + mediaContext.value.y) / scale.value;

        const halfMediaWidth = mediaWidth / 2;

        const minX = -screenWidth / 2 + halfMediaWidth;
        const maxX = screenWidth / 2 - halfMediaWidth;
        const minY = -screenHeight / 2 + halfMediaWidth;
        const maxY = screenHeight / 2 - halfMediaWidth;

        console.log("ZIPPY: " + sticker);
        console.log(
          "NEW STICKER: " +
            JSON.stringify({
              positionX: sticker.positionX.value,
              positionY: sticker.positionY.value,
              mediaType: sticker.mediaType,
            })
        );

        sticker.positionX.value = Math.min(Math.max(newMediaX, minX), maxX);
        sticker.positionY.value = Math.min(Math.max(newMediaY, minY), maxY);
      }
    })
    .onEnd(() => {
      isMediaActive.value = false;
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

  const mediaStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: mediaX.value }, { translateY: mediaY.value }],
    };
  });

  const handleHangoutSubmit = async () => {
    try {
      const memoriesData = {
        userId: user?.id,
        hangoutId: hangoutId,
        postX: postX.value,
        postY: postY.value,
        frame: viewStyle,
        color: frameColor,
      };

      const memoriesResponse = await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/memories`,
        memoriesData
      );
      const memoryId = memoriesResponse.data.result;

      console.log("Memory created:", memoriesResponse.data);

      const postData = {
        userId: user?.id,
        hangoutId: hangoutId,
        photoUrls: postDetails.photos,
        caption: postDetails.caption,
      };

      const postResponse = await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/posts`,
        postData
      );
      const postId = postResponse.data.result;

      console.log("Post created:", postResponse.data);

      const updateData = {
        postId: postId,
      };
      await axios.put(
        `${process.env.EXPO_PUBLIC_API_URL}/memories/${memoryId}`,
        updateData
      );

      console.log("Memory updated successfully");

      // Clear the hangout details and navigate to profile
      setHangoutDetails({
        hangoutName: "",
        hangoutDescription: "",
        selectedFriends: [],
      });

      router.push({
        pathname: "/(tabs)/profile",
      });
    } catch (error) {
      console.error("Error creating memories or hangout requests:", error);
    }
  };

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const snapPoints = useMemo(() => ["25%", "50%", "90%"], []);

  const handleOpenStickerModal = useCallback(() => {
    setModalContent("stickers");
    bottomSheetModalRef.current?.present();
  }, []);

  const handleOpenColorPickerModal = useCallback(() => {
    setIsEditBackgroundMode(true);
    setModalContent("colorPicker");
    bottomSheetModalRef.current?.present();
  }, []);

  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);

  const handleStickerSelect = (e: any) => {
    setIsEditMode(true);
    displayModeRef.current = true;

    const newMedia = e.nativeEvent.media;

    const newSticker: Sticker = {
      media: newMedia,
      positionX: mediaX,
      positionY: mediaY,
      mediaType: "sticker",
    };

    setActiveStickerIndex(stickers.length);

    setStickers((prevStickers) => [...prevStickers, newSticker]);

    bottomSheetModalRef.current?.close();
  };

  // if (!isPendingStickers) {
  //   console.log(stickersData);
  // }

  return isPendingHangouts && isPendingStickers && isPendingProfile ? (
    <Text>Loading...</Text>
  ) : (
    <BottomSheetModalProvider>
      <Animated.View
        style={[styles.background, backgroundColorStyle]}
        // sharedTransitionTag="MemoriesScreen"
      >
        <Pressable
          style={styles.stickerButton}
          onPress={handleOpenStickerModal}
        >
          <MaterialCommunityIcons
            name="sticker-emoji"
            size={32}
            color="white"
          />
        </Pressable>
        <Pressable
          style={styles.colorPickerButton}
          onPress={handleOpenColorPickerModal}
        >
          <Ionicons name="color-palette-outline" size={32} color="white" />
        </Pressable>
        <GestureDetector gesture={combinedGesture}>
          <Animated.View style={[styles.container, containerStyle]}>
            <DotGrid width={screenWidth} height={screenHeight} />
            {hangoutsData && hangoutsData.length > 0 ? (
              hangoutsData.map((hangout: any, index: number) => (
                <AnimatedMemory
                  key={index + (hangout.postId || "")}
                  postId={hangout.postId}
                  hangoutId={hangout.hangoutId}
                  memoryId={hangout.id}
                  positionX={hangout.postX}
                  positionY={hangout.postY}
                  frame={hangout.frame}
                  color={hangout.color}
                />
              ))
            ) : (
              <View />
            )}

            {stickersData && stickersData.length > 0 ? (
              stickersData.map((sticker: any, index: number) => (
                <MediaComponent
                  key={index}
                  id={sticker.id}
                  media={sticker.media}
                  positionX={sticker.x}
                  positionY={sticker.y}
                  mediaType={"sticker"} // change this later
                  displayModeRef={displayModeRef}
                />
              ))
            ) : (
              <View />
            )}

            {/* TEMPORARY STICKERS */}
            {stickers.length > 0 ? (
              stickers.map((sticker, index: number) => (
                // <GestureDetector gesture={mediaPan} key={index}>
                //   <Animated.View
                //     style={[
                //       mediaStyle,
                //       {
                //         position: "absolute",
                //         zIndex: 1,
                //       },
                //     ]}
                //   >
                //     <MediaComponent
                //       key={index}
                //       media={sticker.media}
                //       positionX={sticker.positionX}
                //       positionY={sticker.positionY}
                //       mediaType={sticker.mediaType}
                //     />
                //   </Animated.View>
                // </GestureDetector>
                <MediaComponent
                  key={index}
                  media={sticker.media}
                  mediaType={sticker.mediaType}
                  displayModeRef={displayModeRef}
                />
              ))
            ) : (
              <View />
            )}
            {isPostPlacementMode && (
              <GestureDetector gesture={postPan}>
                <Animated.View
                  style={[
                    postStyle,
                    {
                      position: "absolute",
                      zIndex: 1,
                    },
                  ]}
                >
                  <AnimatedPost
                    thumbnail={postDetails.photos[0].fileUrl}
                    color={frameColor as string}
                    viewStyle={viewStyle}
                    setViewStyle={setViewStyle}
                  />
                </Animated.View>
              </GestureDetector>
            )}
            {/* {isMediaPlacementMode && media && (
              <GestureDetector gesture={mediaPan}>
                <Animated.View
                  style={[
                    mediaStyle,
                    {
                      position: "absolute",
                      zIndex: 1,
                    },
                  ]}
                >
                  <MediaComponent
                    media={media}
                    positionX={mediaX}
                    positionY={mediaY}
                    mediaType="sticker"
                  />
                </Animated.View>
              </GestureDetector>
            )} */}
          </Animated.View>
        </GestureDetector>
        {isPostPlacementMode && (
          <Pressable
            onPress={handleHangoutSubmit}
            style={{ position: "absolute", right: 16, bottom: 75 }}
          >
            <Ionicons name="checkmark-circle" size={64} color="#FFF" />
          </Pressable>
        )}
        {isEditMode && (
          <Pressable
            onPress={handleStickerSubmit}
            style={{ position: "absolute", right: 16, bottom: 75 }}
          >
            <Ionicons name="checkmark-circle" size={64} color="#FFF" />
          </Pressable>
        )}
        {isEditBackgroundMode && (
          <Pressable
            onPress={handleBackgroundSubmit}
            style={{ position: "absolute", right: 30, bottom: 75 }}
          >
            <Ionicons name="checkmark-circle" size={64} color="#FFF" />
          </Pressable>
        )}
      </Animated.View>
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={1}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        enablePanDownToClose={true}
        enableHandlePanningGesture={true}
        // backgroundStyle={styles.modalBackground}
        // handleStyle={styles.handleStyle}
        // handleIndicatorStyle={{ backgroundColor: "#FFF" }}
      >
        {modalContent === "stickers" ? (
          <BottomSheetView>
            <TextInput
              autoFocus
              onChangeText={setSearchQuery}
              placeholder="Search..."
              value={searchQuery}
            />
            <GiphyGridView
              content={
                searchQuery
                  ? GiphyContent.search({
                      searchQuery: searchQuery,
                      mediaType: GiphyMediaType.Sticker,
                    })
                  : GiphyContent.trendingStickers()
              }
              cellPadding={3}
              style={{ height: 300, marginTop: 24 }}
              onMediaSelect={handleStickerSelect}
            />
            {media && (
              <ScrollView
                style={{
                  aspectRatio: media.aspectRatio,
                  maxHeight: 400,
                  padding: 24,
                  width: "100%",
                }}
              >
                <GiphyMediaView
                  media={media}
                  style={{ aspectRatio: media.aspectRatio }}
                />
              </ScrollView>
            )}
          </BottomSheetView>
        ) : (
          <ColorPicker value={selectedColor.value} onChange={onColorSelect}>
            <Panel5 />
          </ColorPicker>
        )}
      </BottomSheetModal>
    </BottomSheetModalProvider>
  );
};

export default MemoriesScreen;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    // backgroundColor: "#141417",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(44, 44, 48, 0.50)",
  },
  stickerButton: {
    position: "absolute",
    zIndex: 2,
    top: hp(6),
    right: wp(6),
  },
  colorPickerButton: {
    position: "absolute",
    zIndex: 2,
    top: hp(6),
    right: wp(15),
  },
  post: {
    // width: postWidth,
    // height: postHeight,
    width: imageWidth,
    height: imageWidth,
    borderRadius: 10,
    backgroundColor: "blue",
  },
  // modalContainer: {
  //   flex: 1,
  //   alignItems: "center",
  //   backgroundColor: "#202023",
  // },
  // handleStyle: {
  //   borderRadius: 5,
  //   backgroundColor: "#202023",
  // },
  // modalBackground: {
  //   backgroundColor: "#202023",
  // },
});
