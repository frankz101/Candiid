import { Dimensions, StyleSheet, Text, View } from "react-native";
import React from "react";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import PostCarousel from "../photo/PostCarousel";
import { ImageData } from "../photo/PostCarousel";
const { width: screenWidth } = Dimensions.get("window");

interface FeedPostProps {
  username: string;
  profilePhoto: string;
  caption: string;
  photoUrls: ImageData[];
}

const FeedPost: React.FC<FeedPostProps> = ({
  username,
  profilePhoto,
  caption,
  photoUrls,
}) => {
  const polaroidWidth = screenWidth - wp(4);
  return (
    <View style={{ marginTop: hp(1), marginBottom: hp(2) }}>
      {/* Post Header*/}
      <View style={styles.itemContainer}>
        <View style={styles.postHeader}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              padding: wp(2),
            }}
          >
            <Image source={{ uri: profilePhoto }} style={styles.icon} />
            <Text style={styles.postHeaderTextStyle}>{username}</Text>
          </View>
          <View />
        </View>
      </View>

      {/* Post Content */}
      {/* <View style={styles.itemContainer}>
        <View style={styles.postContainer}></View>
      </View> */}
      <View style={styles.itemContainer}>
        <PostCarousel
          images={photoUrls}
          width={polaroidWidth}
          height={polaroidWidth}
        />
      </View>

      {/* Post Caption*/}
      <View style={styles.captionContainer}>
        <View style={styles.captionContent}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={styles.captionTextStyle}>{caption}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default FeedPost;

const styles = StyleSheet.create({
  postHeaderTextStyle: {
    color: "#FFF",
    fontFamily: "Inter",
    fontSize: 14,
    paddingLeft: 8,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#FFF",
  },
  captionTextStyle: {
    color: "#FFF",
    fontFamily: "Inter",
    fontSize: 16,
  },
  itemContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  postHeader: {
    width: wp("95"),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  postContainer: {
    width: wp("95"),
    aspectRatio: 1,
    backgroundColor: "blue",
    alignSelf: "center",
    borderRadius: 5,
  },
  captionContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: wp(2),
  },
  captionContent: {
    width: wp("95"),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
