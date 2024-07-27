import {
  Alert,
  Animated,
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";
import React, { useRef, useState } from "react";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import axios from "axios";
import { useUser } from "@clerk/clerk-expo";
import { useQueryClient } from "@tanstack/react-query";
import { BlurView } from "expo-blur";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import * as Haptics from "expo-haptics";
import * as MediaLibrary from "expo-media-library";

const screenWidth = Dimensions.get("window").width;
const padding = 2;
const imageWidth = (screenWidth - padding * 6) / 3; // Subtract total padding and divide by 3

interface PhotoSquareSelectProps {
  imageUrl: string;
  takenBy: string;
  index: number;
  hangoutId: string;
}

const PhotoSquareSelect: React.FC<PhotoSquareSelectProps> = ({
  imageUrl,
  takenBy,
  index,
  hangoutId,
}) => {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [longPressModalVisible, setLongPressModalVisible] = useState(false);
  const [shortPressModalVisible, setShortPressModalVisible] = useState(false);
  const scaleValue = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressRef = useRef(false);
  const LONG_PRESS_DURATION = 300;

  const savePhoto = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") {
      alert("Sorry, we need camera roll permissions to make this work!");
      return;
    }
    closeModal();
    try {
      await MediaLibrary.saveToLibraryAsync(imageUrl);
      console.log("saved photo");
    } catch (error) {
      console.error("Error saving photos to library:", error);
      alert("An error occurred while saving photos.");
    }
  };

  const deletePhoto = () => {
    try {
      if (user) {
        Alert.alert(
          "Are you sure you want to delete this photo?",
          "This action is irreversible",
          [
            {
              text: "No",
              style: "cancel",
            },
            {
              text: "Yes",
              style: "destructive",
              onPress: async () => {
                try {
                  await axios.put(
                    `${
                      process.env.EXPO_PUBLIC_API_URL
                    }/hangout/photo/${encodeURIComponent(imageUrl)}`,
                    {
                      hangoutId,
                    }
                  );
                  queryClient.invalidateQueries({
                    queryKey: ["hangoutPhotos", hangoutId],
                  });
                } catch (err) {
                  console.error(err);
                }
              },
            },
          ],
          { cancelable: true }
        );
      }
    } catch (err) {
      console.error("Error blocking user: ", err);
    }
  };

  const openModal = (isLongPress: boolean) => {
    isLongPressRef.current = isLongPress;
    isLongPress && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isLongPress) {
      setLongPressModalVisible(true);
    } else {
      setShortPressModalVisible(true);
    }
  };

  const closeModal = () => {
    if (longPressModalVisible) {
      setLongPressModalVisible(false);
    } else if (shortPressModalVisible) {
      setShortPressModalVisible(false);
    }
  };

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 1.08,
      friction: 3,
      useNativeDriver: true,
    }).start();

    isLongPressRef.current = false;

    timerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      openModal(true);
    }, LONG_PRESS_DURATION);
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1, // Scale back to 1
      friction: 3,
      useNativeDriver: true,
    }).start();

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    } else {
      return;
    }

    if (!isLongPressRef.current) {
      openModal(false);
    }
  };

  return (
    <View style={styles.imageContainer}>
      <Link
        href={{
          pathname: "/(hangout)/FullScreenImage",
          params: { imageUrl, index },
        }}
        asChild
      >
        <View>
          <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut}>
            <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
              <Image
                source={{
                  uri: imageUrl,
                }}
                style={styles.image}
              />
            </Animated.View>
          </Pressable>

          {isLongPressRef.current ? (
            <Modal
              animationType="fade"
              transparent={true}
              visible={longPressModalVisible}
            >
              <Pressable style={styles.overlay} onPress={closeModal}>
                <BlurView style={styles.modalContainer} intensity={20}>
                  <View style={styles.modalContent}>
                    <Image
                      source={{
                        uri: imageUrl,
                      }}
                      style={styles.magnifiedImage}
                    />
                    <View style={styles.buttonContainer}>
                      <Pressable
                        style={[
                          styles.button,
                          takenBy === user?.id && {
                            borderBottomWidth: 1,
                            borderBottomColor: "#3a3a3d",
                          },
                        ]}
                        onPress={savePhoto}
                      >
                        <Text
                          style={[
                            styles.buttonText,
                            {
                              color: "white",
                            },
                          ]}
                        >
                          Save
                        </Text>
                        <Ionicons
                          name="download-outline"
                          size={24}
                          color={"white"}
                        />
                      </Pressable>
                      {takenBy === user?.id && (
                        <Pressable style={styles.button} onPress={deletePhoto}>
                          <Text style={[styles.buttonText, { color: "red" }]}>
                            Delete
                          </Text>
                          <Ionicons
                            name="trash-outline"
                            size={24}
                            color={"red"}
                          />
                        </Pressable>
                      )}
                    </View>
                  </View>
                </BlurView>
              </Pressable>
            </Modal>
          ) : (
            <Modal
              animationType="fade"
              transparent={true}
              visible={shortPressModalVisible}
            >
              <Pressable
                style={[styles.overlay, { backgroundColor: "black" }]}
                onPress={closeModal}
              >
                <View style={styles.fullScreenContainer}>
                  <Image
                    source={{
                      uri: imageUrl,
                    }}
                    style={{
                      width: "100%",
                      aspectRatio: 1,
                    }}
                  />
                </View>
              </Pressable>
            </Modal>
          )}
        </View>
      </Link>
    </View>
  );
};

export default PhotoSquareSelect;

const styles = StyleSheet.create({
  imageContainer: {
    width: imageWidth,
    height: imageWidth,
    margin: padding,
  },
  image: {
    width: "100%",
    height: "100%",
    aspectRatio: 1,
  },
  overlay: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: wp(80),
    borderRadius: 10,
    alignItems: "center",
  },
  magnifiedImage: {
    width: "100%",
    maxHeight: hp(80),
    aspectRatio: 1,
    borderRadius: 10,
  },
  buttonContainer: {
    marginTop: hp(2),
    backgroundColor: "#2a2a2d",
    width: wp(50),
    borderRadius: 15,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp(5),
    paddingVertical: hp(1),
  },
  buttonText: {
    fontSize: 16,
  },
  fullScreenContainer: {
    flex: 1,
    width: wp(100),
    height: hp(100),
    justifyContent: "center",
  },
});
