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
  const postWidth = screenWidth - wp(17);
  return (
    <View style={{ marginTop: hp(1), marginBottom: hp(2) }}>
      {/* Post Header */}
      <View style={styles.postHeader}>
        <Image source={{ uri: profilePhoto }} style={styles.icon} />
        <View style={styles.headerContent}>
          <Text style={styles.username}>{username}</Text>
          <Text style={styles.caption}>{caption}</Text>
          <PostCarousel
            images={photoUrls}
            width={postWidth}
            height={postWidth}
          />
          {/* <Text style={styles.caption}>{caption}</Text> */}
        </View>
      </View>
    </View>
  );
};

export default FeedPost;

const styles = StyleSheet.create({
  postHeader: {
    flexDirection: "row",
    paddingHorizontal: wp(2),
    alignItems: "center",
  },
  icon: {
    width: wp(10),
    height: wp(10),
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#FFF",
    marginRight: wp(2),
    alignSelf: "flex-start",
  },
  headerContent: {
    flex: 1,
  },
  username: {
    color: "#FFF",
    fontFamily: "Inter",
    fontSize: 16,
    fontWeight: "bold",
    paddingBottom: hp(0.5),
  },
  caption: {
    color: "#FFF",
    fontFamily: "Inter",
    fontSize: 14,
    paddingBottom: hp(1),
  },
});
