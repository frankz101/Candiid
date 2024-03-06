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
import BackButton from "@/components/utils/backButton";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "@clerk/clerk-expo";
import axios, { AxiosResponse } from "axios";
import { useRouter } from "expo-router";

interface Contact {
  id: number;
  name: string;
  username: string;
  profilePhoto: string;
}

// Dummy data for contacts (replace this with actual data later lol)
const contacts: Contact[] = [
  {
    id: 1,
    name: "Ebeth Kim",
    username: "ebeth",
    profilePhoto: "url/to/photo",
  },
  {
    id: 2,
    name: "Frankie Zhu",
    username: "codewithfrank",
    profilePhoto: "url/to/photo",
  },
  {
    id: 3,
    name: "Andy Ren",
    username: "meowmeow",
    profilePhoto: "url/to/photo",
  },
  {
    id: 4,
    name: "Christina Wu",
    username: "christinawu19",
    profilePhoto: "url/to/photo",
  },
  {
    id: 5,
    name: "Jeff Yue",
    username: "newjerseynumber3",
    profilePhoto: "url/to/photo",
  },
];

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
        backgroundColor: "#aaa",
      }}
    >
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
  const [hangoutDetails, setHangoutDetails] = useState("");

  const { user } = useUser();
  const router = useRouter();

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
            setSearchPhrase={setSearchPhrase}
            setClicked={setClicked}
          />
          <Text style={{ fontSize: 20, padding: 4 }}>Contacts on Memories</Text>
          {contacts.slice(0, 5).map((contact) => (
            <ContactRow key={contact.id} contact={contact} />
          ))}

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
              // Load and display more friends
            }}
          >
            <Text style={{ color: "#000" }}>Show more</Text>
          </Pressable>
          <Text style={{ fontSize: 20, padding: 4 }}>Recommended</Text>
          {contacts.slice(0, 3).map((contact) => (
            <ContactRow key={contact.id} contact={contact} />
          ))}
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
