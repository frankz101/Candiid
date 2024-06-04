import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import React from "react";
import CreateHangoutButton from "./CreateHangoutButton";
import FeedPost from "./FeedPost";
import axios from "axios";
import { useUser } from "@clerk/clerk-expo";
import { useQuery } from "@tanstack/react-query";

interface CompletedHangoutsProps {
  refreshing: boolean;
  onRefresh: () => void;
}

interface Photo {
  fileUrl: string;
  takenAt: string;
  takenBy: string;
}

const CompletedHangouts: React.FC<CompletedHangoutsProps> = ({
  refreshing,
  onRefresh,
}) => {
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

  if (!isPending) {
    console.log("Posts: " + posts);
  }
  return (
    <View>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.postId}
        ListHeaderComponent={<CreateHangoutButton />}
        ListHeaderComponentStyle={styles.main}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={"white"}
          />
        }
        renderItem={({ item }) => {
          const { username, profilePhoto } = item.userInfo;
          const photoUrls = item.photoUrls.map((photo: Photo) => ({
            fileUrl: photo.fileUrl,
          }));
          return (
            <FeedPost
              username={username}
              profilePhoto={profilePhoto.fileUrl}
              caption={item.caption}
              photoUrls={photoUrls}
            />
          );
        }}
      />
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
