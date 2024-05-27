import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React from "react";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";

// const screenWidth = Dimensions.get("window").width;
// const padding = 2;
// const imageWidth = (screenWidth - padding * 6) / 3; // Subtract total padding and divide by 3

const paddingBetweenImages = wp(2);
const imageWidth = (wp("95%") - paddingBetweenImages * 4) / 3;

interface Photo {
  fileUrl: string;
}

interface SharedAlbumPreviewProps {
  sharedAlbum: Photo[];
  hangoutId: string;
}

const SharedAlbumPreview: React.FC<SharedAlbumPreviewProps> = ({
  sharedAlbum,
  hangoutId,
}) => {
  const router = useRouter();

  const renderPhoto = ({ item, index }: { item: Photo; index: number }) => (
    <View style={styles.imageContainer}>
      <Image source={{ uri: item.fileUrl }} style={styles.image} />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={{ padding: wp(2) }} />
      <FlatList
        data={sharedAlbum}
        renderItem={renderPhoto}
        keyExtractor={(item, index) => index.toString()}
        numColumns={3}
        ListEmptyComponent={
          <View style={styles.emptyAlbumContainer}>
            <View style={styles.greyPost}>
              <Pressable
                onPress={() => {
                  router.push({
                    pathname: "/(camera)/CameraScreen",
                    params: { id: hangoutId },
                  });
                }}
              >
                <Ionicons name="add" size={32} color="white" />
              </Pressable>
            </View>
          </View>
        }
      />
      <Pressable
        onPress={() => {
          router.push({
            pathname: "/(hangout)/SharedAlbumScreen",
            params: { hangoutId: hangoutId },
          });
        }}
      >
        <Text style={styles.expandText}>See More</Text>
      </Pressable>
    </View>
  );
};

export default SharedAlbumPreview;

const styles = StyleSheet.create({
  container: {
    width: wp("95%"),
    alignSelf: "center",
    backgroundColor: "#202023",
    borderRadius: 5,
  },
  imageContainer: {
    width: imageWidth,
    height: imageWidth,
    marginLeft: paddingBetweenImages,
    marginVertical: paddingBetweenImages / 2,
  },
  image: {
    width: "100%",
    height: "100%",
    aspectRatio: 1,
  },
  expandText: {
    color: "#FFF",
    fontFamily: "inter",
    fontWeight: "700",
    textDecorationLine: "underline",
    fontSize: 12,
    padding: wp(2),
    alignSelf: "flex-end",
  },
  greyPost: {
    width: imageWidth,
    height: imageWidth,
    marginLeft: paddingBetweenImages,
    marginVertical: paddingBetweenImages / 2,
    backgroundColor: "grey",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
  },
  emptyAlbumContainer: {
    flex: 1,
    // justifyContent: "center",
    // alignItems: "center",
  },
});
