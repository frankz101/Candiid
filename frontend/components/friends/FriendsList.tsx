import { useUser } from "@clerk/clerk-expo";
import { FlatList, ListRenderItem, Text, View } from "react-native";
import UserBanner from "@/components/friends/UserBanner";
import axios from "axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import BaseScreen from "../utils/BaseScreen";
import { useEffect, useState } from "react";

interface User {
  userId: string;
  name: string;
  username: string;
  profilePhoto: {
    fileUrl: string;
  };
  friendStatus?: string;
}

const FriendsList = () => {
  const { user } = useUser();
  const [friendsData, setFriendsData] = useState<User[]>([]);

  const fetchFriends = async (): Promise<User[]> => {
    const response = await axios.get(
      `${process.env.EXPO_PUBLIC_API_URL}/user/${user?.id}/friends`
    );
    return response.data;
  };

  const {
    data,
    isLoading,
    isError,
    isSuccess,
    error: queryError,
  } = useQuery<User[], Error>({
    queryKey: ["friendsData", user?.id],
    queryFn: fetchFriends,
  });

  const removeFriend = async (friendId: string) => {
    try {
      await axios.put(
        `${process.env.EXPO_PUBLIC_API_URL}/friends/remove/users/${user?.id}`,
        {
          receiverId: friendId,
        }
      );
      console.log("Removing friend");
      setFriendsData((prevFriends) =>
        prevFriends.filter((friend) => friend.userId !== friendId)
      );
    } catch (error) {
      console.error("Error removing friend:", error);
    }
  };

  useEffect(() => {
    if (data) {
      setFriendsData(data);
    }
  }, [data]);

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  if (isError) {
    return <Text>{"Error loading friends."}</Text>;
  }

  if (friendsData.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "white", alignSelf: "center" }}>
          You haven't added any friends yet!
        </Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: User }) => {
    return (
      <UserBanner
        key={item.userId}
        user={item}
        type="friends"
        onHandleRequest={removeFriend}
      />
    );
  };

  return (
    <View>
      <FlatList
        style={{ height: "100%" }}
        data={friendsData}
        renderItem={renderItem}
        keyExtractor={(item) => item.userId}
      />
    </View>
  );
};

export default FriendsList;
