import { Pressable, StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import axios, { AxiosResponse } from "axios";
import { useUser } from "@clerk/clerk-expo";
import PhotoSquare from "@/components/photo/PhotoSquareSelect";
import PostCarousel from "@/components/photo/PostCarousel";
import BackButton from "@/components/utils/BackButton";
import { TextInput } from "react-native-gesture-handler";

const PreviewPost = () => {
  const { user } = useUser();
  const { hangoutId, memoryId, photoIndexes } = useLocalSearchParams();
  const [caption, setCaption] = useState("");
  console.log("Memory Id Preview Post: " + memoryId);
  const router = useRouter();

  const fetchHangout = async () => {
    return axios
      .get(`${process.env.EXPO_PUBLIC_API_URL}/hangout/${hangoutId}`)
      .then((res) => res.data);
  };

  const { data: hangoutData, isPending } = useQuery({
    queryKey: ["hangoutPhotos", hangoutId],
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
      caption: caption,
    };

    try {
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/posts`,
        postData
      );
      console.log(response.data);
      setCaption("");
      const postId = response.data.result;

      const updateData = {
        postId: postId,
      };
      await axios.put(
        `${process.env.EXPO_PUBLIC_API_URL}/memories/${memoryId}`,
        updateData
      );
      console.log("Hangout updated successfully");
      router.navigate("/(tabs)/profile");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: 28,
        }}
      >
        <BackButton />
        <Text style={{ fontSize: 24 }}>Preview Post</Text>
        <View style={{ width: 32 }} />
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <PostCarousel images={selectedPhotos} />
      </View>
      <View style={{ padding: 8, alignSelf: "center" }}>
        <TextInput
          placeholder="Caption"
          onChangeText={(input) => setCaption(input)}
          maxLength={90}
          value={caption}
        />
      </View>

      {/* {selectedPhotos.length > 0 &&
        selectedPhotos.map((photo: any, index: number) => {
          return photo && <PhotoSquare key={index} imageUrl={photo.fileUrl} />;
        })} */}
      <Pressable
        onPress={handlePost}
        style={{ position: "absolute", alignSelf: "center", bottom: 120 }}
      >
        <Text>Post Photo</Text>
      </Pressable>
    </SafeAreaView>
  );
};

export default PreviewPost;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: "center",
    // alignItems: "center",
  },
});
