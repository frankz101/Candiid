import { StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import SearchBar from "../utils/SearchBar";
import axios from "axios";
import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const InviteFriends = () => {
  const [clicked, setClicked] = useState(false);
  const [searchPhrase, setSearchPhrase] = useState("");
  const { user } = useUser();
  const router = useRouter();

  const fetchFriends = async () => {
    return axios
      .get(`${process.env.EXPO_PUBLIC_API_URL}/user/${user?.id}/friends`)
      .then((res) => res.data);
  };

  const { data: friendsData, isPending } = useQuery({
    queryKey: ["friendsData", user?.id],
    queryFn: fetchFriends,
  });

  const onSubmit = () => {}; // TODO: Implement search functionality

  return (
    <View>
      <SearchBar
        clicked={clicked}
        searchPhrase={searchPhrase}
        placeholder="Search Friends"
        setSearchPhrase={setSearchPhrase}
        setClicked={setClicked}
        onSubmit={onSubmit}
      />

      {/* Main */}
      <View style={styles.mainContainer}>
        <View>
          <Text style={styles.listHeaderText}>Recommended Friends</Text>
        </View>
        <View>
          <Text style={styles.listHeaderText}>
            Invite Friends from Contacts
          </Text>
        </View>
      </View>
    </View>
  );
};

export default InviteFriends;

const styles = StyleSheet.create({
  mainContainer: {
    marginLeft: wp(2),
  },
  listHeaderText: {
    paddingVertical: hp(2),
    fontSize: 14,
    fontFamily: "inter",
    fontWeight: "700",
    color: "#FFF",
  },
});
