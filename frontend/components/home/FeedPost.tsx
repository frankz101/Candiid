import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import PostCarousel from "../photo/PostCarousel";
import { ImageData } from "../photo/PostCarousel";
import { Link, useRouter } from "expo-router";
const { width: screenWidth } = Dimensions.get("window");

interface FeedPostProps {
  userId: string;
  username: string;
  profilePhoto: string;
  caption: string;
  createdAt: any;
  photoUrls: ImageData[];
}

const FeedPost: React.FC<FeedPostProps> = ({
  userId,
  username,
  profilePhoto,
  caption,
  createdAt,
  photoUrls,
}) => {
  const postWidth = screenWidth - wp(17);
  const router = useRouter();

  const getTimeDifference = () => {
    const now = Date.now();
    const createdAtDate = new Date(
      createdAt.seconds * 1000 + createdAt.nanoseconds / 1000000
    );
    const differenceInMillis = now - createdAtDate.getTime();

    const differenceInMinutes = differenceInMillis / (1000 * 60);
    const differenceInHours = differenceInMillis / (1000 * 60 * 60);
    const differenceInDays = differenceInMillis / (1000 * 60 * 60 * 24);
    const differenceInWeeks = differenceInDays / 7;
    const differenceInMonths = differenceInDays / 30.44;
    const differenceInYears = differenceInDays / 365.25;

    if (Math.floor(differenceInYears) > 1) {
      return `${Math.floor(differenceInYears)} years ago`;
    } else if (Math.floor(differenceInYears) === 1) {
      return "1 year ago";
    } else if (Math.floor(differenceInMonths) > 1) {
      return `${Math.floor(differenceInMonths)} months ago`;
    } else if (Math.floor(differenceInMonths) === 1) {
      return "1 month ago";
    } else if (Math.floor(differenceInWeeks) > 1) {
      return `${Math.floor(differenceInWeeks)} weeks ago`;
    } else if (Math.floor(differenceInWeeks) === 1) {
      return "1 week ago";
    } else if (Math.floor(differenceInDays) > 1) {
      return `${Math.floor(differenceInDays)} days ago`;
    } else if (Math.floor(differenceInDays) === 1) {
      return "1 day ago";
    } else if (Math.floor(differenceInHours) > 1) {
      return `${Math.floor(differenceInHours)} hours ago`;
    } else if (Math.floor(differenceInHours) === 1) {
      return "1 hour ago";
    } else if (Math.floor(differenceInMinutes) > 1) {
      return `${Math.floor(differenceInMinutes)} minutes ago`;
    } else if (Math.floor(differenceInMinutes) === 1) {
      return "1 minute ago";
    } else {
      return "Just now";
    }
  };

  const time = getTimeDifference();

  return (
    <View style={{ marginTop: hp(1), marginBottom: hp(2) }}>
      {/* Post Header */}
      <View style={styles.postHeader}>
        <Image source={{ uri: profilePhoto }} style={styles.icon} />
        <View style={styles.headerContent}>
          <Link
            href={{
              pathname: "/(profile)/ProfileScreen",
              params: {
                userId: userId,
              },
            }}
            asChild
          >
            <Pressable
            // onPress={() =>
            //   router.push({
            //     pathname: "/(profile)/ProfileScreen",
            //     params: {
            //       userId: userId,
            //     },
            //   })
            // }
            >
              <Text style={styles.username}>{username}</Text>
              <Text style={styles.caption}>{`${caption} • ${time}`}</Text>
            </Pressable>
          </Link>

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
