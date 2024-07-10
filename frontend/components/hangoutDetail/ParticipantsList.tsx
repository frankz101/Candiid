import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import React from "react";
import {
  FlatList,
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const MAX_VISIBLE_PARTICIPANTS = 6;

interface ParticipantsListProps {
  // participants: {
  //   id: string;
  //   name: string;
  //   iconUrl: string;
  // }[];
  participants: string[];
  hangoutId: string;
}
const ParticipantsList: React.FC<ParticipantsListProps> = ({
  participants,
  hangoutId,
}) => {
  const users = participants.slice(0, MAX_VISIBLE_PARTICIPANTS + 1);

  const getProfilePics = async () => {
    return axios
      .post(`${process.env.EXPO_PUBLIC_API_URL}/user/profile-pics`, {
        users,
      })
      .then((res) => res.data.result);
  };

  const { data: profilePics, isPending } = useQuery({
    queryKey: ["participants", hangoutId],
    queryFn: getProfilePics,
  });

  const renderItem = ({ item, index }: { item: any; index: any }) => {
    if (index === MAX_VISIBLE_PARTICIPANTS) {
      return (
        <Pressable
          onPress={() => alert("Show all participants (IMPLEMENT THIS SCREEN)")}
          style={styles.moreContainer}
        >
          <Text style={styles.moreText}>
            +{participants.length - MAX_VISIBLE_PARTICIPANTS}
          </Text>
        </Pressable>
      );
    } else {
      return (
        <View style={styles.participantContainer}>
          <Image source={{ uri: item.profilePhoto }} style={styles.icon} />
        </View>
      );
    }
  };

  if (isPending) {
    return <View />;
  }

  return (
    <View style={styles.mainContainer}>
      <FlatList
        data={profilePics}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    paddingLeft: wp(2),
  },
  participantContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#FFF",
  },
  name: {
    marginLeft: 5,
  },
  moreContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: 40,
    height: 40,
    backgroundColor: "gray",
    borderRadius: 20,
  },
  moreText: {
    color: "#FFF",
    fontFamily: "inter",
    fontSize: 16,
  },
});

export default ParticipantsList;
