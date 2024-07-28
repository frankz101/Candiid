import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

interface User {
  name: string;
  username: string;
  profilePhoto: {
    fileUrl: string;
  };
  userId: string;
  friendStatus?: string;
}

interface FriendRequestBannerProps {
  user: User;
  onHandleRequest?: (userId: string) => void;
}

const FriendRequestBanner: React.FC<FriendRequestBannerProps> = ({
  user,
  onHandleRequest,
}) => {
  const { user: currentUser } = useUser();
  const handleRequest = async (status: string) => {
    const res = await axios.post(
      `${process.env.EXPO_PUBLIC_API_URL}/friendRequest/handle`,
      {
        senderId: user.userId,
        receiverId: currentUser?.id,
        status,
      }
    );

    if (res.status === 201 && onHandleRequest) {
      onHandleRequest(user.userId);
    }
  };
  return (
    <View style={styles.container}>
      {user.profilePhoto ? (
        <Image
          source={{ uri: user.profilePhoto.fileUrl }}
          style={styles.profilePhoto}
        />
      ) : (
        <Ionicons name="person-circle-outline" size={48} color="white" />
      )}
      <View style={styles.textContainer}>
        <Text style={styles.inviteText}>
          <Text style={styles.boldText}>{user.username}</Text>{" "}
          <Text>wants to be friends!</Text>
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

export default FriendRequestBanner;

const styles = StyleSheet.create({
  container: {
    padding: wp(2),
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
    marginLeft: wp(2),
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
