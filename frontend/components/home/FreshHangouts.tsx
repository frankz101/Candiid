import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import React, { memo, useEffect } from "react";
import CreateHangoutButton from "./CreateHangoutButton";
import FeedPost from "./FeedPost";
import { useUser } from "@clerk/clerk-expo";
import axios from "axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import FreshCard from "./FreshCard";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

interface FreshHangoutsProps {
  refreshing?: boolean;
  onRefresh?: () => void;
}

interface UserProfile {
  result: {
    friends: string[];
    name: string;
    phoneNumber: string;
    profilePhoto: {
      fileUrl: string;
    };
    userId: string;
    username: string;
  };
}

const FreshHangouts: React.FC<FreshHangoutsProps> = ({
  refreshing,
  onRefresh,
}) => {
  const { user } = useUser();

  const fetchFreshHangouts = async () => {
    return axios
      .get(`${process.env.EXPO_PUBLIC_API_URL}/hangout/${user?.id}/fresh`)
      .then((res) => res.data.result);
  };

  const { data: freshHangouts, isPending } = useQuery({
    queryKey: ["freshHangouts", user?.id],
    queryFn: fetchFreshHangouts,
    enabled: !!user?.id,
  });

  if (isPending) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={freshHangouts}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={<CreateHangoutButton />}
        ListHeaderComponentStyle={styles.main}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={"#FFF"}
          />
        }
        renderItem={({ item }) => {
          return (
            <FreshCard
              name={item.hangoutName}
              description={item.hangoutDescription}
              hangoutId={item.id}
              participantIds={item.participantIds}
              askedToJoin={item.askedToJoin}
            />
          );
        }}
      />
    </View>
  );
};

export default FreshHangouts;

const styles = StyleSheet.create({
  container: { flex: 1 },
  main: {
    flexDirection: "row",
    justifyContent: "center",
  },
});
