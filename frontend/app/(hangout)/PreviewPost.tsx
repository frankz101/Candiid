import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const PreviewPost = () => {
  const { hangoutId, photoIndexes } = useLocalSearchParams();

  console.log(photoIndexes);
  const fetchHangout = async () => {
    return axios
      .get(`${process.env.EXPO_PUBLIC_API_URL}/hangout/${hangoutId}`)
      .then((res) => res.data);
  };

  const { data: hangoutData, isPending } = useQuery({
    queryKey: ["hangout"],
    queryFn: fetchHangout,
  });

  const photoIndexesArray =
    typeof photoIndexes === "string" ? photoIndexes.split(",") : photoIndexes;
  const parsedPhotoIndexes = photoIndexesArray.map((index) =>
    parseInt(index, 10)
  );

  const selectedPhotos = parsedPhotoIndexes.map(
    (index: number) => hangoutData.sharedAlbum[index]
  );

  return (
    <SafeAreaView>
      <Text>PreviewPost</Text>

      {selectedPhotos.length > 0 &&
        selectedPhotos.map((photo: any, index: number) => {
          return (
            photo && (
              <Image
                key={index}
                source={{ uri: photo.fileUrl }}
                style={{
                  width: "100%",
                  height: 200,
                  resizeMode: "contain",
                }}
              />
            )
          );
        })}
    </SafeAreaView>
  );
};

export default PreviewPost;

const styles = StyleSheet.create({});
