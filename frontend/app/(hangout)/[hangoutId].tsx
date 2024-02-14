import { StyleSheet, Text, View, Pressable } from "react-native";
import { Image } from "expo-image";
import React, { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";

const Hangout = () => {
  const { hangoutId } = useLocalSearchParams();
  const [selectedPhotos, setSelectedPhotos] = useState([]);
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
      {isAlbumEmpty ? (
        <Text>Empty Album</Text>
      ) : (
        hangoutData?.sharedAlbum?.map((photo: any, index: number) => (
          <Pressable key={index} onPress={() => handleImageSelect(index)}>
            <Image
              source={{ uri: photo.fileUrl }}
              style={{
                width: "100%",
                height: 200,
                resizeMode: "contain",
              }}
            />
          </Pressable>
        ))
      )}
      <Pressable
        onPress={() => {
          router.push({
            pathname: "/(hangout)/PreviewPost",
            params: {
              hangoutId: hangoutId,
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

const styles = StyleSheet.create({});
