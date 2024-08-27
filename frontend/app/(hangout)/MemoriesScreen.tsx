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
  FlatList,
  Keyboard,
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
} from "@giphy/react-native-sdk";
import MediaComponent from "@/components/photo/MediaComponent";
import { StickerDetails } from "@/store/createStickerSlice";
import ColorPicker, { Panel5 } from "reanimated-color-picker";
import type { returnedResults } from "reanimated-color-picker";
import NewMediaComponent from "@/components/photo/NewMediaComponent";
import { Image } from "expo-image";
import DebouncedPressable from "@/components/utils/DebouncedPressable";
import { BlurView } from "expo-blur";
import uuid from "react-native-uuid";
import MemoriesView from "@/components/profile/MemoriesView";

interface User {
  userId: string;
  boardId: string;
  name: string;
  username: string;
  profilePhoto?: {
    fileUrl: string;
  };
  friends?: string[];
  phoneNumber: string;
  createdHangouts?: string[];
  upcomingHangouts?: string[];
}

interface MemoryDetails {
  id: string;
  boardId: string;
  userId: string;
  hangoutId: string;
  postId: string; // Array of URLs for photos
  postX: number; // Position X on the screen
  postY: number; // Position Y on the screen
  frame: ViewStyleKey; // Frame style (e.g., "square", "rectangle", "polaroid")
  color: string; // Background color
  modified?: boolean; // Optional flag to track if the memory has been modified
}

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const initialLayout = { width: Dimensions.get("window").width };

const padding = 20;
const imageWidth = (screenWidth - padding * 6) / 3;
// const imageWidth = (screenWidth - padding * 6) / 3 + wp(4);
const imageHeight = (screenWidth - padding * 6) / 3 + hp(6);

const mediaWidth = wp(20);

export type ViewStyleKey = "square" | "rectangle" | "polaroid";

const MemoriesScreen = () => {
  const { user } = useUser();
  const { newPost, newBoard, frameColor, hangoutId, boardIdParam } =
    useLocalSearchParams();
  const [boardId, setBoardId] = useState("");
  const [isNewBoard, setIsNewBoard] = useState(newBoard === "true");
  const isNewPost = newPost === "true";
  const [isPostPlacementMode, setIsPostPlacementMode] = useState(false);
  const setHangoutDetails = useStore((state) => state.setHangoutDetails);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [media, setMedia] = useState<GiphyMedia | null>(null);
  const memoryArray = useStore((state) => state.memories);

  const [stickersTest, setStickersTest] = useState<
    Record<string, StickerDetails>
  >({});

  const [memoriesTest, setMemoriesTest] = useState<
    Record<string, MemoryDetails>
  >({});

  const queryClient = useQueryClient();

  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [editMode, setEditMode] = useState("");
  const [initialBackgroundColor, setInitialBackgroundColor] = useState("");

  const [modalContent, setModalContent] = useState("");
  const [viewStyle, setViewStyle] = useState<ViewStyleKey>("polaroid");
  const displayModeRef = useRef(true); // SAVE THIS FOR IS EDIT MODE

  const postDetails = useStore((state) => state.postDetails);

  const [color, setColor] = useState("#FFF");
  const [boardName, setBoardName] = useState();
  const selectedColor = useSharedValue(color);

  /* Modal */
  const boardBottomSheetModalRef = useRef<BottomSheetModal>(null);
  const handlePresentBoardModalPress = useCallback(() => {
    boardBottomSheetModalRef.current?.present();
  }, []);
  const handleBoardSheetChanges = useCallback((index: number) => {
    console.log("handleBoardSheetChanges", index);
  }, []);

  const renderBoardItem = ({ item }: any) => {
    return (
      <Pressable onPress={() => setBoardId(item.id)}>
        <View style={styles.boardItem}>
          <Animated.View style={styles.boardPreview}>
            <MemoriesView
              boardId={item.id}
              color={item.backgroundColor}
              userId={item.userId}
            />
          </Animated.View>
          <Text style={styles.boardText}>{item.id}</Text>
        </View>
      </Pressable>
    );
  };

  useEffect(() => {
    if (isNewBoard) {
      setIsEditMode(true);
    }
    if (isNewPost) {
      setIsPostPlacementMode(true);
    }
  }, [newBoard, isNewPost]);

  useEffect(() => {
    if (boardIdParam) {
      setBoardId(boardIdParam as string);
    }
  }, [boardIdParam]);

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["board", boardId] });
    queryClient.invalidateQueries({ queryKey: ["memories", "board", boardId] });
    queryClient.invalidateQueries({ queryKey: ["stickers", "board", boardId] });
  }, [boardId]);

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

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const snapPoints = useMemo(() => {
    if (modalContent === "stickers") {
      return ["90%", "50%"];
    } else if (modalContent === "colorPicker") {
      return ["50%"];
    }
    return ["50%"];
  }, [modalContent]);

  const modalIndex = useMemo(
    () => (snapPoints.length > 1 ? 0 : 0),
    [snapPoints]
  );

  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);

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

        const extraSpace = 200;
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

        // if (newX >= maxX || newY >= maxY || newX <= minX || newY <= minY) {
        //   runOnJS(springBorder)();
        // }

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
      backgroundColor: selectedColor.value,
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
  const fetchBoards = async () => {
    console.log("Fetching Boards in Memories Screen");
    return axios
      .get(`${process.env.EXPO_PUBLIC_API_URL}/boards/${user?.id}`)
      .then((res) => res.data);
  };

  const fetchBoard = async () => {
    console.log("Fetching Board in Memories Screen");
    return axios
      .get(`${process.env.EXPO_PUBLIC_API_URL}/board/${boardId}`)
      .then((res) => res.data);
  };

  const fetchMemories = async () => {
    if (!boardId) {
      return {}; // Return an empty object if there's no boardId
    }

    console.log("Fetching Memories in Memories Screen");

    try {
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}/memories/${boardId}`
      );
      const memoriesArray = response.data;

      const memoriesObject = memoriesArray.reduce((acc: any, memory: any) => {
        acc[memory.id] = memory;
        return acc;
      }, {});

      return memoriesObject; // Return the memoriesObject
    } catch (error) {
      console.error("Error fetching memories:", error);
      throw new Error("Failed to fetch memories"); // Handle errors appropriately
    }
  };

  const fetchStickers = async () => {
    if (!boardId) {
      return {}; // Return an empty object if there's no boardId
    }

    console.log("Fetching Stickers in Memories Screen");

    try {
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}/stickers/${boardId}`
      );
      const stickersArray = response.data;

      const stickersObject = stickersArray.reduce((acc: any, sticker: any) => {
        acc[sticker.id] = sticker;
        return acc;
      }, {});

      return stickersObject; // Return the stickersObject
    } catch (error) {
      console.error("Error fetching stickers:", error);
      throw new Error("Failed to fetch stickers"); // Handle errors appropriately
    }
  };

  const [memories, stickers, boards, board] = useQueries({
    queries: [
      {
        queryKey: ["memories", "board", boardId],
        queryFn: fetchMemories,
        staleTime: 1000 * 60 * 5,
      },
      {
        queryKey: ["stickers", "board", boardId],
        queryFn: fetchStickers,
        staleTime: 1000 * 60 * 5,
      },
      {
        queryKey: ["allBoards", user?.id],
        queryFn: fetchBoards,
        staleTime: 1000 * 60 * 5,
      },
      {
        queryKey: ["board", boardId],
        queryFn: fetchBoard,
        staleTime: 1000 * 60 * 5,
      },
    ],
  });

  const { data: memoriesData, isPending: isPendingMemories } = memories;
  const { data: boardData, isPending: isPendingBoard } = board;
  const { data: boardsData, isPending: isPendingBoards } = boards;
  // const { data: profileDetails, isPending: isPendingProfile } = profile;
  const { data: stickersData, isPending: isPendingStickers } = stickers;

  useEffect(() => {
    if (!isPendingMemories) {
      setMemoriesTest(memoriesData);
    }
  }, [memoriesData]);

  useEffect(() => {
    if (!isPendingStickers) {
      setStickersTest(stickersData);
    }
  }, [stickersData]);

  useEffect(() => {
    if (boardData && !isPendingBoard && !isNewBoard) {
      selectedColor.value = boardData.backgroundColor || "#FFFFFF";
      setInitialBackgroundColor(boardData.backgroundColor || "#FFFFFF");
      setBoardName(boardData.id);
    } else if (!boardData && isNewBoard && !initialBackgroundColor) {
      const defaultColor = selectedColor.value || "#FFFFFF";
      selectedColor.value = defaultColor;
      setInitialBackgroundColor(defaultColor);
    }
  }, [isPendingBoard, boardData, initialBackgroundColor, isNewBoard]);

  const updateMemoryPosition = (id: string, postX: number, postY: number) => {
    setMemoriesTest((prevMemories: Record<string, MemoryDetails>) => {
      const updatedMemory = {
        ...prevMemories[id],
        postX,
        postY,
        modified: true,
      };

      const newMemories = {
        ...prevMemories,
        [id]: updatedMemory,
      };

      return newMemories;
    });
  };

  const updateStickerPosition = (id: string, x: number, y: number) => {
    setStickersTest((prevStickers: Record<string, StickerDetails>) => {
      // Create the updated sticker
      const updatedSticker = {
        ...prevStickers[id],
        x,
        y,
        modified: true,
      };

      // Create the new stickers object with the updated sticker
      const newStickers = {
        ...prevStickers,
        [id]: updatedSticker,
      };

      // Log the updated sticker and the entire stickers object
      // console.log(`Updated sticker:`, updatedSticker);
      // console.log(`All stickers:`, newStickers);

      return newStickers;
    });
  };

  /* Edit Mode */

  const handleEditMode = useCallback((mode: string) => {
    setIsEditMode(true);
    setEditMode(mode);

    if (mode === "colorPicker") {
      setModalContent("colorPicker");
    } else if (mode === "stickers") {
      setModalContent("stickers");
    }
    bottomSheetModalRef.current?.present();
  }, []);

  const handleEditSubmit = async () => {
    let boardIdToUse = boardId;
    try {
      if (isNewBoard === true) {
        const newBoardRequestBody = {
          userId: user?.id,
          backgroundColor: selectedColor.value,
        };

        const boardResponse = await axios.post(
          `${process.env.EXPO_PUBLIC_API_URL}/boards`,
          newBoardRequestBody
        );

        const newBoardId = boardResponse.data;
        setBoardId(newBoardId); // Set the boardId state
        boardIdToUse = newBoardId;

        console.log("New Board created with ID:", newBoardId);
        console.log(boardId);

        setIsNewBoard(false);
        setIsEditMode(false);
      }
    } catch (error) {
      console.log("Error: " + error);
    }

    if (
      editMode === "colorPicker" &&
      selectedColor.value !== initialBackgroundColor
    ) {
      try {
        displayModeRef.current = true;

        const backgroundChangeResponse = await axios.put(
          `${process.env.EXPO_PUBLIC_API_URL}/boards/${boardIdToUse}/background`,
          { backgroundColor: selectedColor.value }
        );
        console.log("Changed background color");
        queryClient.setQueryData(["profile", user?.id], (oldData) =>
          oldData
            ? {
                ...oldData,
                backgroundDetails: {
                  backgroundColor: selectedColor.value,
                },
              }
            : oldData
        );
      } catch {
        console.log("Error changing background");
      }
    } else if (editMode === "stickers") {
      displayModeRef.current = true;

      const modifiedStickers = Object.values(stickersTest).filter(
        (sticker) => sticker.modified && sticker.id && !sticker.id.includes("-")
      );

      const newStickers = Object.values(stickersTest).filter(
        (sticker) => sticker.id && sticker.id.includes("-")
      );

      modifiedStickers.forEach((sticker, index) => {
        delete modifiedStickers[index].modified;
      });

      newStickers.forEach((sticker, index) => {
        delete newStickers[index].modified;
      });

      if (modifiedStickers.length > 0) {
        try {
          const modifiedStickerRequestBody = {
            boardId: boardIdToUse,
            modifiedStickers,
          };

          const modifiedStickersResponse = await axios.put(
            `${process.env.EXPO_PUBLIC_API_URL}/stickers`,
            modifiedStickerRequestBody
          );

          console.log(
            "Modified stickers updated:",
            modifiedStickersResponse.data
          );

          // Reset the modified flag after successful update
          modifiedStickers.forEach((sticker) => {
            sticker.modified = false;
          });

          setStickersTest((prevStickers) => ({
            ...prevStickers,
            ...modifiedStickers.reduce((acc, sticker) => {
              if (sticker.id) {
                acc[sticker.id] = sticker;
              }
              return acc;
            }, {} as Record<string, StickerDetails>),
          }));

          console.log("Board id " + boardIdToUse);

          await queryClient.invalidateQueries({
            queryKey: ["stickers", boardIdToUse],
          });
          await queryClient.invalidateQueries({
            queryKey: ["stickers", "display", boardIdToUse],
          });
        } catch (error) {
          console.error("Error updating stickers:", error);
        }
      }

      if (newStickers.length > 0) {
        try {
          const newStickerRequestBody = {
            userId: user?.id,
            boardId: boardIdToUse,
            newStickers,
          };

          const newStickersResponse = await axios.post(
            `${process.env.EXPO_PUBLIC_API_URL}/stickers`,
            newStickerRequestBody
          );

          console.log("New stickers created:", newStickersResponse.data);

          const idMapping = newStickersResponse.data;

          setStickersTest((prevStickers) => {
            const updatedStickers = { ...prevStickers };

            Object.entries(idMapping).forEach(([tempId, newId]: any) => {
              if (updatedStickers[tempId]) {
                updatedStickers[newId] = {
                  ...updatedStickers[tempId],
                  id: newId,
                  modified: false,
                };

                delete updatedStickers[tempId];
              }
            });

            return updatedStickers;
          });

          await queryClient.invalidateQueries({
            queryKey: ["stickers", "display", boardIdToUse],
          });
          await queryClient.invalidateQueries({
            queryKey: ["stickers", "board", boardIdToUse],
          });
        } catch (error) {
          console.error("Error updating stickers:", error);
        }
      }
    }

    if (editMode === "stickers") {
      displayModeRef.current = true;

      const modifiedMemories = Object.values(memoriesTest).filter(
        (memory) => memory.modified
      );

      modifiedMemories.forEach((memory, index) => {
        delete modifiedMemories[index].modified;
      });

      if (modifiedMemories.length > 0) {
        try {
          const modifiedMemoryRequestBody = {
            boardId: boardIdToUse,
            modifiedMemories,
          };

          const modifiedMemoriesResponse = await axios.put(
            `${process.env.EXPO_PUBLIC_API_URL}/memories`,
            modifiedMemoryRequestBody
          );

          console.log(
            "Modified memories updated:",
            modifiedMemoriesResponse.data
          );

          // Reset the modified flag after successful update
          modifiedMemories.forEach((memory) => {
            memory.modified = false;
          });

          setMemoriesTest((prevMemories) => ({
            ...prevMemories,
            ...modifiedMemories.reduce((acc, memory) => {
              if (memory.id) {
                acc[memory.id] = memory;
              }
              return acc;
            }, {} as Record<string, MemoryDetails>),
          }));

          await queryClient.invalidateQueries({
            queryKey: ["memories", "display", boardIdToUse],
          });

          await queryClient.invalidateQueries({
            queryKey: ["memories", "board", boardIdToUse],
          });
        } catch (error) {
          console.error("Error updating memories:", error);
        }
      }
    }

    setIsEditMode(false);
    setEditMode("");
  };

  const handleEditPress = () => {
    setIsEditMode(true);
    setEditMode("stickers");
    displayModeRef.current = false;
  };

  const handleStickerSelect = (e: any) => {
    setIsEditMode(true);
    displayModeRef.current = false;

    const newMedia = e.nativeEvent.media;

    // Generate a unique ID for the new sticker
    const newStickerId = uuid.v4() as string;

    const newSticker: StickerDetails = {
      id: newStickerId,
      media: newMedia,
      x: mediaX.value,
      y: mediaY.value,
      mediaType: "sticker",
    };

    console.log("New Sticker: ", newSticker);

    // Add the new sticker directly to the stickersTest state
    setStickersTest((prevStickers) => ({
      ...prevStickers,
      [newStickerId]: newSticker,
    }));

    bottomSheetModalRef.current?.close();
  };

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
      router.push({
        pathname: "/(tabs)/profile",
      });
      const memoriesData = {
        userId: user?.id,
        boardId: boardId,
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
      const memoryId = memoriesResponse.data;

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
      const postId = postResponse.data;

      console.log("Post created:", postResponse.data);

      const updateData = {
        postId: postId,
      };
      await axios.put(
        `${process.env.EXPO_PUBLIC_API_URL}/memories/${memoryId}`,
        updateData
      );

      console.log("Memory updated successfully");
      await queryClient.invalidateQueries({ queryKey: ["memories", user?.id] });

      // Clear the hangout details and navigate to profile
      setHangoutDetails({
        hangoutName: "",
        hangoutDescription: "",
      });
    } catch (error) {
      console.error("Error creating memories or hangout requests:", error);
    }
  };

  return (
    <BottomSheetModalProvider>
      <Animated.View
        style={styles.background}
        // sharedTransitionTag="MemoriesScreen"
      >
        <BlurView style={StyleSheet.absoluteFill} tint="light" intensity={80} />
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            backgroundColorStyle,
            { opacity: 0.4 }, // Adjust the opacity for the overlay
          ]}
        />
        {!isEditMode && (
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={40} color="#FFF" />
          </Pressable>
        )}

        {!isEditMode && (
          <Pressable
            style={styles.boardSelection}
            onPress={handlePresentBoardModalPress}
          >
            <Text style={styles.selectionText}>{boardName}</Text>
          </Pressable>
        )}

        {!isEditMode && (
          <Pressable onPress={handleEditPress} style={styles.editButton}>
            <MaterialCommunityIcons
              name="pencil-box-outline"
              size={40}
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
            {/* <DotGrid width={screenWidth} height={screenHeight} /> */}
            {Object.entries(memoriesTest).map(([id, hangout]) => (
              <AnimatedMemory
                key={id}
                postId={hangout.postId}
                hangoutId={hangout.hangoutId}
                memoryId={hangout.id}
                positionX={hangout.postX}
                positionY={hangout.postY}
                frame={hangout.frame}
                color={hangout.color}
                displayModeRef={displayModeRef}
                userId={user?.id as string}
                updatePosition={updateMemoryPosition}
              />
            ))}
            {Object.entries(stickersTest).map(([id, sticker]) => (
              <MediaComponent
                key={id}
                id={id}
                media={sticker.media}
                positionX={sticker.x}
                positionY={sticker.y}
                mediaType="sticker"
                displayModeRef={displayModeRef}
                updatePosition={updateStickerPosition} // Pass the function here
              />
            ))}
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
          <DebouncedPressable
            onPress={handleHangoutSubmit}
            style={{ position: "absolute", right: 16, bottom: 75 }}
          >
            <Ionicons name="checkmark-circle" size={64} color="#FFF" />
          </DebouncedPressable>
        )}
        {isEditMode && (
          <DebouncedPressable
            onPress={handleEditSubmit}
            style={{ position: "absolute", right: 16, bottom: 75 }}
          >
            <Ionicons name="checkmark-circle" size={64} color="#FFF" />
          </DebouncedPressable>
        )}
      </Animated.View>
      {/* Board Modal*/}
      <BottomSheetModal
        ref={boardBottomSheetModalRef}
        index={modalIndex}
        snapPoints={snapPoints}
        onChange={handleBoardSheetChanges}
        enablePanDownToClose={true}
        enableHandlePanningGesture={true}
      >
        <FlatList
          data={boardsData}
          renderItem={renderBoardItem}
          showsHorizontalScrollIndicator={false}
        />
      </BottomSheetModal>
      {/* Sticker Modal*/}
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={modalIndex}
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
              style={{ marginTop: hp(0), height: hp(100) }}
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
    backgroundColor: "#E0E0E0",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  backButton: {
    position: "absolute",
    zIndex: 2,
    top: hp(7),
    left: wp(6),
  },
  boardSelection: {
    position: "absolute",
    top: hp(7),
    left: "50%",
    marginLeft: -wp(25),
    zIndex: 2,
    width: wp(50),
    backgroundColor: "#FFF",
    height: hp(5),
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  selectionText: {
    color: "#000",
    fontFamily: "Inter",
    fontSize: 16,
    fontWeight: "bold",
  },
  editButton: {
    position: "absolute",
    right: wp(6),
    top: hp(7),
    zIndex: 2,
  },
  stickerButton: {
    position: "absolute",
    zIndex: 2,
    top: hp(7),
    right: wp(6),
  },
  colorPickerButton: {
    position: "absolute",
    zIndex: 2,
    top: hp(7),
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
  boardItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    // backgroundColor: "red",
    height: hp(15),
  },
  boardText: {
    color: "#000",
    fontFamily: "Inter",
    fontSize: 16,
    fontWeight: "bold",
  },
  boardPreview: {
    justifyContent: "center",
    alignContent: "center",
    overflow: "hidden",
    borderRadius: 15,
    transform: [{ scale: 0.2 }, { translateX: wp("-180%") }],
    height: hp("60%"), // Set the desired height after scaling
    width: wp("100%"), // Ensure the width scales with the full screen width
    marginRight: -wp("70%"),
  },
});
