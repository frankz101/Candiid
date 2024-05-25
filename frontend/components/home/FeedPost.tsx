import { StyleSheet, Text, View } from "react-native";
import React from "react";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Ionicons } from "@expo/vector-icons";

interface FeedPostProps {
  username: string;
  caption: string;
}

const FeedPost: React.FC<FeedPostProps> = ({ username, caption }) => {
  return (
    <View style={{ marginBottom: hp(4) }}>
      {/* Post Header*/}
      <View style={styles.itemContainer}>
        <View style={styles.postHeader}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              padding: 8,
            }}
          >
            <Ionicons name="person-circle-outline" size={40} color="white" />
            <Text style={styles.postHeaderTextStyle}>{username}</Text>
          </View>
          <View />
        </View>
      </View>

      {/* Post Content */}
      <View style={styles.itemContainer}>
        <View style={styles.postContainer}></View>
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
  },
  captionContent: {
    width: wp("95"),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
