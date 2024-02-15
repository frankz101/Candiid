import { Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import axios, { AxiosResponse } from "axios";
import { useUser } from "@clerk/clerk-expo";
import PhotoSquare from "@/components/photo/PhotoSquare";

const PreviewPost = () => {
  const { user } = useUser();
  const { hangoutId, photoIndexes } = useLocalSearchParams();
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

  const photoIndexesArray =
    typeof photoIndexes === "string" ? photoIndexes.split(",") : photoIndexes;
  const parsedPhotoIndexes = photoIndexesArray.map((index) =>
    parseInt(index, 10)
  );

  const selectedPhotos = parsedPhotoIndexes.map(
    (index: number) => hangoutData.sharedAlbum[index]
  );

  const handlePost = async () => {
    const postData = {
      userId: user?.id,
      hangoutId: hangoutId,
      photoUrls: selectedPhotos,
    };

    axios
      .post(`${process.env.EXPO_PUBLIC_API_URL}/posts`, postData)
      .then((response: AxiosResponse<any>) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.error(error);
      });

    router.push("/(tabs)/profile");
  };

  return (
    <SafeAreaView>
      <Text>PreviewPost</Text>

      {selectedPhotos.length > 0 &&
        selectedPhotos.map((photo: any, index: number) => {
          return photo && <PhotoSquare key={index} imageUrl={photo.fileUrl} />;
        })}
      <Pressable onPress={handlePost}>
        <Text>Post Photo</Text>
      </Pressable>
    </SafeAreaView>
  );
};

export default PreviewPost;

const styles = StyleSheet.create({});
