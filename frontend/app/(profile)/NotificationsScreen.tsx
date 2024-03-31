import {
  Dimensions,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import BackButton from "@/components/utils/BackButton";
import { useUser } from "@clerk/clerk-expo";
import axios from "axios";
import UserBanner from "@/components/friends/UserBanner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import HangoutRequestBanner from "@/components/friends/HangoutRequestBanner";
import { useRouter } from "expo-router";

interface User {
  id: number;
  name: string;
  username: string;
  profilePhoto: {
    fileUrl: string;
  };
  userId: string;
  friendStatus: string;
}

const screenHeight = Dimensions.get("window").height;
const headerHeight = 120;
const bottomPadding = 20;

const scrollViewHeight = screenHeight - headerHeight - bottomPadding;

const NotificationsScreen = () => {
  const [friendRequests, setFriendRequests] = useState<User[]>([]);
  const [hangoutRequests, setHangoutRequests] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useUser();
  const router = useRouter();
  const queryClient = useQueryClient();
  const getFriendRequests = async () => {
    const res = await axios.get(
      `${process.env.EXPO_PUBLIC_API_URL}/friendRequest/get/${user?.id}`
    );
    setFriendRequests(res.data.result);
  };

  const updateFriendRequests = (userId: string) => {
    setFriendRequests((currentRequests) =>
      currentRequests?.filter((request: User) => request.userId !== userId)
    );
  };
  const updateHangoutRequests = (hangoutId: string, status: string) => {
    setHangoutRequests((currentRequests) =>
      currentRequests.filter((request: any) => request.hangoutId !== hangoutId)
    );
    console.log(status);
    if (status === "accept")
      router.push({
        pathname: "/(hangout)/MemoriesScreen",
        params: {
          newPost: "true",
          hangoutId: hangoutId,
        },
      });
  };

  useEffect(() => {
    getFriendRequests();
  }, []);

  const fetchHangoutRequests = async () => {
    return axios
      .get(
        `${process.env.EXPO_PUBLIC_API_URL}/hangout/requests/users/${user?.id}`
      )
      .then((res) => res.data);
  };

  const { data: hangoutRequestsData, isPending } = useQuery({
    queryKey: ["hangoutRequestsData", user?.id],
    queryFn: fetchHangoutRequests,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({
      queryKey: ["hangoutRequestsData", user?.id],
    });
    await getFriendRequests();
    setRefreshing(false);
  };

  useEffect(() => {
    if (hangoutRequestsData) {
      setHangoutRequests(hangoutRequestsData.result);
    }
  }, [hangoutRequestsData]);

  return (
    <SafeAreaView>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <BackButton />
        <Text style={{ fontSize: 24 }}>Notifications</Text>
        <View style={{ width: 32 }} />
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollViewContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {friendRequests?.map((contact: User) => (
          <UserBanner
            key={contact.userId}
            user={contact}
            type="friendRequests"
            onHandleRequest={() => updateFriendRequests(contact.userId)}
          />
        ))}
        {hangoutRequests?.map((item: any, index: number) => (
          <HangoutRequestBanner
            key={"Hangout Request" + index}
            hangoutId={item.hangoutId}
            hangoutName={item.hangoutName}
            onHandleRequest={(hangoutId: string, status: string) =>
              updateHangoutRequests(hangoutId, status)
            }
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default NotificationsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollViewContainer: {
    flexGrow: 1,
    height: scrollViewHeight,
  },
});
