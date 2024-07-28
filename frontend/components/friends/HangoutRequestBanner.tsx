import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

interface HangoutRequestBannerProps {
  type: string;
  senderName: string;
  senderId: string;
  senderProfilePhoto: string;
  hangoutId: string;
  hangoutName: string;
  onHandleRequest?: (hangoutId: string) => void;
}

const HangoutRequestBanner: React.FC<HangoutRequestBannerProps> = ({
  type,
  senderName,
  senderId,
  senderProfilePhoto,
  hangoutId,
  hangoutName,
  onHandleRequest,
}) => {
  const { user: currentUser } = useUser();
  const handleRequest = async (status: string) => {
    const res = await axios.put(
      `${process.env.EXPO_PUBLIC_API_URL}/hangout/${hangoutId}/requests`,
      {
        receiverId: currentUser?.id,
        senderId,
        status,
        type,
      }
    );

    if (res.status === 201 && onHandleRequest) {
      onHandleRequest(hangoutId);
    }
  };
  return (
    <View style={styles.container}>
      {senderProfilePhoto ? (
        <Image
          source={{ uri: senderProfilePhoto }}
          style={styles.profilePhoto}
        />
      ) : (
        <Ionicons name="person-circle-outline" size={40} color="black" />
      )}
      <View style={styles.textContainer}>
        <Text style={styles.inviteText}>
          <Text style={styles.boldText}>{senderName}</Text>{" "}
          {type === "request" ? "has invited you to" : "wants to join"}{" "}
          <Text style={styles.boldText}>{hangoutName}</Text>
        </Text>
      </View>
      <View style={{ flexDirection: "row" }}>
        <View style={{ flexDirection: "row" }}>
          <Pressable
            style={({ pressed }) => [
              {
                backgroundColor: pressed
                  ? "rgba(85, 85, 85, 0.7)"
                  : "rgba(85, 85, 85, 0.5)",
              },
              styles.centerRow,
            ]}
            onPress={() => handleRequest("accept")}
          >
            <Text style={{ color: "lightgray" }}>Accept</Text>
          </Pressable>
          <Pressable
            style={styles.centerRow}
            onPress={() => handleRequest("reject")}
          >
            <Ionicons name="close-outline" color="gray" size={20} />
          </Pressable>
        </View>
      </View>
    </View>
  );
};

export default HangoutRequestBanner;

const styles = StyleSheet.create({
  container: {
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  profilePhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  nameText: {
    fontFamily: "inter",
    fontSize: 14,
    fontWeight: "700",
    color: "#FFF",
  },
  centerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: wp(3.5),
    paddingVertical: hp(0.7),
  },
  textContainer: {
    marginLeft: 10,
    flex: 1,
  },
  inviteText: {
    fontFamily: "inter",
    fontSize: 14,
    color: "#FFF",
  },
  boldText: {
    fontWeight: "700",
  },
});
