import { Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import { Hangout, Participant } from "@/app/(tabs)/profile";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

interface ProfileHangoutProps {
  hangout: Hangout;
}

const ProfileHangout: React.FC<ProfileHangoutProps> = ({ hangout }) => {
  const router = useRouter();
  return (
    <Pressable
      key={hangout.id}
      onPress={() => router.push(`/(hangout)/${hangout.id}`)}
    >
      <View style={styles.hangoutBanner}>
        <View>
          <Text style={styles.hangoutNameText}>{hangout.hangoutName}</Text>
          <Text style={styles.hangoutDescriptionText}>
            {hangout.hangoutDescription}
          </Text>
        </View>

        <View style={styles.participants}>
          {hangout.participants.map(
            (participant: Participant, index: number) => {
              return participant.profilePhoto ? (
                <Image
                  key={participant.userId}
                  source={{ uri: participant.profilePhoto.fileUrl }}
                  style={styles.participantPhoto}
                />
              ) : (
                <View key={participant.userId} style={styles.participantPhoto}>
                  <Ionicons name="person-circle" size={40} color="white" />
                </View>
              );
            }
          )}
          {hangout.participantIds.length > 2 && (
            <View style={styles.additionalParticipants}>
              <Text>+{hangout.participantIds.length - 2}</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
};

export default ProfileHangout;

const styles = StyleSheet.create({
  hangoutBanner: {
    marginTop: hp(1),
    width: wp("47%"),
    aspectRatio: 4 / 5,
    backgroundColor: "#202023",
    borderRadius: 20,
    justifyContent: "space-between",
  },
  hangoutNameText: {
    paddingLeft: wp(3),
    paddingTop: hp(2),
    color: "#FFF",
    fontFamily: "Inter",
    fontSize: 18,
    fontWeight: "bold",
  },
  hangoutDescriptionText: {
    paddingTop: hp(1),
    paddingHorizontal: wp(3),
    fontFamily: "inter",
    fontSize: 12,
    color: "#FFF",
  },
  participants: {
    flexDirection: "row",
    alignSelf: "flex-end",
    padding: wp(4),
    gap: -wp(4),
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
});
