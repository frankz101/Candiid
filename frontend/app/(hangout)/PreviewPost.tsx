import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
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
import BaseScreen from "@/components/utils/BaseScreen";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import useStore from "@/store/useStore";

const { width: screenWidth } = Dimensions.get("window");
const postWidth = screenWidth;
const postHeight = (screenWidth * 5) / 4;

const PreviewPost = () => {
  const { user } = useUser();
  const { hangoutId, memoryId, photoIndexes } = useLocalSearchParams();
  const [caption, setCaption] = useState("");
  const [frameColor, setFrameColor] = useState("#FFF");
  const setPostDetails = useStore((state) => state.setPostDetails);
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

  const colors = ["#FFF", "#BA6B55", "#9E6480", "#74BCFF"];

  const renderItem = ({ item }: { item: string }) => (
    <Pressable
      onPress={() => setFrameColor(item)}
      style={[styles.colorButton, { backgroundColor: item }]}
    />
  );

  const handleNextPress = () => {
    setPostDetails({
      hangoutId: hangoutId as string,
      photos: selectedPhotos,
      caption: caption,
    });

    router.navigate({
      pathname: "/(hangout)/MemoriesScreen",
      params: {
        newPost: "true",
        frameColor: frameColor,
        hangoutId: hangoutId,
      },
    });
  };

  const polaroidWidth = screenWidth - wp(8); // Adjust this based on your padding

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

        <Text style={styles.headerText}>PreviewPost</Text>
        <Pressable onPress={handleNextPress}>
          <View style={{ width: 64 }}>
            <Text style={styles.nextButton}>Next</Text>
          </View>
        </Pressable>
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* <View style={[styles.polaroidFrame, { backgroundColor: frameColor }]}> */}
        <PostCarousel
          images={selectedPhotos}
          width={postWidth}
          height={postWidth}
        />
        {/* </View> */}
      </View>
      {/* <View
        style={{
          height: wp(12),
          marginTop: hp(2),
          alignSelf: "center",
        }}
      >
        <FlatList
          data={colors}
          renderItem={renderItem}
          keyExtractor={(item) => item}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          scrollEnabled={false}
        />
      </View> */}
      <View style={styles.captionContainer}>
        <TextInput
          placeholder="caption"
          placeholderTextColor="#3F3F3F"
          cursorColor="white"
          onChangeText={(input) => setCaption(input)}
          maxLength={90}
          value={caption}
          style={styles.captionInput}
        />
      </View>
    </BaseScreen>
  );
};

export default PreviewPost;

const styles = StyleSheet.create({
  headerText: {
    fontSize: 20,
    fontFamily: "inter",
    fontWeight: "700",
    color: "#FFF",
  },
  container: {
    flex: 1,
    // justifyContent: "center",
    // alignItems: "center",
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
  polaroidFrame: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: postWidth + wp(4),
    height: postWidth + hp(8),
    paddingBottom: hp(6),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  colorButton: {
    width: wp(12),
    height: wp(12),
    borderWidth: 3,
    borderColor: "#FFF",
    borderRadius: wp(20),
    marginHorizontal: 5,
  },
  captionContainer: {
    height: hp("10%"),
    borderRadius: 5,
    marginTop: hp(2),
    margin: hp(1),

    backgroundColor: "rgba(44, 44, 48, 0.50)",
  },
  captionInput: {
    padding: 10,
    fontFamily: "inter",
    fontSize: 24,
    fontWeight: "500",
    color: "#FFF",
  },
});
