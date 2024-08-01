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

const FriendsScreen = () => {
  const [isSearch, setIsSearch] = useState(true);
  const { id } = useLocalSearchParams();
  const { user } = useUser();

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
      <BackButton />
      <View style={styles.container}>
        {isSearch ? <SearchFriends /> : <FriendsList />}
        <View style={styles.toggleContainer}>
          <Animated.View
            style={[styles.bubble, { transform: [{ translateX }] }]}
          />
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => toggle(true)}
          >
            <Text
              style={[styles.toggleButtonText, isSearch && styles.activeText]}
            >
              Search
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => toggle(false)}
          >
            <Text
              style={[styles.toggleButtonText, !isSearch && styles.activeText]}
            >
              Friends
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </BaseScreen>
  );
};

const styles = StyleSheet.create({
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
