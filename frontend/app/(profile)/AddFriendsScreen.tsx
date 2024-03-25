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

interface Contact {
  id: number;
  name: string;
  username: string;
  profilePhoto: string;
}

// New component for Contact Row
const ContactRow: React.FC<{ contact: Contact }> = ({ contact }) => (
  <View
    style={[{ padding: 10, flexDirection: "row", alignItems: "flex-start" }]}
  >
    {/* Replace the following with a circular icon using the contact's profile photo */}
    <View
      style={{
        width: 40,
        height: 40,
        borderRadius: 20,
      }}
    >
      <Ionicons name="person-circle-outline" size={40} color="black" />

      {/* Add the image component for the profile photo */}
    </View>
    <View style={{ marginLeft: 10, flex: 1 }}>
      <Text style={{ fontSize: 16 }}>{contact.name}</Text>
      <Text style={{ color: "#777" }}>{"@" + contact.username}</Text>
    </View>
    <Pressable
      style={({ pressed }) => [
        {
          backgroundColor: pressed ? "#ddd" : "#ccc",
          padding: 10,
          borderRadius: 5,
        },
        styles.centerRow,
      ]}
      onPress={() => {
        // Handle "Add Friend" button click
      }}
    >
      <Text style={{ color: "#000" }}>Add Friend</Text>
    </Pressable>
  </View>
);

const AddFriendsScreen = () => {
  const [clicked, setClicked] = useState(false);
  const [searchPhrase, setSearchPhrase] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [hangoutDetails, setHangoutDetails] = useState("");

  const { user } = useUser();
  const router = useRouter();

  const onSubmit = async () => {
    const res = await axios.get(
      `http://localhost:3001/user/search/${searchPhrase}`
    );

    setSearchResults(res.data.result);
  };

  console.log(searchResults);

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
      <View style={styles.test}>
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
            <ContactRow key={contact.id} contact={contact} />
          ))}
          {/* <Text style={{ fontSize: 20, padding: 4 }}>Contacts on Memories</Text> */}
          {/* {contacts.slice(0, 5).map((contact) => (
            <ContactRow key={contact.id} contact={contact} />
          ))} */}

          {/* <Pressable
            style={({ pressed }) => [
              {
                backgroundColor: pressed ? "#ddd" : "#ccc",
                padding: 10,
                borderRadius: 5,
              },
              styles.centerRow,
            ]}
            onPress={() => {
              // Load and display more friends
            }}
          >
            <Text style={{ color: "#000" }}>Show more</Text>
          </Pressable> */}
          {/* <Text style={{ fontSize: 20, padding: 4 }}>Recommended</Text> */}
          {/* {contacts.slice(0, 3).map((contact) => (
            <ContactRow key={contact.id} contact={contact} />
          ))} */}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AddFriendsScreen;

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
});
