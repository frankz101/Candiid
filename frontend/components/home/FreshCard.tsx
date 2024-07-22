import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Image } from "expo-image";
import { emitWarning } from "process";
import React, { memo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

interface hangoutCardProps {
  name: string;
  description: string;
  hangoutId: string;
  participantIds: string[];
  askedToJoin: boolean;
}
interface profilePicProps {
  id: string;
  name: string;
  profilePhoto: string;
}
const FreshCard: React.FC<hangoutCardProps> = ({
  name,
  description,
  hangoutId,
  participantIds,
  askedToJoin,
}) => {
  const { user } = useUser();
  const users = participantIds.slice(0, 3);
  const [asked, setAsked] = useState(askedToJoin);
  const getProfilePics = async () => {
    return axios
      .post(`${process.env.EXPO_PUBLIC_API_URL}/user/profile-pics`, {
        users,
      })
      .then((res) => res.data.result);
  };

  const { data: profilePics, isPending } = useQuery({
    queryKey: ["freshCardData", hangoutId],
    queryFn: getProfilePics,
    staleTime: 1000 * 60 * 5,
  });

  const askToJoin = async () => {
    try {
      const res = await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/hangout/join-hangout-requests`,
        {
          userId: user?.id,
          recipientId: users[0],
          hangoutName: name,
          hangoutId,
        }
      );
      if (res.status === 201) {
        setAsked(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <View style={styles.container}>
      {profilePics && (
        <View style={styles.people}>
          <View
            style={{ flexDirection: "row", alignItems: "center", gap: wp(2) }}
          >
            {profilePics[0].profilePhoto ? (
              <Image
                source={{ uri: profilePics[0]?.profilePhoto }}
                style={styles.hostPhoto}
              />
            ) : (
              <Ionicons name="person-circle" size={46} color="white" />
            )}
            <Text style={styles.hostName}>{profilePics[0]?.name}</Text>
          </View>
          <View style={styles.participants}>
            {profilePics?.slice(1).map((profilePic: profilePicProps) => (
              <View key={profilePic.id}>
                {profilePic.profilePhoto ? (
                  <Image
                    source={{ uri: profilePic.profilePhoto }}
                    style={styles.participantPhoto}
                  />
                ) : (
                  <Ionicons name="person-circle" size={40} color="white" />
                )}
              </View>
            ))}
            {participantIds.length > 3 && (
              <View style={styles.additionalParticipants}>
                <Text>+{participantIds.length - 3}</Text>
              </View>
            )}
          </View>
        </View>
      )}

      <Text style={styles.name}>{name}</Text>
      <Text style={styles.description}>{description}</Text>

      <Pressable
        style={({ pressed }) => [
          styles.button,
          asked ? styles.buttonDisabled : null,
          pressed ? { backgroundColor: "rgba(85, 85, 85, .7)" } : null,
        ]}
        disabled={asked}
        onPress={() => askToJoin()}
      >
        <Text
          style={[styles.buttonText, asked ? styles.buttonTextDisabled : null]}
        >
          {asked ? "Asked to Join" : "Ask to Join"}
        </Text>
      </Pressable>
    </View>
  );
};
export default FreshCard;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: wp("2.5"),
    marginTop: hp("1"),
    padding: wp(2),
    backgroundColor: "rgba(44, 44, 48, 0.5)",
    borderColor: "#282828",
    borderRadius: 5,
  },
  people: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  hostPhoto: {
    height: wp(10),
    width: wp(10),
    borderRadius: wp(10) / 2,
    borderColor: "white",
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  hostName: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  participantPhoto: {
    height: wp(8),
    width: wp(8),
    borderRadius: wp(8) / 2,
    borderColor: "white",
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  additionalParticipants: {
    height: wp(8),
    width: wp(8),
    borderRadius: wp(8) / 2,
    backgroundColor: "#D9D9D9",
    borderColor: "white",
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  participants: {
    flexDirection: "row",
    marginRight: wp(4),
    gap: -wp(5),
  },
  name: {
    color: "white",
    fontWeight: "bold",
    fontSize: 20,
    marginTop: hp(1),
  },
  description: {
    color: "#9B9BA1",
  },
  button: {
    alignSelf: "flex-end",
    alignItems: "center",
    borderColor: "white",
    borderWidth: 1,
    borderRadius: 5,
    width: wp(40),
    paddingVertical: hp(1),
    marginTop: hp(3),
    backgroundColor: "rgba(85, 85, 85, .5)",
  },
  buttonDisabled: {
    backgroundColor: "rgba(85, 85, 85, .5)",
    borderColor: "gray",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  buttonTextDisabled: {
    color: "gray",
  },
});
