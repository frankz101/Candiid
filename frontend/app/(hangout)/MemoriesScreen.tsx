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
import NewMediaComponent from "@/components/photo/NewMediaComponent";
import { Image } from "expo-image";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const initialLayout = { width: Dimensions.get("window").width };

const padding = 20;
const imageWidth = (screenWidth - padding * 6) / 3;
// const imageWidth = (screenWidth - padding * 6) / 3 + wp(4);
const imageHeight = (screenWidth - padding * 6) / 3 + hp(6);

const mediaWidth = wp(20);

GiphySDK.configure({ apiKey: "QDW5PFQZJ8MYnbeJ6mjQhPrRC5v9UI1b" });

export type ViewStyleKey = "square" | "rectangle" | "polaroid";

interface Sticker {
  media: GiphyMedia;
  x: number;
  y: number;
  mediaType: string;
}

const MemoriesScreen = () => {
  const { user } = useUser();
  const { newPost, frameColor, hangoutId } = useLocalSearchParams();
  const isNewPost = newPost === "true";
  const [isPostPlacementMode, setIsPostPlacementMode] = useState(false);
  // const [isMediaPlacementMode, setIsMediaPlacementMode] = useState(false);
  const setHangoutDetails = useStore((state) => state.setHangoutDetails);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [media, setMedia] = useState<GiphyMedia | null>(null);

  // const [addedStickers, setAddedStickers] = useState<Sticker[]>([]);
  const memoryArray = useStore((state) => state.memories);

  // const { updateAllStickers, updateStickerId } = useStore((state) => ({
  //   updateAllStickers: state.updateAllStickers,
  //   updateStickerId: state.updateStickerId,
  // }));

  const {
    setStickers,
    addSticker,
    addTempSticker,
    updateTempSticker,
    resetStickers,
    resetTempStickers,
  } = useStore((state) => ({
    setStickers: state.setStickers,
    addSticker: state.addSticker,
    addTempSticker: state.addTempSticker,
    updateTempSticker: state.updateTempSticker,
    resetStickers: state.resetStickers,
    resetTempStickers: state.resetTempStickers,
  }));
  const stickerStore = useStore((state) => state.stickers);
  const tempStickerStore = useStore((state) => state.tempStickers);

  const queryClient = useQueryClient();

  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [editMode, setEditMode] = useState("");
  const [initialBackgroundColor, setInitialBackgroundColor] = useState("");

  const [modalContent, setModalContent] = useState("");
  const [viewStyle, setViewStyle] = useState<ViewStyleKey>("polaroid");
  const displayModeRef = useRef(true); // SAVE THIS FOR IS EDIT MODE

  const postDetails = useStore((state) => state.postDetails);

  const [color, setColor] = useState("#FFF");
  const selectedColor = useSharedValue(color);

  useEffect(() => {
    if (isNewPost) {
      setIsPostPlacementMode(true);
    }
  }, [isNewPost]);

  /* Board Animation */
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

  useEffect(() => {
    setPostDimensions(getPostDimensions(viewStyle));
  }, [viewStyle]);

  const getPostDimensions = (style: ViewStyleKey) => {
    switch (style) {
      case "rectangle":
        return { width: imageWidth, height: (imageWidth * 5) / 4 };
      case "square":
        return { width: imageWidth, height: imageWidth };
      case "polaroid":
        return {
          width: imageWidth + wp(4),
          height: imageWidth + hp(6),
        };
      default:
        return { width: imageWidth, height: (imageWidth * 5) / 4 };
    }
  };

  const [postDimensions, setPostDimensions] = useState(
    getPostDimensions(viewStyle)
  );

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

      const { width, height } = postDimensions;

      const halfPostWidth = width / 2;
      const halfPostHeight = height / 2;

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

  /* React Query */

  const fetchMemories = async () => {
    console.log("Fetching Memories in Memories");
    return axios
      .get(`${process.env.EXPO_PUBLIC_API_URL}/memories/${user?.id}`)
      .then((res) => res.data);
  };

  const fetchStickers = async () => {
    console.log("Fetching Stickers in Memories");
    return axios
      .get(`${process.env.EXPO_PUBLIC_API_URL}/stickers/${user?.id}`)
      .then((res) => res.data);
  };

  const fetchUser = async () => {
    console.log("Fetching User Information in Memories");
    return axios
      .get(`${process.env.EXPO_PUBLIC_API_URL}/users/${user?.id}/${user?.id}`)
      .then((res) => res.data);
  };

  const [memories, fetchedStickers, profile] = useQueries({
    queries: [
      {
        queryKey: ["memories", user?.id],
        queryFn: fetchMemories,
        staleTime: 1000 * 60 * 5,
      },
      {
        queryKey: ["stickers", user?.id],
        queryFn: fetchStickers,
        staleTime: 1000 * 60 * 5,
      },
      {
        queryKey: ["profile", user?.id],
        queryFn: fetchUser,
        staleTime: 1000 * 60 * 5,
      },
    ],
  });

  const { data: memoriesData, isPending: isPendingMemories } = memories;
  const { data: stickersData, isPending: isPendingStickers } = fetchedStickers;
  const { data: profileDetails, isPending: isPendingProfile } = profile;

  {
    /* Setting the Sticker Store*/
  }
  useEffect(() => {
    if (!isPendingMemories) {
      const stickersObj = stickersData.reduce((acc: any, sticker: any) => {
        acc[sticker.id] = sticker;
        return acc;
      }, {});
      setStickers(stickersObj);
    }
  }, [isPendingMemories]);
  console.log("Sticker Array IDS: " + Object.keys(stickerStore));
  /* Edit Mode */

  const handleEditMode = useCallback((mode: string) => {
    setIsEditMode(true);
    setEditMode(mode);
    if (mode === "background") {
      setModalContent("colorPicker");
    } else if (mode === "stickers") {
      setModalContent("stickers");
    }
    bottomSheetModalRef.current?.present();
  }, []);

  const prepareStickersForUpdate = () => {
    console.log("Object values: " + Object.values(stickerStore));
    const modifiedStickers = Object.values(stickerStore).filter(
      (sticker) => sticker.modified
    );

    console.log("Modified Stickers: ", modifiedStickers);

    return { modifiedStickers };
  };

  const prepareMemoriesForUpdate = () => {
    const modifiedMemories = memoryArray.filter((memory) => memory.modified);

    console.log("Modified Memories: " + modifiedMemories);

    return { modifiedMemories };
  };

  function prepareStickersForAPI(
    stickers: Record<string, StickerDetails>
  ): StickerDetails[] {
    return Object.values(stickers).map((sticker) => ({
      ...sticker,
      id: sticker.id,
      x: sticker.x,
      y: sticker.y,
    }));
  }

  const handleEditSubmit = async () => {
    if (
      editMode === "colorPicker" &&
      selectedColor.value !== initialBackgroundColor
    ) {
      try {
        displayModeRef.current = true;
        const backgroundChangeResponse = await axios.put(
          `${process.env.EXPO_PUBLIC_API_URL}/user/${user?.id}/background`,
          { backgroundColor: selectedColor.value }
        );
        console.log(backgroundChangeResponse);
        setInitialBackgroundColor(selectedColor.value);
      } catch {
        console.log("Error changing background");
      }
    } else if (editMode === "stickers") {
      displayModeRef.current = true;

      const { modifiedStickers } = prepareStickersForUpdate();
      const { modifiedMemories } = prepareMemoriesForUpdate();

      // Modify memories
      if (modifiedMemories.length > 0) {
        const modifiedMemoriesRequestBody = {
          userId: user?.id,
          modifiedMemories,
        };

        try {
          console.log("Modified memories" + modifiedMemories);
          if (modifiedMemories.length > 0) {
            const modifiedMemoriesResponse = await axios.put(
              `${process.env.EXPO_PUBLIC_API_URL}/memories`,
              modifiedMemoriesRequestBody
            );
            console.log(
              "Modified memories updated:",
              modifiedMemoriesResponse.data
            );
            await queryClient.invalidateQueries({
              queryKey: ["memories", user?.id],
            });
          }
        } catch (error: any) {
          console.error(
            "Error updating memories",
            error.response ? error.response.data : error.message
          );
        }
      }

      if (Object.keys(tempStickerStore).length > 0) {
        const preparedStickers = prepareStickersForAPI(tempStickerStore);

        const newStickerRequestBody = {
          userId: user?.id,
          addedStickers: preparedStickers,
        };

        try {
          const response = await axios.post(
            `${process.env.EXPO_PUBLIC_API_URL}/stickers`,
            newStickerRequestBody
          );
          console.log("New stickers added:", response.data);
          const stickerIds = response.data.result;

          if (stickerIds.length === Object.keys(tempStickerStore).length) {
            // console.log(
            //   "Prepared Stickers for API:",
            //   JSON.stringify(preparedStickers, null, 2)
            // );
            stickerIds.forEach((id: string, index: number) => {
              console.log(id);
              const stickerWithId = {
                ...preparedStickers[index],
                id,
              };
              addSticker(stickerWithId);
              resetTempStickers();
            });
          }
          await queryClient.invalidateQueries({
            queryKey: ["stickers", user?.id],
          });
        } catch (error) {
          console.error("Failed to add stickers:", error);
        }
      }

      // Only make requests if there are new or modified stickers
      if (modifiedStickers.length > 0) {
        const modifiedStickerRequestBody = {
          userId: user?.id,
          modifiedStickers,
        };

        try {
          if (modifiedStickers.length > 0) {
            const modifiedStickersResponse = await axios.put(
              `${process.env.EXPO_PUBLIC_API_URL}/stickers`,
              modifiedStickerRequestBody
            );
            console.log(
              "Modified stickers updated:",
              modifiedStickersResponse.data
            );
            resetStickers(modifiedStickersResponse.data);
          }
        } catch (error: any) {
          console.error(
            "Error updating stickers",
            error.response ? error.response.data : error.message
          );
        }
      }
    }

    setIsEditMode(false);
    setEditMode("");
  };
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const snapPoints = useMemo(() => ["25%", "50%", "90%"], []);

  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);

  const handleEditPress = () => {
    setIsEditMode(true);
    setEditMode("stickers");
    displayModeRef.current = false;
  };

  const handleStickerSelect = (e: any) => {
    setIsEditMode(true);
    displayModeRef.current = false;

    const newMedia = e.nativeEvent.media;

    const newSticker: Sticker = {
      media: newMedia,
      x: mediaX.value,
      y: mediaY.value,
      mediaType: "sticker",
    };

    console.log("New Sticker: " + newSticker);
    addTempSticker(newSticker);

    bottomSheetModalRef.current?.close();
  };

  if (!isPendingProfile) {
    selectedColor.value =
      profileDetails.result.backgroundDetails?.backgroundColor;
  }

  // if (!isPendingMemories) {
  //   console.log("Memories Data: " + memoriesData);
  // }

  const backgroundColorStyle = useAnimatedStyle(() => ({
    backgroundColor: selectedColor.value,
  }));

  const onColorSelect = (color: returnedResults) => {
    "worklet";
    selectedColor.value = color.hex;
  };

  /* Hangout Submit */

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

  return isPendingMemories && isPendingStickers && isPendingProfile ? (
    <Text>Loading...</Text>
  ) : (
    <BottomSheetModalProvider>
      <Animated.View
        style={[styles.background, backgroundColorStyle]}
        // sharedTransitionTag="MemoriesScreen"
      >
        {!isEditMode && (
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={32} color="#FFF" />
          </Pressable>
        )}

        {!isEditMode && (
          <Pressable onPress={handleEditPress} style={styles.editButton}>
            <MaterialCommunityIcons
              name="pencil-box-outline"
              size={48}
              color="#FFF"
            />
          </Pressable>
        )}
        {isEditMode && (
          <Pressable
            style={styles.stickerButton}
            onPress={() => handleEditMode("stickers")}
          >
            <MaterialCommunityIcons
              name="sticker-emoji"
              size={32}
              color="white"
            />
          </Pressable>
        )}
        {isEditMode && (
          <Pressable
            style={styles.colorPickerButton}
            onPress={() => handleEditMode("colorPicker")}
          >
            <Ionicons name="color-palette-outline" size={32} color="white" />
          </Pressable>
        )}
        <GestureDetector gesture={combinedGesture}>
          <Animated.View style={[styles.container, containerStyle]}>
            <DotGrid width={screenWidth} height={screenHeight} />
            {memoriesData && memoriesData.length > 0 ? (
              memoriesData.map((hangout: any, index: number) => (
                <AnimatedMemory
                  key={index + (hangout.postId || "")}
                  postId={hangout.postId}
                  hangoutId={hangout.hangoutId}
                  memoryId={hangout.id}
                  positionX={hangout.postX}
                  positionY={hangout.postY}
                  frame={hangout.frame}
                  color={hangout.color}
                  displayModeRef={displayModeRef}
                />
              ))
            ) : (
              <View />
            )}

            {stickerStore && Object.keys(stickerStore).length > 0 ? (
              Object.values(stickerStore).map((sticker: any, index: number) => (
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

            {/*TEMPORARY STICKERS */}
            {Object.keys(tempStickerStore).length > 0 ? (
              Object.values(tempStickerStore).map((sticker, index: number) => (
                <NewMediaComponent
                  key={index}
                  id={index.toString()}
                  media={sticker.media}
                  mediaType={"sticker"}
                  displayModeRef={displayModeRef}
                  isNew={true}
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
            onPress={handleEditSubmit}
            style={{ position: "absolute", right: 16, bottom: 75 }}
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
              style={{ padding: wp(1.5) }}
            />
            <Image
              style={styles.attributionLogo}
              source={require("@/assets/images/PoweredBy_200px-White_HorizText.png")}
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
  backButton: {
    position: "absolute",
    zIndex: 2,
    top: hp(6),
    left: wp(6),
  },
  editButton: {
    position: "absolute",
    right: wp(6),
    top: hp(6),
    zIndex: 2,
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
  attributionLogo: {
    width: wp(40),
    aspectRatio: 10,
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
