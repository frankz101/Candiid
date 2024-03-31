import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  Dimensions,
} from "react-native";
import React, { useEffect } from "react";
import { useRouter } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useUser } from "@clerk/clerk-expo";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import Carousel from "react-native-reanimated-carousel";

interface Photo {
  fileUrl: string;
  takenAt: string;
  takenBy: string;
}

const screenWidth = Dimensions.get("screen").width;

const Home = () => {
  const router = useRouter();
  const { user } = useUser();

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
    <SafeAreaView>
      <Text>Home</Text>
      <View>
        <Pressable onPress={() => router.push("/(hangout)/MemoriesScreen")}>
          <MaterialIcons name="photo" size={64} />
        </Pressable>
      </View>
      <View>
        <Pressable
          onPress={() => router.push("/(hangout)/CreateHangoutScreen")}
        >
          <Ionicons name="add-circle-outline" size={64} />
        </Pressable>
      </View>
      <FlatList
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
      />
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({
  image: {
    width: screenWidth,
    height: screenWidth,
  },
});
