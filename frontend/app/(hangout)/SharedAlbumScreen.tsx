import {
  Dimensions,
  FlatList,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import PhotoSquare from "@/components/photo/PhotoSquare";
import BackButton from "@/components/utils/BackButton";
import { Feather, Ionicons } from "@expo/vector-icons";
import BaseScreen from "@/components/utils/BaseScreen";
import Animated from "react-native-reanimated";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import ImagePicker from "react-native-image-crop-picker";
import RNFetchBlob from "rn-fetch-blob";
import { useUser } from "@clerk/clerk-expo";

const screenHeight = Dimensions.get("window").height;
const headerHeight = 140;
const bottomPadding = 20;

const scrollViewHeight = screenHeight - headerHeight - bottomPadding;

const SharedAlbumScreen = () => {
  const { hangoutId, memoryId } = useLocalSearchParams();
  console.log(hangoutId);
  console.log("Memory ID Hangout: " + memoryId);
  const [selectedPhotos, setSelectedPhotos] = useState<number[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useUser();

  const fetchHangout = async () => {
    return axios
      .get(`${process.env.EXPO_PUBLIC_API_URL}/hangout/${hangoutId}`)
      .then((res) => res.data);
  };

  const { data: hangoutData, isPending } = useQuery({
    queryKey: ["hangoutPhotos", hangoutId],
    queryFn: fetchHangout,
  });

  if (isPending) {
    return <Text>LOADING...</Text>;
  }

  const handleImageSelect = async (index: number) => {
    setSelectedPhotos((currentSelected: any) => {
      if (currentSelected.includes(index)) {
        return currentSelected.filter((num: number) => num !== index);
      } else if (currentSelected.length < 10) {
        return [...currentSelected, index];
      }
      return currentSelected;
    });
  };

  interface Photo {
    fileUrl: string;
  }

  const renderPhoto = ({ item, index }: { item: Photo; index: number }) => (
    <PhotoSquare imageUrl={item.fileUrl} index={index} />
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({
      queryKey: ["hangoutPhotos", hangoutId],
    });
    setRefreshing(false);
  };

  const addPhotos = async () => {
    try {
      const images = await ImagePicker.openPicker({
        width: 300,
        height: 300,
        cropping: true,
        cropperCircleOverlay: true, // Optional: if you want a circular cropper
        multiple: true, // Enable multiple image selection
      });

      const uploadPromises = images.map(async (image) => {
        const { path: uri, filename } = image;

        let takenAt = new Date().toISOString(); // Default to current time if no EXIF data

        return RNFetchBlob.fetch(
          "POST",
          `${process.env.EXPO_PUBLIC_API_URL}/hangout/${hangoutId}/photo`,
          {
            "Content-Type": "multipart/form-data",
          },
          [
            {
              name: "file",
              filename: filename,
              type: "image/jpeg",
              data: RNFetchBlob.wrap(uri),
            },
            { name: "takenBy", data: user?.id },
            { name: "takenAt", data: takenAt },
          ]
        )
          .then((response) => {
            queryClient.invalidateQueries({
              queryKey: ["hangoutPhotos", hangoutId],
            });
            console.log(
              `${filename} has been successfully uploaded. Response: `,
              response
            );
          })
          .catch((error) => {
            console.error("Error uploading image:", error);
          });
      });

      // Execute all upload promises concurrently
      await Promise.all(uploadPromises);

      console.log("All images have been uploaded successfully.");
    } catch (error) {
      console.error("Error selecting images:", error);
    }
  };
  return (
    <BaseScreen>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: hp(2),
        }}
      >
        <BackButton />
        <Text style={styles.headerText}>{hangoutData.hangoutName}</Text>
        <Pressable onPress={addPhotos}>
          <Ionicons
            style={{ marginRight: wp(2) }}
            name="add-outline"
            size={32}
            color="white"
          />
        </Pressable>
      </View>
      <View style={{ flex: 1 }}>
        <FlatList
          data={hangoutData.sharedAlbum}
          renderItem={renderPhoto}
          keyExtractor={(item, index) => index.toString()}
          numColumns={3}
          contentContainerStyle={styles.scrollViewContainer}
          ListEmptyComponent={
            <View style={styles.emptyAlbumContainer}>
              <View style={styles.greyPost}>
                <Pressable
                  onPress={() => {
                    router.push({
                      pathname: "/(camera)/CameraScreen",
                      params: {
                        id: hangoutId,
                        hangoutName: hangoutData.hangoutName,
                      },
                    });
                  }}
                >
                  <Ionicons name="add" size={32} color="white" />
                </Pressable>
              </View>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#FFF"
            />
          }
        />
      </View>

      <Pressable
        onPress={() =>
          router.push({
            pathname: "/(camera)/CameraScreen",
            params: { id: hangoutId, hangoutName: hangoutData.hangoutName },
          })
        }
        style={{ position: "absolute", alignSelf: "center", bottom: 75 }}
      >
        <Ionicons name="camera" size={64} color="#FFF" />
      </Pressable>
    </BaseScreen>
  );
};

export default SharedAlbumScreen;

const styles = StyleSheet.create({
  headerText: {
    position: "absolute",
    left: wp(20),
    right: wp(20),
    paddingBottom: hp(2),
    textAlign: "center",
    fontSize: 20,
    fontFamily: "inter",
    fontWeight: "700",
    color: "#FFF",
  },

  emptyAlbumContainer: {
    flex: 1,
    // justifyContent: "center",
    // alignItems: "center",
  },
  greyPost: {
    width: 100,
    height: 100,
    backgroundColor: "grey",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },

  scrollViewContainer: {
    paddingBottom: 20,
  },
});
