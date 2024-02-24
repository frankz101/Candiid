import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useEffect, useRef } from "react";
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
import RNFetchBlob from "rn-fetch-blob";
import { useUser } from "@clerk/clerk-expo";
import { useLocalSearchParams, useRouter } from "expo-router";

const screenWidth = Dimensions.get("window").width;
const screenHeight = screenWidth * (5 / 4);

const CameraScreen = () => {
  const { hasPermission, requestPermission } = useCameraPermission();
  const { isLoaded, user } = useUser();
  const { id } = useLocalSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (!hasPermission) {
      requestPermission(); // ADD SOMETHING WHERE IF A USER REJECTS THEN USE LINKING API TO TELL USER TO ENABLE IN SETTINGS
    }
  }, [hasPermission]);

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

  const device = useCameraDevice("front");

  if (device == null) return <Text>No camera found</Text>;

  // const format = useCameraFormat(device, [
  //   { photoAspectRatio: 4 / 5 },
  //   { photoResolution: "max" },
  // ]);

  const isFocused = useIsFocused();
  const appState = useAppState();
  const isActive = isFocused && appState === "active";
  const camera = useRef<Camera>(null);

  const onCameraCapture = async () => {
    try {
      const photoFile = await camera.current?.takePhoto();
      if (photoFile && isLoaded && user) {
        const uri = photoFile.path;
        const fileName = uri.split("/").pop();
        const takenBy = user.id;
        const takenAt = new Date().toISOString();

        RNFetchBlob.fetch(
          "POST",
          `${process.env.EXPO_PUBLIC_API_URL}/hangout/${id}/photo`, //replace the hangout ID
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
        )
          .then((response) => response.json())
          .then((data) => {
            console.log("Upload success:", data);
            router.push("/(tabs)/profile");
          })
          .catch((error) => {
            console.error("Error uploading photo:", error);
          });
      }
    } catch (error) {
      console.error("Error capturing photo:", error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <Camera
          ref={camera}
          device={device}
          // format={format}
          isActive={isActive}
          photo={true}
          style={styles.cameraPreview}
        />
      </View>
      <Pressable
        onPress={onCameraCapture}
        style={{ position: "absolute", alignSelf: "center", bottom: 75 }}
      >
        <Feather name="circle" size={80} color="white" />
      </Pressable>
    </SafeAreaView>
  );
};

export default CameraScreen;

const styles = StyleSheet.create({
  cameraPreview: {
    width: screenWidth,
    height: screenHeight,
    alignSelf: "center",
  },
});
