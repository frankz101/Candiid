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
    <PhotoSquare imageUrl={item.fileUrl} />
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({
      queryKey: ["hangoutPhotos", hangoutId],
    });
    setRefreshing(false);
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
        <BackButton />
        <Text style={styles.headerText}>{hangoutData.hangoutName}</Text>
        <View style={{ width: 32 }} />
      </View>

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
                    params: { id: hangoutId },
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

      <Pressable
        onPress={() =>
          router.push({
            pathname: "/(camera)/CameraScreen",
            params: { id: hangoutId },
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
    flexGrow: 1,
    height: scrollViewHeight,
  },
});
