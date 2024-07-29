import {
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useState } from "react";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const screenWidth = Dimensions.get("window").width;
const padding = 2;
const imageWidth = (screenWidth - padding * 6) / 3; // Subtract total padding and divide by 3

interface PhotoSquareSelectProps {
  imageUrl: string;
  onPhotoSelect: (isSelected: boolean) => void;
  isSelected: boolean;
  index: number;
}

const PhotoSquareSelect: React.FC<PhotoSquareSelectProps> = ({
  imageUrl,
  onPhotoSelect,
  isSelected,
}) => {
  const router = useRouter();
  const handlePhotoPress = () => {
    onPhotoSelect(!isSelected);
  };
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.imageContainer}>
      <Pressable
        onPress={() => {
          setModalVisible(true);
        }}
      >
        <Image source={{ uri: imageUrl }} style={styles.image} />
      </Pressable>
      <Modal animationType="fade" transparent={true} visible={modalVisible}>
        <Pressable
          style={styles.overlay}
          onPress={() => setModalVisible(false)}
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

      <Pressable style={styles.icon} onPress={handlePhotoPress}>
        {isSelected ? (
          <Ionicons name="checkmark-circle-outline" size={28} color="green" />
        ) : (
          <Ionicons
            name="add-circle"
            size={28}
            color="rgba(100, 100, 100, 0.6)"
          />
        )}
      </Pressable>
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
  icon: {
    position: "absolute",
    top: 2,
    right: 2,
  },
  overlay: {
    flex: 1,
    backgroundColor: "black",
  },
  fullScreenContainer: {
    flex: 1,
    width: wp(100),
    height: hp(100),
    justifyContent: "center",
  },
});
