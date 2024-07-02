import {
  FlatList,
  ListRenderItem,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import SearchBar from "@/components/utils/SearchBar";
import BackButton from "@/components/utils/BackButton";
import { useUser } from "@clerk/clerk-expo";
import axios from "axios";
import { useFocusEffect, useRouter } from "expo-router";
import UserBanner from "@/components/friends/UserBanner";
import BaseScreen from "@/components/utils/BaseScreen";
import ContactsList from "./ContactsList";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import ShareButton from "./ShareButton";

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
  const [searchResults, setSearchResults] = useState<User[]>([]);

  const { user } = useUser();

  const onSubmit = async () => {
    if (searchPhrase) {
      const res = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}/user/search/${searchPhrase}/users/${user?.id}`
      );
      setSearchResults(
        res.data.result.filter((result: User) => result.userId !== user?.id)
      );
    }
  };

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
          onSubmit={onSubmit}
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
