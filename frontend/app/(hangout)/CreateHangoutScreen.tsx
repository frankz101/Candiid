import {
  FlatList,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import SearchBar from "@/components/utils/SearchBar";
import BackButton from "@/components/utils/BackButton";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "@clerk/clerk-expo";
import axios, { AxiosResponse } from "axios";
import { useRouter } from "expo-router";
import useStore from "@/store/useStore";
import { HangoutDetails } from "@/store/createHangoutSlice";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";

const CreateHangoutScreen = () => {
  const [clicked, setClicked] = useState(false);
  const [searchPhrase, setSearchPhrase] = useState("");
  const [hangoutName, setHangoutName] = useState("");
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

  const firstHalf = dummyFriendsData.result.slice(
    0,
    Math.ceil(dummyFriendsData.result.length / 2)
  );
  const secondHalf = dummyFriendsData.result.slice(
    Math.ceil(dummyFriendsData.result.length / 2)
  );

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
    const newHangoutDetails: HangoutDetails = {
      hangoutName: hangoutName,
      selectedFriends: hangoutDetails?.selectedFriends || [],
    };

    console.log(hangoutName);
    console.log("First " + hangoutDetails);

    setHangoutDetails(newHangoutDetails);

    console.log("Second: " + hangoutDetails);

    router.navigate({
      pathname: "/(hangout)/MemoriesScreen",
      params: {
        newPost: "true",
      },
    });
  };

  const onSubmit = () => {}; //TO DO NEED TO BE ABLE TO SEARCH FRIENDS

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <BackButton />
        <Text style={{ fontSize: 24 }}>Create a Hangout</Text>
        <View style={{ width: 32 }} />
      </View>
      <View style={styles.test}>
        <View style={{ alignSelf: "center" }}>
          <TextInput
            placeholder="what's your plan?"
            onChangeText={(input) => setHangoutName(input)} //CONSIDER CHANGING THIS TO ONSUBMITEDITING
            multiline={false} //change back to true later
            maxLength={90}
            value={hangoutName}
          />
        </View>
        <View>
          <View>
            <Text style={{ alignSelf: "center", padding: 4 }}>
              Invite your Friends
            </Text>
            <SearchBar
              clicked={clicked}
              searchPhrase={searchPhrase}
              placeholder="Search Friends"
              setSearchPhrase={setSearchPhrase}
              setClicked={setClicked}
              onSubmit={onSubmit}
            />
          </View>

          <View>
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
                        key={index}
                        style={styles.friendItem}
                        onPress={() => {
                          if (
                            hangoutDetails?.selectedFriends.includes(item.id)
                          ) {
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
                  key={Math.ceil(dummyFriendsData.result.length / 2)}
                  numColumns={Math.ceil(dummyFriendsData.result.length / 2)}
                  showsVerticalScrollIndicator={false}
                  showsHorizontalScrollIndicator={false}
                  // columnWrapperStyle={styles.columnWrapper}
                />
              </ScrollView>
            )}
          </View>
        </View>

        <View
          style={{
            alignItems: "flex-end",
          }}
        >
          <Pressable
            onPress={handleHangoutSubmit}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              padding: 8,
            }}
          >
            <Text>Create your hangout</Text>
            <Ionicons name="arrow-forward" size={32} />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default CreateHangoutScreen;

const styles = StyleSheet.create({
  centerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  test: {
    flexDirection: "column",
    justifyContent: "space-evenly",
    // borderColor: "black",
    // borderWidth: 1,
    height: "100%",
  },
  profilePhoto: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  friendItem: {
    flex: 1,
    padding: 7, // Adjust the margin as needed
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  checkmarkIcon: {
    position: "absolute",
    right: 10,
    bottom: 15,
    color: "green",
  },
});
