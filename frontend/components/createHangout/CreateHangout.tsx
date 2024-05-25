import React, { useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useUser } from "@clerk/clerk-expo";
import axios from "axios";
import { useRouter } from "expo-router";
import useStore from "@/store/useStore";
// import { HangoutDetails } from "@/store/createHangoutSlice";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import BaseScreen from "@/components/utils/BaseScreen";
import SearchBar from "@/components/utils/SearchBar";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const CreateHangout = () => {
  const [clicked, setClicked] = useState(false);
  const [searchPhrase, setSearchPhrase] = useState("");
  const [hangoutName, setHangoutName] = useState("");
  const [hangoutDescription, setHangoutDescription] = useState("");
  const hangoutDetails = useStore((state) => state.hangoutDetails);
  const setHangoutDetails = useStore((state) => state.setHangoutDetails);
  const { addFriend, removeFriend } = useStore();
  const { user } = useUser();
  const router = useRouter();

  const dummyFriendsData = {
    result: Array.from({ length: 20 }, (_, index) => ({
      id: `user_${index + 1}`,
      profilePhoto: null,
      firstName: "Rex",
    })),
  };

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
    if (hangoutDetails?.hangoutName) {
      setHangoutName(hangoutDetails.hangoutName);
    }
  }, [hangoutDetails]);

  const handleHangoutSubmit = async () => {
    const hangoutData = {
      userId: user?.id,
      completed: false,
      pendingRequests: [],
      hangoutName: hangoutName,
      hangoutDescription: hangoutDescription,
    };

    setHangoutName("");
    setHangoutDescription("");

    try {
      const hangoutResponse = await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/hangout`,
        hangoutData
      );
      console.log(hangoutResponse.data);
    } catch (error) {
      console.error("Error creating hangout:", error);
      return;
    }
  };

  // const handleHangoutSubmit = async () => {
  //   const newHangoutDetails: HangoutDetails = {
  //     hangoutName: hangoutName,
  //     hangoutDescription: hangoutDescription,
  //     selectedFriends: hangoutDetails?.selectedFriends || [],
  //   };

  //   console.log(hangoutName);
  //   console.log("First " + hangoutDetails);

  //   setHangoutDetails(newHangoutDetails);

  //   console.log("Second: " + hangoutDetails);

  //   router.navigate({
  //     pathname: "/(hangout)/MemoriesScreen",
  //     params: {
  //       newPost: "true",
  //     },
  //   });
  // };

  const onSubmit = () => {}; // TODO: Implement search functionality

  return (
    <BaseScreen>
      <View style={styles.container}>
        <View style={styles.nameInputContainer}>
          <TextInput
            placeholder="what's your plan?"
            onChangeText={(input) => setHangoutName(input)}
            maxLength={25}
            value={hangoutName}
            accessibilityLabel="text-input"
            placeholderTextColor="#3F3F3F"
            cursorColor="white"
            style={styles.nameInput}
          />
          <TextInput
            placeholder="describe it :)"
            onChangeText={(input) => setHangoutDescription(input)}
            maxLength={90}
            value={hangoutDescription}
            accessibilityLabel="text-input"
            placeholderTextColor="#3F3F3F"
            cursorColor="white"
            style={styles.descriptionInput}
          />
        </View>
        <View style={styles.submitContainer}>
          <Pressable
            onPress={handleHangoutSubmit}
            style={styles.submitButton}
            accessibilityRole="button"
          >
            <Text style={{ color: "white" }}>Create your hangout</Text>
            <Ionicons name="arrow-forward" size={32} color="white" />
          </Pressable>
        </View>
        {/* <View>
          <Text style={styles.inviteText}>Invite your Friends</Text>
          <SearchBar
            clicked={clicked}
            searchPhrase={searchPhrase}
            placeholder="Search Friends"
            setSearchPhrase={setSearchPhrase}
            setClicked={setClicked}
            onSubmit={onSubmit}
          />
          {isPending ? (
            <Text>Loading friends...</Text>
          ) : (
            <ScrollView
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              directionalLockEnabled={true}
              alwaysBounceVertical={false}
              automaticallyAdjustContentInsets={false}
            >
              <FlatList
                data={friendsData.result}
                renderItem={({ item, index }) => (
                  <View>
                    <Pressable
                      accessibilityRole="button"
                      key={index}
                      style={styles.friendItem}
                      onPress={() => {
                        if (hangoutDetails?.selectedFriends.includes(item.id)) {
                          removeFriend(item.id);
                        } else {
                          addFriend(item.id);
                        }
                      }}
                    >
                      {item.profilePhoto ? (
                        <Image
                          source={{ uri: item.profilePhoto }}
                          style={styles.profilePhoto}
                        />
                      ) : (
                        <Ionicons name="person-circle" size={64} />
                      )}
                    </Pressable>
                    {hangoutDetails?.selectedFriends.includes(item.id) && (
                      <Ionicons
                        name="checkmark-circle-outline"
                        size={24}
                        style={styles.checkmarkIcon}
                      />
                    )}
                    <Text style={{ alignSelf: "center" }}>
                      {item.firstName}
                    </Text>
                  </View>
                )}
                keyExtractor={(item, index) => index.toString()}
                numColumns={Math.ceil(dummyFriendsData.result.length / 2)}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
              />
            </ScrollView>
          )}
        </View> */}
      </View>
    </BaseScreen>
  );
};

export default CreateHangout;

const styles = StyleSheet.create({
  header: {
    height: hp("5%"),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: wp(4),
    marginVertical: hp(1),
  },
  container: {
    flex: 1,
    alignItems: "center",
  },
  nameInputContainer: {
    backgroundColor: "rgba(44, 44, 48, 0.50)",
    width: wp("95%"),
    height: hp("20%"),
    marginTop: hp(2),
    borderRadius: 5,
  },
  nameInput: {
    padding: 10,
    fontFamily: "inter",
    fontSize: 24,
    fontWeight: "500",
    color: "#FFF",
  },
  descriptionInput: {
    paddingLeft: 10,
    fontFamily: "inter",
    fontSize: 16,
    fontWeight: "500",
    color: "#FFF",
  },
  inviteText: {
    alignSelf: "center",
    padding: 4,
  },
  profilePhoto: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  friendItem: {
    flex: 1,
    padding: 7,
  },
  checkmarkIcon: {
    position: "absolute",
    right: 10,
    bottom: 15,
    color: "green",
  },
  submitContainer: {
    alignItems: "flex-end",
    marginTop: 20,
    width: "100%",
    paddingRight: 20,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
});
