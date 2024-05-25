import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import React from "react";
import CreateHangoutButton from "./CreateHangoutButton";
import FeedPost from "./FeedPost";

interface CompletedHangoutsProps {
  tempPosts: { postId: string; username: string; caption: string }[];
  refreshing: boolean;
  onRefresh: () => void;
}

const CompletedHangouts: React.FC<CompletedHangoutsProps> = ({
  tempPosts,
  refreshing,
  onRefresh,
}) => {
  return (
    <View>
      <FlatList
        data={tempPosts}
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
          return <FeedPost username={item.username} caption={item.caption} />;
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
