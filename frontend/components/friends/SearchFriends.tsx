import { FlatList, ListRenderItem, StyleSheet, View } from "react-native";
import React, { useState, useEffect, useRef } from "react";
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
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@uidotdev/usehooks";

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
  const debouncedSearchPhrase = useDebounce(searchPhrase, 500);
  const [searchResults, setSearchResults] = useState([]);
  const { user } = useUser();

  // const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // useEffect(() => {
  //   if (debounceTimeout.current) {
  //     clearTimeout(debounceTimeout.current);
  //   }
  //   debounceTimeout.current = setTimeout(() => {
  //     setDebouncedSearchPhrase(searchPhrase.trim());
  //   }, 500);

  //   return () => {
  //     if (debounceTimeout.current) {
  //       clearTimeout(debounceTimeout.current);
  //     }
  //   };
  // }, [searchPhrase]);

  const fetchSearchResults = async () => {
    console.log("Fetching search results");
    if (user && debouncedSearchPhrase) {
      try {
        const res = await axios.get(
          `${
            process.env.EXPO_PUBLIC_API_URL
          }/user/search/${debouncedSearchPhrase.trim()}/users/${user.id}`
        );
        if (res.status === 201 && res.data) {
          return res.data.filter((result: User) => result.userId !== user.id);
        } else {
          return [];
        }
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          console.warn("No results found for the search query.");
          return [];
        } else {
          console.error("Error fetching search results:", err);
        }
      }
    }
    return [];
  };

  const {
    data: searchResultsQuery,
    isPending,
    refetch,
  } = useQuery({
    queryKey: ["searchResults", debouncedSearchPhrase],
    queryFn: fetchSearchResults,
  });

  useEffect(() => {
    console.log("Key: " + debouncedSearchPhrase);
    refetch();
  }, [debouncedSearchPhrase]);

  const renderItem: ListRenderItem<User> = ({ item }) => (
    <UserBanner key={item.id} user={item} type="searchResults" />
  );

  if (!isPending) {
    console.log("Search: " + JSON.stringify(searchResultsQuery));
  }
  return (
    <BaseScreen>
      <View>
        <SearchBar
          clicked={clicked}
          searchPhrase={searchPhrase}
          placeholder="Search Users"
          setSearchPhrase={setSearchPhrase}
          setClicked={setClicked}
          onSubmit={fetchSearchResults}
        />
        <ShareButton type="user" id={user?.id as string} />
        <FlatList
          style={{ height: "100%" }}
          data={searchResults}
          renderItem={renderItem}
          keyExtractor={(item) => item.userId}
        />
        <ContactsList />
      </View>
    </BaseScreen>
  );
};

export default SearchFriends;
