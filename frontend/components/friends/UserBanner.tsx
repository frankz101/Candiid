import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface User {
  id: number;
  name: string;
  username: string;
  profilePhoto: string;
  userId: string;
}

interface UserBannerProps {
  user: User;
  type: string;
  onHandleRequest?: (userId: string) => void;
}

const UserBanner: React.FC<UserBannerProps> = ({
  user,
  type,
  onHandleRequest,
}) => {
  const { user: currentUser } = useUser();
  const addFriend = async () => {
    const res = await axios.post("http://localhost:3001/friendRequest", {
      senderId: currentUser?.id,
      receiverId: user.userId,
    });
  };
  const handleRequest = async (status: string) => {
    const res = await axios.post("http://localhost:3001/friendRequest/handle", {
      senderId: user.userId,
      receiverId: currentUser?.id,
      status,
    });

    if (res.status === 201 && onHandleRequest) {
      onHandleRequest(user.userId);
    }
  };
  return (
    <View
      style={[{ padding: 10, flexDirection: "row", alignItems: "flex-start" }]}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
        }}
      >
        <Ionicons name="person-circle-outline" size={40} color="black" />
      </View>
      <View style={{ marginLeft: 10, flex: 1 }}>
        <Text style={{ fontSize: 16 }}>{user.name}</Text>
        <Text style={{ color: "#777" }}>{"@" + user.username}</Text>
      </View>
      {type === "searchResults" && (
        <Pressable
          style={({ pressed }) => [
            {
              backgroundColor: pressed ? "#ddd" : "#ccc",
              padding: 10,
              borderRadius: 5,
            },
            styles.centerRow,
          ]}
          onPress={addFriend}
        >
          <Text style={{ color: "#000" }}>Add Friend</Text>
        </Pressable>
      )}
      {type === "friendRequests" && (
        <View style={{ flexDirection: "row" }}>
          <Pressable
            style={({ pressed }) => [
              {
                backgroundColor: pressed ? "#ddd" : "#ccc",
                padding: 10,
                borderRadius: 5,
              },
              styles.centerRow,
            ]}
            onPress={() => handleRequest("reject")}
          >
            <Text style={{ color: "#000" }}>Reject</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              {
                backgroundColor: pressed ? "#ddd" : "#ccc",
                padding: 10,
                borderRadius: 5,
              },
              styles.centerRow,
            ]}
            onPress={() => handleRequest("accept")}
          >
            <Text style={{ color: "#000" }}>Accept</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
};

export default UserBanner;

const styles = StyleSheet.create({
  centerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});
