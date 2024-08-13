import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useState } from "react";
import CreateHangoutButton from "./CreateHangoutButton";
import FeedPost from "./FeedPost";
import axios from "axios";
import { useUser } from "@clerk/clerk-expo";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Groups from "../groups/Groups";

interface Photo {
  fileUrl: string;
  takenAt: string;
  takenBy: string;
}

const CompletedHangouts = () => {
  const { user } = useUser();
  const [refreshing, setRefreshing] = useState(false);
  const queryClient = useQueryClient();

  const fetchFriendsPosts = async () => {
    return axios
      .get(`${process.env.EXPO_PUBLIC_API_URL}/user/${user?.id}/feed`)
      .then((res) => res.data);
  };

  const { data: posts, isPending } = useQuery({
    queryKey: ["postsData", user?.id],
    queryFn: fetchFriendsPosts,
    staleTime: 1000 * 60 * 5,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({
      queryKey: ["postsData", user?.id],
    });
    setRefreshing(false);
  };

  if (isPending) {
    return <ActivityIndicator size="large" color="#FFF" />;
  }

  return (
    <View style={{ flex: 1 }}>
      {posts?.length > 0 ? (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          style={{ height: "100%" }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={"#FFF"}
            />
          }
          renderItem={({ item }) => {
            const { username, profilePhoto } = item.userInfo;
            const photoUrls = item.photoUrls.map((photo: Photo) => ({
              fileUrl: photo.fileUrl,
            }));
            return (
              <FeedPost
                userId={item.userId}
                username={username}
                profilePhoto={profilePhoto?.fileUrl}
                caption={item.caption}
                photoUrls={photoUrls}
                createdAt={item.createdAt}
              />
            );
          }}
        />
      ) : (
        <View
          style={{
            height: "90%",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "white", fontSize: 15 }}>No posts yet!</Text>
        </View>
      )}
    </View>
  );
};

export default CompletedHangouts;

const styles = StyleSheet.create({
  main: {
    flexDirection: "row",
    justifyContent: "center",
  },
});
