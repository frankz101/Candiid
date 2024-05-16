import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  Dimensions,
  ScrollView,
} from "react-native";
import React, { useEffect } from "react";
import { useRouter } from "expo-router";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useUser } from "@clerk/clerk-expo";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import Carousel from "react-native-reanimated-carousel";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import BaseScreen from "@/components/utils/BaseScreen";

interface Photo {
  fileUrl: string;
  takenAt: string;
  takenBy: string;
}

const screenWidth = Dimensions.get("screen").width;

const Home = () => {
  const router = useRouter();
  const { user } = useUser();
  const { expoPushToken, notification } = usePushNotifications();
  const data = JSON.stringify(notification, undefined, 2);
  console.log(expoPushToken?.data ?? "");

  const fetchFriendsPosts = async () => {
    return axios
      .get(`${process.env.EXPO_PUBLIC_API_URL}/user/${user?.id}/feed`)
      .then((res) => res.data.result);
  };

  const { data: posts, isPending } = useQuery({
    queryKey: ["postsData", user?.id],
    queryFn: fetchFriendsPosts,
  });

  return (
    <BaseScreen>
      {/* Header */}
      <View style={styles.header}>
        <Text
          style={{
            fontSize: 40,
            color: "#FFF",
            fontFamily: "Inter",
            fontStyle: "italic",
            fontWeight: "700",
          }}
        >
          candiid
        </Text>
        <Pressable style={{ alignSelf: "flex-start" }}>
          <Feather name="bell" size={32} color="#84848B" />
        </Pressable>
      </View>

      {/* TabBar */}
      <View style={styles.tabBar}>
        <Pressable>
          <Text style={styles.tabTextStyle}>Completed Hangouts</Text>
        </Pressable>
        <Pressable>
          <Text style={styles.tabTextStyle}>Fresh Hangouts</Text>
        </Pressable>
      </View>
      <View style={styles.tabUnderline}>
        <View style={styles.underline} />
        <View style={styles.underline} />
      </View>

      {/* Main */}
      <View style={styles.main}>
        <View style={styles.createHangoutButton}>
          <Pressable>
            <View style={{ alignItems: "center" }}>
              <Ionicons name="add-circle-outline" size={36} color="#AEAEB4" />
              <Text style={{ color: "#9B9BA1" }}>Create a hangout</Text>
            </View>
          </Pressable>
        </View>
      </View>

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
            <Text style={styles.postHeaderTextStyle}>franklinzhu26</Text>
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
            <Text style={styles.captionTextStyle}>
              Going to the beach with friends
            </Text>
          </View>
        </View>
      </View>

      {/* <FlatList
        data={posts}
        keyExtractor={(item) => item.hangoutId}
        contentContainerStyle={{ paddingBottom: screenWidth / 2 }}
        renderItem={({ item }) => {
          return (
            <View style={{ flex: 1 }}>
              <Text>{item.userId}</Text>
              <Text>{item.caption}</Text>
              <Carousel
                data={item.photoUrls}
                loop={false}
                width={screenWidth}
                height={screenWidth + 20}
                renderItem={({ item }: { item: Photo }) => (
                  <View key={item.fileUrl}>
                    <Image
                      style={styles.image}
                      source={{ uri: item.fileUrl }}
                    />
                    <Text>{item.takenAt}</Text>
                  </View>
                )}
              />
            </View>
          );
        }}
      /> */}
    </BaseScreen>
  );
};

export default Home;

const styles = StyleSheet.create({
  header: {
    height: hp("5%"),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: wp(4),
    marginVertical: hp(1),
  },
  tabBar: {
    height: hp("2%"),
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  tabTextStyle: {
    color: "#FFF",
    fontFamily: "Inter",
    fontSize: 14,
  },
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
  tabUnderline: {
    // width: wp("45%"),
    flexDirection: "row",
    justifyContent: "center",
  },
  main: {
    flexDirection: "row",
    justifyContent: "center",
  },
  createHangoutButton: {
    width: wp("95%"),
    aspectRatio: 4.5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#282828",
    backgroundColor: "rgba(44, 44, 48, 0.5)",
    marginTop: hp(2),
    justifyContent: "center",
    alignItems: "center",
  },
  createButtonContent: {
    color: "grey",
  },
  image: {
    width: screenWidth,
    height: screenWidth,
  },
  underline: {
    width: wp("47.5%"),
    height: 3,
    backgroundColor: "#FFF",
    marginTop: 2,
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
