import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import BackButton from "@/components/utils/BackButton";
import { useUser } from "@clerk/clerk-expo";
import axios from "axios";
import FriendBanner from "@/components/friends/FriendBanner";

interface Contact {
  id: number;
  name: string;
  username: string;
  profilePhoto: string;
  userId: string;
}

const NotificationsScreen = () => {
  const [friendRequests, setFriendRequests] = useState(null);
  const { user } = useUser();
  const getFriendRequests = async () => {
    const res = await axios.get(
      `http://localhost:3001/friendRequest/get/${user?.id}`
    );
    console.log(res.data.result);
    setFriendRequests(res.data.result);
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
        {friendRequests?.map((contact: Contact) => (
          <FriendBanner
            key={contact.userId}
            contact={contact}
            addFriend={getFriendRequests}
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
