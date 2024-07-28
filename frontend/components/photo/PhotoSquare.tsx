import React, { useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
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
import {
  LongPressGestureHandler,
  TapGestureHandler,
  State,
} from "react-native-gesture-handler";

const screenWidth = Dimensions.get("window").width;
const padding = 2;
const imageWidth = (screenWidth - padding * 6) / 3; // Subtract total padding and divide by 3

interface PhotoSquareProps {
  imageUrl: string;
  takenBy: string;
  index: number;
  hangoutId: string;
}

const PhotoSquare: React.FC<PhotoSquareProps> = ({
  imageUrl,
  takenBy,
  hangoutId,
}) => {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [longPressModalVisible, setLongPressModalVisible] = useState(false);
  const [shortPressModalVisible, setShortPressModalVisible] = useState(false);
  const scaleValue = useRef(new Animated.Value(1)).current;

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

  const handleLongPress = ({ nativeEvent }: any) => {
    if (nativeEvent.state === State.BEGAN) {
      Animated.spring(scaleValue, {
        toValue: 1.08,
        friction: 3,
        useNativeDriver: true,
      }).start();
    } else if (nativeEvent.state === State.ACTIVE) {
      openModal(true);
    } else if (
      nativeEvent.state === State.END ||
      nativeEvent.state === State.CANCELLED
    ) {
      Animated.spring(scaleValue, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleTap = ({ nativeEvent }: any) => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
    if (nativeEvent.state === State.END) {
      openModal(false);
    }
  };

  return (
    <View style={styles.imageContainer}>
      <LongPressGestureHandler
        onHandlerStateChange={handleLongPress}
        minDurationMs={200}
      >
        <TapGestureHandler onHandlerStateChange={handleTap}>
          <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
            <Image
              source={{
                uri: imageUrl,
              }}
              style={styles.image}
            />

            {longPressModalVisible && (
              <Modal
                animationType="fade"
                transparent={true}
                visible={longPressModalVisible}
              >
                <Pressable style={styles.overlay} onPress={closeModal}>
                  <BlurView style={styles.modalContainer} intensity={20}>
                    <Image
                      source={{ uri: imageUrl }}
                      style={{
                        width: wp(80),
                        aspectRatio: 1,
                        borderRadius: 20,
                      }}
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
                  </BlurView>
                </Pressable>
              </Modal>
            )}

            {shortPressModalVisible && (
              <Modal
                animationType="fade"
                transparent={true}
                visible={shortPressModalVisible}
              >
                <Pressable
                  style={[styles.overlay, { backgroundColor: "black" }]}
                  onPress={closeModal}
                >
                  <Image
                    source={{
                      uri: imageUrl,
                    }}
                    style={styles.fullScreenContainer}
                    contentFit="contain"
                  />
                </Pressable>
              </Modal>
            )}
          </Animated.View>
        </TapGestureHandler>
      </LongPressGestureHandler>
    </View>
  );
};

export default PhotoSquare;

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
  magnifiedImage: {
    width: wp(80),
    height: hp(60),
    borderRadius: 20,
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
