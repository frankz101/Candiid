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
import FriendBanner from "@/components/friends/FriendBanner";

interface Contact {
  id: number;
  name: string;
  username: string;
  profilePhoto: string;
  userId: string;
}

const AddFriendsScreen = () => {
  const [clicked, setClicked] = useState(false);
  const [searchPhrase, setSearchPhrase] = useState("");
  const [searchResults, setSearchResults] = useState(null);

  const { user } = useUser();
  const router = useRouter();

  const onSubmit = async () => {
    const res = await axios.get(
      `http://localhost:3001/user/search/${searchPhrase}`
    );

    setSearchResults(res.data.result);
  };

  const addFriend = async (contact: Contact) => {
    const res = await axios.post("http://localhost:3001/friendRequest", {
      senderId: user?.id,
      receiverId: contact.id,
      status: "pending",
    });
    console.log(res.data.result);
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
          {searchResults?.map((contact: Contact) => (
            <FriendBanner
              key={contact.id}
              contact={contact}
              addFriend={() => addFriend(contact)}
            />
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
