import React, { useRef, useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, Modal, Image } from "react-native";
import ActionSheet from "react-native-actions-sheet";
import ImagePicker from "react-native-image-crop-picker";
import { SheetManager } from "react-native-actions-sheet";
import { useUser } from "@clerk/clerk-expo";
import axios from "axios";
import RNFetchBlob from "rn-fetch-blob";
import { useQueryClient } from "@tanstack/react-query";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Feather, Ionicons } from "@expo/vector-icons";
import {
  useCameraPermission,
  useCameraDevice,
  Camera,
} from "react-native-vision-camera";
import {
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useIsFocused } from "@react-navigation/native";
import { useAppState } from "@react-native-community/hooks";
import { useRouter } from "expo-router";

interface PhotoPreview {
  path: string;
  mime: string;
}

const ChangePhotoSheet = () => {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const { hasPermission, requestPermission } = useCameraPermission();
  const [cameraType, setCameraType] = useState("front");
  const [showCamera, setShowCamera] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<PhotoPreview | null>(null);
  const isFocused = useIsFocused();
  const appState = useAppState();
  const isActive = isFocused && appState === "active";
  const camera = useRef<Camera>(null);
  const device = useCameraDevice(cameraType);
  const flashOpacity = useSharedValue(0);
  const router = useRouter();

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission]);

  if (!device) return <Text>No camera found</Text>;

  const onCameraCapture = async () => {
    try {
      triggerFlash();
      const photoFile = await camera.current?.takePhoto();
      if (photoFile) {
        setPhotoPreview({ path: photoFile.path, mime: "image/jpeg" });
      }
    } catch (error) {
      console.error("Error capturing photo:", error);
    }
  };

  const triggerFlash = () => {
    flashOpacity.value = withSequence(
      withTiming(1, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
  };

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

  const handleProfilePhoto = async (image: PhotoPreview) => {
    try {
      await RNFetchBlob.fetch(
        "PUT",
        `${process.env.EXPO_PUBLIC_API_URL}/user/${user?.id}/profile-photo`,
        {
          "Content-Type": "multipart/form-data",
        },
        [
          {
            name: "profilePhoto",
            filename: `profile-photo.${image.mime.split("/")[1]}`,
            data: RNFetchBlob.wrap(image.path),
          },
        ]
      )
        .then((response) => response.json())
        .then((data) => {
          console.log("Profile photo change success:", data);
          queryClient.invalidateQueries({
            queryKey: ["profile", user?.id],
          });
        })
        .catch((error) => {
          console.error("Error changing profile photo:", error);
        });
    } catch (error) {
      console.error("Error changing profile photo:", error);
    }
  };

  const removeProfilePhoto = async () => {
    try {
      const response = await axios.delete(
        `${process.env.EXPO_PUBLIC_API_URL}/user/${user?.id}/profile-photo`
      );
      console.log("Profile photo removed successfully:", response.data);
      queryClient.invalidateQueries({
        queryKey: ["profile", user?.id],
      });
    } catch (error) {
      console.error("Error removing profile photo:", error);
    }
  };

  const openImagePicker = () => {
    ImagePicker.openPicker({
      width: 300,
      height: 300,
      cropping: true,
      cropperCircleOverlay: true, // Optional: if you want a circular cropper
    })
      .then((image) => {
        handleProfilePhoto(image);
      })
      .catch((error) => {
        console.error("Error selecting image:", error);
      });
  };

  const confirmPhotoChange = () => {
    if (photoPreview) {
      setPhotoPreview(null);
      setShowCamera(false);
      handleProfilePhoto(photoPreview);
    }
  };

  const cancelPhotoChange = () => {
    setPhotoPreview(null);
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.button} onPress={() => setShowCamera(true)}>
        <Ionicons name="camera-outline" color="white" size={28} />
        <Text style={styles.text}>Take Photo</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={openImagePicker}>
        <Ionicons name="image-outline" color="white" size={28} />
        <Text style={styles.text}>Choose from library</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={removeProfilePhoto}>
        <Ionicons name="trash-outline" color="red" size={28} />
        <Text style={[styles.text, { color: "red" }]}>
          Remove current photo
        </Text>
      </Pressable>
      <Modal visible={showCamera || !!photoPreview} animationType="slide">
        <View style={styles.cameraContainer}>
          {photoPreview ? (
            <>
              <Image
                source={{ uri: photoPreview.path }}
                style={styles.previewImage}
              />
              <View style={styles.previewButtons}>
                <Pressable
                  style={styles.previewButton}
                  onPress={cancelPhotoChange}
                >
                  <Text style={styles.text}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={styles.previewButton}
                  onPress={confirmPhotoChange}
                >
                  <Text style={styles.text}>Confirm</Text>
                </Pressable>
              </View>
            </>
          ) : (
            <>
              <Pressable
                onPress={handleDoubleTap}
                style={StyleSheet.absoluteFill}
              >
                <Camera
                  ref={camera}
                  device={device}
                  isActive={isActive}
                  photo={true}
                  enableZoomGesture={true}
                  style={StyleSheet.absoluteFill}
                />
              </Pressable>
              <Pressable
                onPress={() => setShowCamera(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close-outline" color="white" size={40} />
              </Pressable>
              <Pressable onPress={onCameraCapture} style={styles.captureButton}>
                <Ionicons name="camera-outline" size={90} color="#FFF" />
              </Pressable>
            </>
          )}
        </View>
      </Modal>
    </View>
  );
};

export default ChangePhotoSheet;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: hp(20),
    backgroundColor: "#2a2a2d",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: wp(5),
  },
  button: {
    paddingBottom: hp(2),
    flexDirection: "row",
    alignItems: "center",
    gap: wp(3),
  },
  text: {
    color: "white",
    fontSize: 16,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: hp(7),
    right: wp(5),
  },
  captureButton: {
    position: "absolute",
    alignSelf: "center",
    bottom: hp(8),
  },
  previewImage: {
    width: "100%",
    height: "80%",
  },
  previewButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  previewButton: {
    marginTop: hp(2),
    padding: wp(3),
    backgroundColor: "#2a2a2d",
    borderRadius: 15,
  },
});
