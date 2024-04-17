import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import React, { useState } from "react";
import SearchBar from "@/components/utils/SearchBar";
import BackButton from "@/components/utils/BackButton";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "@clerk/clerk-expo";
import axios from "axios";
import { useRouter } from "expo-router";
import FriendBanner from "@/components/friends/UserBanner";

interface User {
  id: number;
  name: string;
  username: string;
  profilePhoto: {
    fileUrl: string;
  };
  userId: string;
  friendStatus: string;
}

const AddFriendsScreen = () => {
  const [clicked, setClicked] = useState(false);
  const [searchPhrase, setSearchPhrase] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);

  const { user } = useUser();
  const router = useRouter();

  const onSubmit = async () => {
    const res = await axios.get(
      `${process.env.EXPO_PUBLIC_API_URL}/user/search/${searchPhrase}/users/${user?.id}`
    );

    setSearchResults(res.data.result);
    console.log("Search results " + searchResults);
  };

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
        <Text style={{ fontSize: 24 }}>Add Friends</Text>
        <View style={{ width: 32 }} />
      </View>
      <View style={styles.container}>
        <View>
          <SearchBar
            clicked={clicked}
            searchPhrase={searchPhrase}
            placeholder="Search Friends"
            setSearchPhrase={setSearchPhrase}
            setClicked={setClicked}
            onSubmit={onSubmit}
          />
          {searchResults?.map((user: User) => (
            <FriendBanner key={user.id} user={user} type="searchResults" />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AddFriendsScreen;

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    justifyContent: "space-evenly",
    height: "100%",
  },
});
