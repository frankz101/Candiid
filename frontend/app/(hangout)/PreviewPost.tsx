import { Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import axios, { AxiosResponse } from "axios";
import { useUser } from "@clerk/clerk-expo";
import PhotoSquare from "@/components/photo/PhotoSquare";
import PostCarousel from "@/components/photo/PostCarousel";

const PreviewPost = () => {
  const { user } = useUser();
  const { hangoutId, memoryId, photoIndexes } = useLocalSearchParams();
  console.log("Memory Id Preview Post: " + memoryId);
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

    try {
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/posts`,
        postData
      );
      console.log(response.data);
      const postId = response.data.result;

      const updateData = {
        postId: postId,
      };
      await axios.put(
        `${process.env.EXPO_PUBLIC_API_URL}/memories/${memoryId}`,
        updateData
      );
      console.log("Hangout updated successfully");

      router.push("/(tabs)/profile");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text>PreviewPost</Text>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <PostCarousel images={selectedPhotos} />
      </View>

      {/* {selectedPhotos.length > 0 &&
        selectedPhotos.map((photo: any, index: number) => {
          return photo && <PhotoSquare key={index} imageUrl={photo.fileUrl} />;
        })} */}
      <Pressable onPress={handlePost}>
        <Text>Post Photo</Text>
      </Pressable>
    </SafeAreaView>
  );
};

export default PreviewPost;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    // alignItems: "center",
  },
});
