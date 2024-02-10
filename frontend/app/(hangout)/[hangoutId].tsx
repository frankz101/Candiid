import { StyleSheet, Text, View, Image, Pressable } from "react-native";
import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";

const Hangout = () => {
  const { hangoutId } = useLocalSearchParams();
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
          <Image
            key={index}
            source={{ uri: photo.fileUrl }}
            style={{
              width: "100%",
              height: 200,
              resizeMode: "contain",
            }}
          />
        ))
      )}
    </SafeAreaView>
  );
};

export default Hangout;

const styles = StyleSheet.create({});
