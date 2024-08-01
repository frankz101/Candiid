import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

interface Hangout {
  hangoutId: string;
  hangoutName: string;
  userInfo: {
    username: string;
    userId: string;
    profilePhoto?: {
      fileUrl: string;
    };
  };
  createdAt: any;
}

interface HangoutRequestBannerProps {
  type: string;
  hangout: Hangout;
  onHandleRequest?: (hangoutId: string) => void;
}

const HangoutRequestBanner: React.FC<HangoutRequestBannerProps> = ({
  type,
  hangout,
  onHandleRequest,
}) => {
  const { user: currentUser } = useUser();
  const userInfo = hangout.userInfo;
  const handleRequest = async (status: string) => {
    const res = await axios.put(
      `${process.env.EXPO_PUBLIC_API_URL}/hangout/${hangout.hangoutId}/requests`,
      {
        receiverId: currentUser?.id,
        senderId: userInfo.userId,
        status,
        type,
      }
    );

    if (res.status === 201 && onHandleRequest) {
      onHandleRequest(hangout.hangoutId);
    }
  };

  const getTimeDifference = () => {
    const now = Date.now();
    const createdAtDate = new Date(
      hangout.createdAt.seconds * 1000 + hangout.createdAt.nanoseconds / 1000000
    );
    const differenceInMillis = now - createdAtDate.getTime();

    const differenceInMinutes = differenceInMillis / (1000 * 60);
    const differenceInHours = differenceInMillis / (1000 * 60 * 60);
    const differenceInDays = differenceInMillis / (1000 * 60 * 60 * 24);
    const differenceInWeeks = differenceInDays / 7;
    const differenceInMonths = differenceInDays / 30.44;
    const differenceInYears = differenceInDays / 365.25;
    if (differenceInYears >= 1) {
      return `${Math.floor(differenceInYears)}y`;
    } else if (differenceInMonths >= 1) {
      return `${Math.floor(differenceInMonths)}m`;
    } else if (differenceInWeeks >= 1) {
      return `${Math.floor(differenceInWeeks)}w`;
    } else if (differenceInDays >= 1) {
      return `${Math.floor(differenceInDays)}d`;
    } else if (differenceInHours >= 1) {
      return `${Math.floor(differenceInHours)}h`;
    } else if (differenceInMinutes >= 1) {
      return `${Math.floor(differenceInMinutes)}m`;
    } else {
      return "Just now";
    }
  };

  return (
    <View style={styles.container}>
      {userInfo.profilePhoto ? (
        <Image
          source={{ uri: userInfo.profilePhoto.fileUrl }}
          style={styles.profilePhoto}
        />
      ) : (
        <Ionicons name="person-circle-outline" size={48} color="white" />
      )}
      <View style={styles.textContainer}>
        <Text style={styles.inviteText}>
          <Text style={styles.boldText}>{userInfo.username}</Text>{" "}
          {type === "request" ? "has invited you to" : "wants to join"}{" "}
          <Text style={styles.boldText}>{hangout.hangoutName}</Text>{" "}
          <Text style={{ color: "gray" }}>
            {"\u2022"}
            {getTimeDifference()}
          </Text>
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
