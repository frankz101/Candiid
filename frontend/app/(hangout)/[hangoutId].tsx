import { StyleSheet, Text, View, Pressable, FlatList } from "react-native";
import { Image } from "expo-image";
import React, { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import PhotoSquare from "@/components/photo/PhotoSquare";

const Hangout = () => {
  const { hangoutId, memoryId } = useLocalSearchParams();
  console.log("Memory Id Hangout: " + memoryId);
  const [selectedPhotos, setSelectedPhotos] = useState<number[]>([]);
  const router = useRouter();

  const fetchHangout = async () => {
    return axios
      .get(`${process.env.EXPO_PUBLIC_API_URL}/hangout/${hangoutId}`)
      .then((res) => res.data);
  };

  const { data: hangoutData, isPending } = useQuery({
    queryKey: ["hangout"],
    queryFn: fetchHangout,
  });

  if (isPending) {
    return <Text>LOADING...</Text>;
  }

  const isAlbumEmpty = hangoutData?.sharedAlbum?.length === 0;

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

  console.log(selectedPhotos);

  interface Photo {
    fileUrl: string;
  }

  const renderPhoto = ({ item, index }: { item: Photo; index: number }) => (
    <PhotoSquare
      imageUrl={item.fileUrl}
      onPhotoSelect={() => handleImageSelect(index)}
      isSelected={selectedPhotos.includes(index)}
    />
  );

  return (
    <SafeAreaView>
      <Text>{hangoutId}</Text>
      <Pressable
        onPress={() =>
          router.push({
            pathname: "/(camera)/CameraScreen",
            params: { id: hangoutId },
          })
        }
      >
        <Ionicons name="camera" size={64} />
      </Pressable>
      <View>
        {isAlbumEmpty ? (
          <Text>Empty Album</Text>
        ) : (
          <FlatList
            data={hangoutData.sharedAlbum}
            renderItem={renderPhoto}
            keyExtractor={(item, index) => index.toString()}
            numColumns={3}
            // style={{ backgroundColor: "grey" }}
            contentContainerStyle={{
              justifyContent: "center",
              flexGrow: 1,
            }}
          />
        )}
      </View>

      <Pressable
        onPress={() => {
          router.push({
            pathname: "/(hangout)/PreviewPost",
            params: {
              hangoutId: hangoutId,
              memoryId: memoryId,
              photoIndexes: selectedPhotos,
            },
          });
        }}
      >
        <Text>Preview Post</Text>
      </Pressable>
    </SafeAreaView>
  );
};

export default Hangout;

const styles = StyleSheet.create({
  gridContainer: {
    // flexDirection: "row",
    // flexWrap: "wrap",
    // justifyContent: "space-between", // This will ensure even spacing between the images
    // padding: 8, // Add padding around the whole grid
  },
});
