import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import SearchBar from "../utils/SearchBar";
import axios from "axios";
import { useUser } from "@clerk/clerk-expo";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import FriendInviteBanner from "./FriendInviteBanner";
import DebouncedPressable from "../utils/DebouncedPressable";
import ShareButton from "../friends/ShareButton";

const InviteFriends = () => {
  const [clicked, setClicked] = useState(false);
  const [invitedFriends, setInvitedFriends] = useState<string[]>([]);
  const [searchPhrase, setSearchPhrase] = useState("");
  const { user } = useUser();
  const router = useRouter();
  const { hangoutId, hangoutName, isPressedFromHangoutScreen } =
    useLocalSearchParams();
  const queryClient = useQueryClient();

  const fetchFriends = async () => {
    return axios
      .get(`${process.env.EXPO_PUBLIC_API_URL}/user/${user?.id}/friends`)
      .then((res) => res.data);
  };

  const { data: friendsData, isPending } = useQuery({
    queryKey: ["friends", user?.id],
    queryFn: fetchFriends,
  });

  // useEffect(() => {
  //   return () => {
  //     console.log("Use effect");
  //     console.log(invitedFriends);
  //     sendInvites();
  //   };
  // }, []);

  const sendInvites = async () => {
    console.log("send invite");

    // if (invitedFriends.length > 0) {
    //   console.log("Greater than 1");
    try {
      console.log("Sending invites to:", invitedFriends);
      console.log("User Id: " + user?.id);
      const hangoutRequestsResponse = await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/hangout/${hangoutId}/requests`,
        {
          selectedFriends: invitedFriends,
          hangoutName: hangoutName,
          userId: user?.id,
        }
      );
      console.log(hangoutRequestsResponse.data);
      if (isPressedFromHangoutScreen === "false") {
        router.push({
          pathname: "/(tabs)/profile",
        });
      } else {
        router.back();
      }
      await queryClient.invalidateQueries({
        queryKey: ["upcomingHangouts", user?.id],
      });

      await queryClient.invalidateQueries({
        queryKey: ["profile", user?.id],
      });
    } catch (error) {
      console.error("Error sending invites:", error);
    }
    // }
  };

  const handleInvite = (userId: string) => {
    setInvitedFriends((prev) => [...prev, userId]);
  };
  const handleUninvite = (userId: string) => {
    setInvitedFriends((prev) => prev.filter((id) => id !== userId));
  };

  const onSubmit = () => {}; // TODO: Implement search functionality

  interface Friend {
    username: string;
    name: string;
    userId: string;
    profilePhoto: {
      fileUrl: string;
    };
  }

  const renderFriendBanner = ({
    item,
    index,
  }: {
    item: Friend;
    index: number;
  }) => (
    <FriendInviteBanner
      username={item.username} // FIX THIS WITH USERNAME NOT FIRSTNAME
      profilePhoto={item.profilePhoto.fileUrl}
      onInvite={() => handleInvite(item.userId)}
      onUninvite={() => handleUninvite(item.userId)}
    />
  );

  return (
    <View style={{ flex: 1 }}>
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
          {isPending ? (
            <Text>Loading friends...</Text>
          ) : (
            <FlatList
              data={friendsData}
              keyExtractor={(item) => item.userId}
              renderItem={renderFriendBanner}
            />
          )}
        </View>
        <Text style={styles.listHeaderText}>Invite Friends from Contacts</Text>
        <View style={{ marginLeft: wp(-2), marginTop: hp(-2) }}>
          <ShareButton type="hangout" id={hangoutId as string} />
        </View>
      </View>
      <View style={styles.submitButton}>
        <DebouncedPressable onPress={sendInvites}>
          <Text style={styles.submitText}>Finish Inviting</Text>
        </DebouncedPressable>
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
  submitButton: {
    alignSelf: "center",
    position: "absolute",
    bottom: hp(2),
    backgroundColor: "rgba(85, 85, 85, 0.50)",
    borderWidth: 1,
    borderColor: "#FFF",
    borderRadius: 5,
    width: wp("40%"),
    aspectRatio: 4,
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp(4),
  },
  submitText: {
    fontFamily: "inter",
    fontSize: 14,
    fontWeight: "700",
    color: "#FFF",
  },
});
