import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface HangoutRequestBannerProps {
  hangoutId: string;
  hangoutName: string;
  onHandleRequest?: (hangoutId: string, status: string) => void;
}

const HangoutRequestBanner: React.FC<HangoutRequestBannerProps> = ({
  hangoutId,
  hangoutName,
  onHandleRequest,
}) => {
  const { user: currentUser } = useUser();
  const handleRequest = async (status: string) => {
    const res = await axios.put(
      `http://localhost:3001/hangout/${hangoutId}/requests`,
      {
        receiverId: currentUser?.id,
        status,
      }
    );

    if (res.status === 201 && onHandleRequest && status === "accept") {
      onHandleRequest(hangoutId, status);
    } else if (res.status === 201 && onHandleRequest && status === "reject") {
      onHandleRequest(hangoutId, status);
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
        <Text style={{ fontSize: 16 }}>{hangoutName}</Text>
      </View>
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
    </View>
  );
};

export default HangoutRequestBanner;

const styles = StyleSheet.create({
  centerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});
