import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import BackButton from "@/components/utils/BackButton";
import { useUser } from "@clerk/clerk-expo";
import axios from "axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import HangoutRequestBanner from "@/components/friends/HangoutRequestBanner";
import BaseScreen from "@/components/utils/BaseScreen";
import GroupRequestBanner from "@/components/groups/GroupRequestBanner";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import FriendRequestBanner from "@/components/friends/FriendRequestBanner";

interface User {
  userId: string;
  name: string;
  username: string;
  profilePhoto?: {
    fileUrl: string;
  };
  friends?: string[];
  phoneNumber: string;
  createdHangouts?: string[];
  upcomingHangouts?: string[];
}

const screenHeight = Dimensions.get("window").height;
const headerHeight = 120;
const bottomPadding = 20;

const scrollViewHeight = screenHeight - headerHeight - bottomPadding;

const NotificationsScreen = () => {
  const [sortedRequests, setSortedRequests] = useState<any>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useUser();
  const queryClient = useQueryClient();

  const fetchRequests = async (url: string) => {
    const res = await axios.get(url);
    return res.data;
  };

  const { data: friendRequestsData, isPending: isPendingFriendRequests } =
    useQuery({
      queryKey: ["friendRequestsData", user?.id],
      queryFn: () =>
        fetchRequests(
          `${process.env.EXPO_PUBLIC_API_URL}/friendRequest/get/${user?.id}`
        ),
    });

  const { data: hangoutRequestsData, isPending: isPendingHangoutRequests } =
    useQuery({
      queryKey: ["hangoutRequestsData", user?.id],
      queryFn: () =>
        fetchRequests(
          `${process.env.EXPO_PUBLIC_API_URL}/hangout/requests/users/${user?.id}`
        ),
    });

  const { data: groupRequestsData, isPending: isPendingGroupRequests } =
    useQuery({
      queryKey: ["groupRequestsData", user?.id],
      queryFn: () =>
        fetchRequests(
          `${process.env.EXPO_PUBLIC_API_URL}/group/requests/users/${user?.id}`
        ),
    });

  const { data: joinHangoutRequestsData, isPending: isPendingJoinRequests } =
    useQuery({
      queryKey: ["joinHangoutRequestsData", user?.id],
      queryFn: () =>
        fetchRequests(
          `${process.env.EXPO_PUBLIC_API_URL}/hangout/join-requests/${user?.id}`
        ),
    });

  const onRefresh = async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({
      queryKey: ["friendRequestsData", user?.id],
    });
    await queryClient.invalidateQueries({
      queryKey: ["hangoutRequestsData", user?.id],
    });
    await queryClient.invalidateQueries({
      queryKey: ["groupRequestsData", user?.id],
    });
    await queryClient.invalidateQueries({
      queryKey: ["joinHangoutRequestsData", user?.id],
    });
    setRefreshing(false);
  };

  useEffect(() => {
    if (
      friendRequestsData ||
      hangoutRequestsData ||
      groupRequestsData ||
      joinHangoutRequestsData
    ) {
      const combinedRequests = [
        ...(friendRequestsData?.map((request: any) => ({
          ...request,
          type: "friendRequest",
        })) || []),
        ...(hangoutRequestsData?.map((request: any) => ({
          ...request,
          type: "hangoutRequest",
        })) || []),
        ...(groupRequestsData?.map((request: any) => ({
          ...request,
          type: "groupRequest",
        })) || []),
        ...(joinHangoutRequestsData?.map((request: any) => ({
          ...request,
          type: "joinHangoutRequest",
        })) || []),
      ];

      combinedRequests.sort((a, b) => {
        console.log(a, b);
        const aTime =
          a.createdAt.seconds * 1000 + a.createdAt.nanoseconds / 1000000;
        const bTime =
          b.createdAt.seconds * 1000 + b.createdAt.nanoseconds / 1000000;
        return bTime - aTime;
      });

      setSortedRequests(combinedRequests);
    }
  }, [
    friendRequestsData,
    hangoutRequestsData,
    groupRequestsData,
    joinHangoutRequestsData,
  ]);

  const updateRequests = (type: string, filterId: string) => {
    switch (type) {
      case "friendRequest":
        return setSortedRequests((requests: any) =>
          requests.filter((request: any) => request.userId !== filterId)
        );
      case "hangoutRequest":
        const currentProfile = queryClient.getQueryData<User>([
          "profile",
          user?.id,
        ]);

        if (currentProfile && filterId) {
          const updatedUpcomingHangouts = [
            ...(currentProfile.upcomingHangouts || []),
            filterId,
          ];

          queryClient.setQueryData(["profile", user?.id], {
            ...currentProfile,
            upcomingHangouts: updatedUpcomingHangouts,
          });
        }
        queryClient.invalidateQueries({
          queryKey: ["upcomingHangouts", user?.id],
        });
        return setSortedRequests((requests: any) =>
          requests.filter((request: any) => request.hangoutId !== filterId)
        );
      case "joinHangoutRequest":
        return setSortedRequests((requests: any) =>
          requests.filter((request: any) => request.hangoutId !== filterId)
        );
      case "groupRequest":
        return setSortedRequests((requests: any) =>
          requests.filter((request: any) => request.groupId !== filterId)
        );
    }
  };

  if (
    isPendingHangoutRequests ||
    isPendingGroupRequests ||
    isPendingFriendRequests ||
    isPendingGroupRequests
  ) {
    return (
      <BaseScreen>
        <View style={styles.header}>
          <BackButton />
          <Text style={styles.headerText}>Notifications</Text>
          <View style={{ width: 32 }} />
        </View>
        <ActivityIndicator size="large" color="#FFF" />
      </BaseScreen>
    );
  }

  return (
    <BaseScreen>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerText}>Notifications</Text>
        <View style={{ width: 32 }} />
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollViewContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FFF"
          />
        }
      >
        {sortedRequests.map((request: any, index: any) => {
          switch (request.type) {
            case "friendRequest":
              return (
                <FriendRequestBanner
                  key={index}
                  user={request}
                  onHandleRequest={() =>
                    updateRequests("friendRequest", request.userId)
                  }
                />
              );
            case "hangoutRequest":
              return (
                <HangoutRequestBanner
                  key={`Hangout Request${index}`}
                  type="request"
                  hangout={request}
                  onHandleRequest={(hangoutId) =>
                    updateRequests("hangoutRequest", hangoutId)
                  }
                />
              );
            case "groupRequest":
              return (
                <GroupRequestBanner
                  key={`Group Request${index}`}
                  type="request"
                  senderName={request.userInfo.username}
                  senderId={request.userInfo.userId}
                  senderProfilePhoto={request.userInfo.profilePhoto?.fileUrl}
                  groupId={request.groupId}
                  groupName={request.groupName}
                  onHandleRequest={(groupId) =>
                    updateRequests("groupRequest", groupId)
                  }
                />
              );
            case "joinHangoutRequest":
              return (
                <HangoutRequestBanner
                  key={`Join Hangout Request${index}`}
                  type="join"
                  hangout={request}
                  onHandleRequest={(hangoutId) =>
                    updateRequests("joinHangoutRequest", hangoutId)
                  }
                />
              );
            default:
              return null;
          }
        })}
      </ScrollView>
    </BaseScreen>
  );
};

export default NotificationsScreen;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: hp(1),
  },
  headerText: {
    fontSize: 20,
    fontFamily: "inter",
    fontWeight: "700",
    color: "#FFF",
  },
  scrollViewContainer: {
    flexGrow: 1,
    height: scrollViewHeight,
  },
});
