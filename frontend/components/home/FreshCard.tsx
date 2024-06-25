import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

interface hangoutCardProps {
  name: string;
  description: string;
  hangoutId: string;
  participantIds: string[];
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
}) => {
  const { user } = useUser();
  const users = participantIds.slice(0, 3);
  console.log(users);
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
  });

  return (
    <View style={styles.container}>
      <View style={styles.people}>
        <View
          style={{ flexDirection: "row", alignItems: "center", gap: wp(2) }}
        >
          {profilePics[0].profilePhoto ? (
            <Image
              source={{ uri: profilePics[0].profilePhoto }}
              style={styles.hostPhoto}
            />
          ) : (
            <Ionicons name="person-circle" size={40} color="white" />
          )}
          <Text style={styles.hostName}>{profilePics[0].name}</Text>
        </View>
        <View style={styles.participants}>
          {profilePics?.slice(1).map((profilePic: profilePicProps) => (
            <View>
              {profilePic.profilePhoto ? (
                <Image
                  key={profilePic.id}
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

      <Text style={styles.name}>{name}</Text>
      <Text style={styles.description}>{description}</Text>

      <Pressable style={styles.button}>
        <Text style={styles.buttonText}>Ask to Join</Text>
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
    height: 40,
    width: 40,
    borderRadius: 18,
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
    height: 36,
    width: 36,
    borderRadius: 18,
    borderColor: "white",
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  additionalParticipants: {
    height: 36,
    width: 36,
    borderRadius: 18,
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
    backgroundColor: "#555555",
    borderColor: "white",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: wp(10),
    paddingVertical: hp(1),
    marginTop: hp(3),
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});
