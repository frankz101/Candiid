import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useCameraPermission,
  useCameraDevice,
  Camera,
  useCameraFormat,
} from "react-native-vision-camera";
import { useIsFocused } from "@react-navigation/native";
import { useAppState } from "@react-native-community/hooks";
import { Ionicons, Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import RNFetchBlob, { FetchBlobResponse } from "rn-fetch-blob";
import { useUser } from "@clerk/clerk-expo";
import { useLocalSearchParams, useRouter } from "expo-router";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Image } from "expo-image";

const screenWidth = Dimensions.get("window").width;
const screenHeight = screenWidth * (5 / 4);

interface CameraComponentProps {
  hangoutId: string;
}

const CameraComponent: React.FC<CameraComponentProps> = ({ hangoutId }) => {
  const { hasPermission, requestPermission } = useCameraPermission();
  const [cameraType, setCameraType] = useState("front");
  const [recentPhoto, setRecentPhoto] = useState(null);

  const { isLoaded, user } = useUser();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);
  const [pendingUploads, setPendingUploads] = useState<
    Promise<FetchBlobResponse>[]
  >([]);

  useEffect(() => {
    if (!hasPermission) {
      requestPermission(); // ADD SOMETHING WHERE IF A USER REJECTS THEN USE LINKING API TO TELL USER TO ENABLE IN SETTINGS
    }
  }, [hasPermission]);

  useEffect(() => {
    console.log("Pending Uploads:");
    pendingUploads.map((upload) => console.log(upload));
  }, [pendingUploads]);

  console.log("Has camera permission:" + hasPermission);

  if (!hasPermission) {
    return <ActivityIndicator />;
  }

  // const device = useCameraDevice("back", {
  //   physicalDevices: [
  //     "ultra-wide-angle-camera",
  //     "wide-angle-camera",
  //     "telephoto-camera",
  //   ],
  // });

  const device = useCameraDevice(cameraType);

  const lastTap = useRef<number | null>(null);
  const handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300; // Milliseconds
    if (lastTap.current && now - lastTap.current < DOUBLE_PRESS_DELAY) {
      setCameraType((prevCameraType) =>
        prevCameraType === "front" ? "back" : "front"
      );
    }
    lastTap.current = now;
  };

  if (device == null) return <Text>No camera found</Text>;

  // const format = useCameraFormat(device, [
  //   { photoAspectRatio: 4 / 5 },
  //   { photoResolution: "max" },
  // ]);

  const isFocused = useIsFocused();
  const appState = useAppState();
  const isActive = isFocused && appState === "active";
  const camera = useRef<Camera>(null);

  const flashOpacity = useSharedValue(0);

  const flashStyle = useAnimatedStyle(() => {
    return {
      opacity: flashOpacity.value,
    };
  });

  const triggerFlash = () => {
    flashOpacity.value = withSequence(
      withTiming(1, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
  };

  const onCameraCapture = async () => {
    try {
      triggerFlash();
      setIsSubmitDisabled(true);
      const photoFile = await camera.current?.takePhoto();
      if (photoFile && isLoaded && user) {
        const uri = photoFile.path;
        const fileName = uri.split("/").pop();
        const takenBy = user.id;
        const takenAt = new Date().toISOString();

        const uploadPromise = RNFetchBlob.fetch(
          "POST",
          `${process.env.EXPO_PUBLIC_API_URL}/hangout/${hangoutId}/photo`,
          {
            "Content-Type": "multipart/form-data",
          },
          [
            {
              name: "file",
              filename: fileName,
              type: "image/jpeg",
              data: RNFetchBlob.wrap(uri),
            },
            { name: "takenBy", data: takenBy },
            { name: "takenAt", data: takenAt },
          ]
        );
        setPendingUploads((prev) => [...prev, uploadPromise]);
      }
    } catch (error) {
      console.error("Error capturing photo:", error);
    } finally {
      setTimeout(() => {
        setIsSubmitDisabled(false);
      }, 500);
    }
  };

  const handleCameraComplete = () => {
    router.back();

    (async () => {
      await Promise.all(pendingUploads);
      queryClient
        .invalidateQueries({
          queryKey: ["hangoutPhotos", hangoutId],
        })
        .then(() => {
          console.log("Invalidated Query in Background");
        });
    })();
  };

  return (
    <BottomSheetModalProvider>
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          <Pressable onPress={handleDoubleTap} style={StyleSheet.absoluteFill}>
            <Camera
              ref={camera}
              device={device}
              // format={format}
              isActive={isActive}
              photo={true}
              enableZoomGesture
              style={StyleSheet.absoluteFill}
              // style={styles.cameraPreview}
            />
            <Animated.View style={[styles.flashOverlay, flashStyle]} />
          </Pressable>
        </View>
        <Pressable
          onPress={onCameraCapture}
          style={{ position: "absolute", alignSelf: "center", bottom: 75 }}
        >
          <Feather name="circle" size={90} color="#FFF" />
        </Pressable>
        <Pressable
          onPress={handleCameraComplete}
          disabled={isSubmitDisabled}
          style={{ position: "absolute", right: 20, bottom: 90 }}
        >
          {!isSubmitDisabled && (
            <Feather name="arrow-right-circle" size={48} color="white" />
          )}
        </Pressable>
      </View>
    </BottomSheetModalProvider>
  );
};

export default CameraComponent;

const styles = StyleSheet.create({
  cameraPreview: {
    width: screenWidth,
    height: screenHeight,
    alignSelf: "center",
    borderRadius: 30,
  },
  flashOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "white",
  },
  preview: {
    position: "absolute",
    bottom: 10,
    left: 10,
    width: 100,
    height: 100,
    borderRadius: 8,
  },
});
