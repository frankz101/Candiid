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
import PhotoSquareSelect from "@/components/photo/PhotoSquareSelect";

const screenHeight = Dimensions.get("window").height;
const headerHeight = 140;
const bottomPadding = 20;

const scrollViewHeight = screenHeight - headerHeight - bottomPadding;

const SelectPhotosScreen = () => {
  const { hangoutId } = useLocalSearchParams();
  console.log(hangoutId);
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
    />
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
        <View style={{ width: 64 }}>
          <BackButton />
        </View>

        <Text style={styles.headerText}>Select Photos</Text>
        {selectedPhotos?.length > 0 ? (
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
            <View style={{ width: 64 }}>
              <Text style={styles.nextButton}>Next</Text>
            </View>
          </Pressable>
        ) : (
          <View style={{ width: 64 }}>
            <Text style={styles.nextButtonDeactivated}>Next</Text>
          </View>
        )}
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
  nextButtonDeactivated: {
    fontSize: 18,
    fontFamily: "inter",
    fontWeight: "700",
    paddingRight: 20,
    color: "#636366",
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
