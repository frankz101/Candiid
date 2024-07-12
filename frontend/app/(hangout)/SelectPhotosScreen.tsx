import {
  Alert,
  Dimensions,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import BackButton from "@/components/utils/BackButton";
import BaseScreen from "@/components/utils/BaseScreen";
import PhotoSquareSelect from "@/components/photo/PhotoSquareSelect";
import * as MediaLibrary from "expo-media-library";

const screenHeight = Dimensions.get("window").height;
const headerHeight = 140;
const bottomPadding = 20;

const scrollViewHeight = screenHeight - headerHeight - bottomPadding;

interface Photo {
  fileUrl: string;
  takenBy: string;
  takenAt: string;
}

const SelectPhotosScreen = () => {
  const { hangoutId } = useLocalSearchParams();
  const [selectedPhotos, setSelectedPhotos] = useState<number[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

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
    <PhotoSquareSelect
      imageUrl={item.fileUrl}
      onPhotoSelect={() => handleImageSelect(index)}
      isSelected={selectedPhotos.includes(index)}
      index={index}
    />
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({
      queryKey: ["hangoutPhotos", hangoutId],
    });
    setRefreshing(false);
  };

  const savePhotos = async (indices: number[]) => {
    const album = hangoutData.sharedAlbum;

    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") {
      alert("Sorry, we need camera roll permissions to make this work!");
      return;
    }

    let photosToSave: string[] = [];

    if (indices.length === 0) {
      photosToSave = album.map((photo: Photo) => photo.fileUrl);
    } else {
      photosToSave = indices.map((index) => album[index].fileUrl);
    }

    try {
      await Promise.all(
        photosToSave.map((fileUrl) => MediaLibrary.saveToLibraryAsync(fileUrl))
      );
    } catch (error) {
      console.error("Error saving photos to library:", error);
      alert("An error occurred while saving photos.");
    }
  };

  const onNext = () => {
    Alert.alert(
      "Would you like to save your photos?",
      "Choose to save:",
      [
        {
          text: "All photos",
          style: "default",
          onPress: async () => {
            savePhotos([]);
            router.push({
              pathname: "/(hangout)/PreviewPost",
              params: {
                hangoutId: hangoutId,
                photoIndexes: selectedPhotos,
              },
            });
          },
        },
        {
          text: "Selected photos",
          style: "default",
          onPress: async () => {
            savePhotos(selectedPhotos);
            router.push({
              pathname: "/(hangout)/PreviewPost",
              params: {
                hangoutId: hangoutId,
                photoIndexes: selectedPhotos,
              },
            });
          },
        },
        {
          text: "None",
          style: "default",
          onPress: async () => {
            router.push({
              pathname: "/(hangout)/PreviewPost",
              params: {
                hangoutId: hangoutId,
                photoIndexes: selectedPhotos,
              },
            });
          },
        },
        {
          text: "Cancel",
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <BaseScreen>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: 28,
        }}
      >
        <View style={{ width: 64 }}>
          <BackButton />
        </View>

        <Text style={styles.headerText}>Select Photos</Text>

        <Pressable onPress={onNext} disabled={!(selectedPhotos?.length > 0)}>
          <View style={{ width: 64 }}>
            <Text
              style={[
                styles.nextButton,
                { color: selectedPhotos?.length > 0 ? "#0A84FF" : "#636366" },
              ]}
            >
              Next
            </Text>
          </View>
        </Pressable>
      </View>

      <FlatList
        data={hangoutData.sharedAlbum}
        renderItem={renderPhoto}
        keyExtractor={(item, index) => index.toString()}
        numColumns={3}
        contentContainerStyle={styles.scrollViewContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FFF"
          />
        }
      />
    </BaseScreen>
  );
};

export default SelectPhotosScreen;

const styles = StyleSheet.create({
  headerText: {
    fontSize: 20,
    fontFamily: "inter",
    fontWeight: "700",
    color: "#FFF",
  },
  nextButton: {
    fontSize: 18,
    fontFamily: "inter",
    fontWeight: "700",
    paddingRight: 20,
    color: "#0A84FF",
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
    flexGrow: 1,
    height: scrollViewHeight,
  },
});
