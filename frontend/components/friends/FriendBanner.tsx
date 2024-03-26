import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface Contact {
  id: number;
  name: string;
  username: string;
  profilePhoto: string;
  userId: string;
}

interface FriendBannerProps {
  contact: Contact;
  addFriend: () => Promise<void>;
}

const FriendBanner: React.FC<FriendBannerProps> = ({ contact, addFriend }) => (
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
      <Text style={{ fontSize: 16 }}>{contact.name}</Text>
      <Text style={{ color: "#777" }}>{"@" + contact.username}</Text>
    </View>
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
  </View>
);

export default FriendBanner;

const styles = StyleSheet.create({
  centerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});
