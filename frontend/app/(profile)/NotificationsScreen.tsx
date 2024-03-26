import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import BackButton from "@/components/utils/BackButton";
import { useUser } from "@clerk/clerk-expo";
import axios from "axios";
import UserBanner from "@/components/friends/UserBanner";

interface User {
  id: number;
  name: string;
  username: string;
  profilePhoto: string;
  userId: string;
}

const NotificationsScreen = () => {
  const [friendRequests, setFriendRequests] = useState<User[]>([]);
  const { user } = useUser();
  const getFriendRequests = async () => {
    const res = await axios.get(
      `http://localhost:3001/friendRequest/get/${user?.id}`
    );
    setFriendRequests(res.data.result);
  };

  const updateFriendRequests = (userId: string) => {
    setFriendRequests((currentRequests) =>
      currentRequests?.filter((request: User) => request.userId !== userId)
    );
  };

  useEffect(() => {
    getFriendRequests();
  }, []);
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
      <View>
        {friendRequests?.map((contact: User) => (
          <UserBanner
            key={contact.userId}
            user={contact}
            type="friendRequests"
            onHandleRequest={() => updateFriendRequests(contact.userId)}
          />
        ))}
      </View>
    </SafeAreaView>
  );
};

export default NotificationsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
