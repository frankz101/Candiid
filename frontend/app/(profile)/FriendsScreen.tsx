import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import SearchFriends from "../../components/friends/SearchFriends";
import FriendsList from "../../components/friends/FriendsList";
import BaseScreen from "@/components/utils/BaseScreen";
import BackButton from "@/components/utils/BackButton";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useLocalSearchParams } from "expo-router";
import axios from "axios";
import { useUser } from "@clerk/clerk-expo";
import { TabView } from "react-native-tab-view";
import FriendsTabBar from "@/components/friends/FriendsTabBar";

const initialLayout = { height: 0, width: Dimensions.get("window").width };

const FriendsScreen = () => {
  const [isSearch, setIsSearch] = useState(true);
  const { id } = useLocalSearchParams();
  const { user } = useUser();

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "searchFriends", title: "Search" },
    { key: "friendsList", title: "Friends" },
  ]);

  const renderScene = ({ route }: any) => {
    switch (route.key) {
      case "searchFriends":
        return <SearchFriends />;
      case "friendsList":
        return <FriendsList />;
      default:
        return null;
    }
  };

  const animation = useRef(new Animated.Value(0)).current;

  const toggle = (toSearch: boolean) => {
    setIsSearch(toSearch);
    Animated.spring(animation, {
      toValue: toSearch ? 0 : 1,
      useNativeDriver: false,
    }).start();
  };

  useEffect(() => {
    const addFriend = async () => {
      if (id && user?.id) {
        toggle(false);
        try {
          await axios.put(`${process.env.EXPO_PUBLIC_API_URL}/user/friends`, {
            userId1: user.id,
            userId2: id,
          });
          console.log("Friend added successfully");
        } catch (error) {
          console.error("Error adding friend from invite: ", error);
        }
      }
    };

    addFriend();
  }, [id]);

  const translateX = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [-wp(9.25), wp(8.75)],
  });

  return (
    <BaseScreen>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerText}>Friends</Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={styles.container}>
        {/* {isSearch ? <SearchFriends /> : <FriendsList />} */}
        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={initialLayout}
          lazy={true}
          renderTabBar={(props) => <FriendsTabBar {...props} />}
        />
      </View>
    </BaseScreen>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: hp(1),
  },
  headerText: {
    fontSize: 20,
    fontFamily: "inter",
    fontWeight: "700",
    color: "#FFF",
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  toggleContainer: {
    position: "absolute",
    bottom: hp(3),
    paddingHorizontal: wp(0.75),
    paddingVertical: hp(0.25),
    borderRadius: 30,
    backgroundColor: "#252525",
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: hp(3),
    alignSelf: "center",
  },
  toggleButton: {
    padding: wp(2.5),
    margin: wp(1),
    alignItems: "center",
    borderRadius: 25,
  },
  toggleButtonText: {
    color: "#555555",
    fontWeight: "bold",
    fontSize: 12,
  },
  bubble: {
    position: "absolute",
    width: wp(16),
    height: hp(4),
    backgroundColor: "#444444",
    borderRadius: 20,
    alignSelf: "center",
  },
  activeText: {
    color: "#fff",
  },
});

export default FriendsScreen;
