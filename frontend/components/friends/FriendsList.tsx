import { useUser } from "@clerk/clerk-expo";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import UserBanner from "@/components/friends/UserBanner";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

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

  const fetchFriends = async (): Promise<User[]> => {
    const response = await axios.get(
      `${process.env.EXPO_PUBLIC_API_URL}/user/${user?.id}/friends`
    );
    return response.data;
  };

  const {
    data: friendsData,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["friends", user?.id],
    queryFn: fetchFriends,
  });

  if (isPending) {
    return <ActivityIndicator size="large" color="#FFF" />;
  }

  if (isError) {
    return <Text>{"Error loading friends."}</Text>;
  }

  if (!friendsData || friendsData.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "white", alignSelf: "center" }}>
          You haven't added any friends yet!
        </Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: User }) => {
    return <UserBanner key={item.userId} user={item} type="friends" />;
  };

  return (
    <View style={{ flex: 1 }}>
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
