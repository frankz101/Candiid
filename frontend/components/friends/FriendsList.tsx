import { useUser } from "@clerk/clerk-expo";
import { FlatList, ListRenderItem, Text, View } from "react-native";
import UserBanner from "@/components/friends/UserBanner";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import BaseScreen from "../utils/BaseScreen";

interface User {
  userId: string;
  name: string;
  username: string;
  profilePhoto: {
    fileUrl: string;
  };
  friendStatus: string;
}

const FriendsList = () => {
  const { user } = useUser();
  const fetchFriends = async () => {
    return axios
      .get(`${process.env.EXPO_PUBLIC_API_URL}/user/${user?.id}/friends`)
      .then((res) => res.data.result);
  };

  const { data: friendsData, isPending } = useQuery({
    queryKey: ["friendsData", user?.id],
    queryFn: fetchFriends,
  });

  const renderItem: ListRenderItem<User> = ({ item }) => (
    <UserBanner key={item.userId} user={item} type="friends" />
  );

  return (
    <BaseScreen>
      <FlatList
        data={friendsData}
        renderItem={renderItem}
        keyExtractor={(item) => item.userId}
      />
    </BaseScreen>
  );
};

export default FriendsList;
