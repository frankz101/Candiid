import { FlatList, ListRenderItem, StyleSheet, Text, View } from "react-native";
import React, { useState, useCallback, useEffect, useRef } from "react";
import SearchBar from "@/components/utils/SearchBar";
import { useUser } from "@clerk/clerk-expo";
import axios from "axios";
import UserBanner from "@/components/friends/UserBanner";
import BaseScreen from "@/components/utils/BaseScreen";
import ContactsList from "./ContactsList";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import ShareButton from "./ShareButton";
import { useFocusEffect } from "@react-navigation/native";
import { useQuery, useQueryClient } from "@tanstack/react-query";

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

const SearchFriends = () => {
  const [clicked, setClicked] = useState(false);
  const [searchPhrase, setSearchPhrase] = useState("");
  const [debouncedSearchPhrase, setDebouncedSearchPhrase] = useState("");
  const { user } = useUser();

  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = setTimeout(() => {
      setDebouncedSearchPhrase(searchPhrase.trim());
    }, 500);

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [searchPhrase]);

  const fetchSearchResults = async () => {
    console.log("fetching");
    if (user) {
      const res = await axios.get(
        `${
          process.env.EXPO_PUBLIC_API_URL
        }/user/search/${searchPhrase.trim()}/users/${user.id}`
      );
      return res.data.result.filter(
        (result: User) => result.userId !== user.id
      );
    }
  };

  const { data: searchResults = [] } = useQuery({
    queryKey: ["searchResults", searchPhrase],
    queryFn: fetchSearchResults,
    enabled: !!debouncedSearchPhrase,
  });

  const renderItem: ListRenderItem<User> = ({ item }) => (
    <UserBanner key={item.id} user={item} type="searchResults" />
  );

  return (
    <BaseScreen>
      <View style={styles.container}>
        <SearchBar
          clicked={clicked}
          searchPhrase={searchPhrase}
          placeholder="Search Users"
          setSearchPhrase={setSearchPhrase}
          setClicked={setClicked}
          onSubmit={fetchSearchResults}
        />
        <ShareButton />
        <FlatList
          data={searchResults}
          renderItem={renderItem}
          keyExtractor={(item) => item.userId}
        />
      </View>
      <ContactsList />
    </BaseScreen>
  );
};

export default SearchFriends;

const styles = StyleSheet.create({
  container: {
    alignItems: "stretch",
    marginBottom: hp(2),
  },
});
