import {
  StyleSheet,
  Text,
  View,
  Pressable,
  FlatList,
  ScrollView,
  Dimensions,
  RefreshControl,
} from "react-native";
import { Image } from "expo-image";
import React, { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { AntDesign, Feather, Ionicons } from "@expo/vector-icons";
import PhotoSquare from "@/components/photo/PhotoSquareSelect";
import BackButton from "@/components/utils/BackButton";
import SharedAlbumPreview from "@/components/hangoutDetail/SharedAlbumPreview";
import BaseScreen from "@/components/utils/BaseScreen";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import ParticipantsList from "@/components/hangoutDetail/ParticipantsList";

const participants = [
  {
    id: "1",
    name: "Alice",
    iconUrl: "https://via.placeholder.com/150/FF0000/FFFFFF?text=Alice",
  },
  {
    id: "2",
    name: "Bob",
    iconUrl: "https://via.placeholder.com/150/00FF00/FFFFFF?text=Bob",
  },
  {
    id: "3",
    name: "Charlie",
    iconUrl: "https://via.placeholder.com/150/0000FF/FFFFFF?text=Charlie",
  },
  {
    id: "4",
    name: "Diana",
    iconUrl: "https://via.placeholder.com/150/F0F000/FFFFFF?text=Diana",
  },
  {
    id: "5",
    name: "Edward",
    iconUrl: "https://via.placeholder.com/150/0F0F00/FFFFFF?text=Edward",
  },
  {
    id: "6",
    name: "Fiona",
    iconUrl: "https://via.placeholder.com/150/00F0F0/FFFFFF?text=Fiona",
  },
  {
    id: "7",
    name: "George",
    iconUrl: "https://via.placeholder.com/150/F000F0/FFFFFF?text=George",
  },
  {
    id: "8",
    name: "Hannah",
    iconUrl: "https://via.placeholder.com/150/FF00FF/FFFFFF?text=Hannah",
  },
  {
    id: "9",
    name: "Ian",
    iconUrl: "https://via.placeholder.com/150/FFFF00/FFFFFF?text=Ian",
  },
  {
    id: "10",
    name: "Jenny",
    iconUrl: "https://via.placeholder.com/150/000000/FFFFFF?text=Jenny",
  },
  {
    id: "11",
    name: "Kyle",
    iconUrl: "https://via.placeholder.com/150/FFFFFF/000000?text=Kyle",
  },
  {
    id: "12",
    name: "Laura",
    iconUrl: "https://via.placeholder.com/150/CCCCCC/000000?text=Laura",
  },
];

const screenHeight = Dimensions.get("window").height;
const headerHeight = 140;
const bottomPadding = 20;

const scrollViewHeight = screenHeight - headerHeight - bottomPadding;

const Hangout = () => {
  const { hangoutId, memoryId } = useLocalSearchParams();
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
    <PhotoSquare
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

  const latestPhotos = hangoutData.sharedAlbum?.slice(-6) || [];

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

      <View>
        <Text style={styles.sectionText}>All Photos</Text>
      </View>
      <View>
        <SharedAlbumPreview
          sharedAlbum={latestPhotos}
          hangoutId={hangoutId as string}
        />
      </View>
      <View>
        <Text style={styles.sectionTwoText}>Participants</Text>
      </View>
      <View>
        <ParticipantsList participants={participants} />
      </View>
    </BaseScreen>
  );
};

export default Hangout;

const styles = StyleSheet.create({
  headerText: {
    fontSize: 20,
    fontFamily: "inter",
    fontWeight: "700",
    color: "#FFF",
  },
  sectionText: {
    fontSize: 14,
    fontFamily: "inter",
    fontWeight: "700",
    padding: wp(2),
    color: "#FFF",
  },
  sectionTwoText: {
    fontSize: 14,
    fontFamily: "inter",
    fontWeight: "700",
    paddingVertical: wp(4),
    paddingHorizontal: wp(2),
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
