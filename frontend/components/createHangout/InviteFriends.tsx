import { FlatList, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import SearchBar from "../utils/SearchBar";
import axios from "axios";
import { useUser } from "@clerk/clerk-expo";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import FriendInviteBanner from "./FriendInviteBanner";

const tempFriendData = [
  {
    id: "user_1",
    profilePhoto: "https://randomuser.me/api/portraits/men/1.jpg",
    firstName: "John",
  },
  {
    id: "user_2",
    profilePhoto: "https://randomuser.me/api/portraits/women/2.jpg",
    firstName: "Jane",
  },
  {
    id: "user_3",
    profilePhoto: "https://randomuser.me/api/portraits/men/3.jpg",
    firstName: "Mike",
  },
  {
    id: "user_4",
    profilePhoto: "https://randomuser.me/api/portraits/women/4.jpg",
    firstName: "Alice",
  },
  {
    id: "user_5",
    profilePhoto: "https://randomuser.me/api/portraits/men/5.jpg",
    firstName: "Tom",
  },
  {
    id: "user_6",
    profilePhoto: "https://randomuser.me/api/portraits/women/6.jpg",
    firstName: "Lucy",
  },
  {
    id: "user_7",
    profilePhoto: "https://randomuser.me/api/portraits/men/7.jpg",
    firstName: "Bob",
  },
  {
    id: "user_8",
    profilePhoto: "https://randomuser.me/api/portraits/women/8.jpg",
    firstName: "Anna",
  },
  {
    id: "user_9",
    profilePhoto: "https://randomuser.me/api/portraits/men/9.jpg",
    firstName: "James",
  },
  {
    id: "user_10",
    profilePhoto: "https://randomuser.me/api/portraits/women/10.jpg",
    firstName: "Emma",
  },
];

const InviteFriends = () => {
  const [clicked, setClicked] = useState(false);
  const [invitedFriends, setInvitedFriends] = useState<string[]>([]);
  const [searchPhrase, setSearchPhrase] = useState("");
  const { user } = useUser();
  const router = useRouter();
  const { hangoutId } = useLocalSearchParams();

  const fetchFriends = async () => {
    return axios
      .get(`${process.env.EXPO_PUBLIC_API_URL}/user/${user?.id}/friends`)
      .then((res) => res.data);
  };

  const { data: friendsData, isPending } = useQuery({
    queryKey: ["friendsData", user?.id],
    queryFn: fetchFriends,
  });

  useEffect(() => {
    return () => {
      sendInvites();
    };
  }, []);

  const sendInvites = async () => {
    if (invitedFriends.length > 0) {
      try {
        console.log("Sending invites to:", invitedFriends);
        const hangoutRequestsResponse = await axios.post(
          `${process.env.EXPO_PUBLIC_API_URL}/hangout/${hangoutId}/requests`,
          {
            selectedFriends: invitedFriends,
          }
        );
        console.log(hangoutRequestsResponse.data);
      } catch (error) {
        console.error("Error sending invites:", error);
      }
    }
  };

  const handleInvite = (username: string) => {
    setInvitedFriends((prev) => [...prev, username]);
  };
  const handleUninvite = (username: string) => {
    setInvitedFriends((prev) => prev.filter((name) => name !== username));
  };

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
          {/* <FlatList data={tempFriendData}/> */}
          <FriendInviteBanner
            username="franklinzhu26"
            onInvite={() => handleInvite("franklinzhu26")}
            onUninvite={() => handleUninvite("franklinzhu26")}
          />
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
