import { StyleSheet, Text, View, Pressable, FlatList } from "react-native";
import { Image } from "expo-image";
import React, { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { AntDesign, Feather, Ionicons } from "@expo/vector-icons";
import PhotoSquare from "@/components/photo/PhotoSquare";
import BackButton from "@/components/utils/BackButton";

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
    queryKey: ["hangout", hangoutId],
    queryFn: fetchHangout,
  });

  if (isPending) {
    return <Text>LOADING...</Text>;
  }
  const isAlbumEmpty =
    !hangoutData?.sharedAlbum || hangoutData?.sharedAlbum?.length === 0;

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
  console.log(isAlbumEmpty);
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: 28,
        }}
      >
        <BackButton />
        <Text style={{ fontSize: 24 }}>{hangoutData.hangoutName}</Text>
        <View style={{ width: 32 }} />
      </View>

      <View>
        {isAlbumEmpty ? (
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

      {selectedPhotos?.length > 0 && (
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
          style={{ position: "absolute", right: 20, bottom: 75 }}
        >
          <Feather name="arrow-right-circle" size={64} />
        </Pressable>
      )}
      <Pressable
        onPress={() =>
          router.push({
            pathname: "/(camera)/CameraScreen",
            params: { id: hangoutId },
          })
        }
        style={{ position: "absolute", alignSelf: "center", bottom: 75 }}
      >
        <Ionicons name="camera" size={64} />
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
});
