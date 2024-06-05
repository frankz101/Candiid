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
}
const ParticipantsList: React.FC<ParticipantsListProps> = ({
  participants,
}) => {
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
          <Image source={{ uri: item.iconUrl }} style={styles.icon} />
        </View>
      );
    }
  };

  return (
    <View style={styles.mainContainer}>
      <FlatList
        data={participants.slice(0, MAX_VISIBLE_PARTICIPANTS + 1)}
        renderItem={renderItem}
        keyExtractor={(item) => item}
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
