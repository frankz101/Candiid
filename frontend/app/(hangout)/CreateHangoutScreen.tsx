import {
  Dimensions,
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
import { Feather, Ionicons } from "@expo/vector-icons";
import { useUser } from "@clerk/clerk-expo";
import axios, { AxiosResponse } from "axios";
import { useRouter } from "expo-router";
import useStore from "@/store/useStore";
import { HangoutDetails } from "@/store/createHangoutSlice";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import BaseScreen from "@/components/utils/BaseScreen";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { SceneMap, TabView } from "react-native-tab-view";
import ProfileTabBar from "@/components/home/ProfileTabBar";
import CreateHangout from "@/components/createHangout/CreateHangout";
import InviteFriends from "@/components/createHangout/InviteFriends";

const initialLayout = { width: Dimensions.get("window").width };

const CreateHangoutScreen = () => {
  return (
    <BaseScreen>
      {/* Header */}
      <View style={styles.header}>
        <Text
          style={{
            fontSize: 40,
            color: "#FFF",
            fontFamily: "Inter",
            fontStyle: "italic",
            fontWeight: "700",
          }}
        >
          candiid
        </Text>
        <Pressable style={{ alignSelf: "flex-start" }}>
          <Feather name="bell" size={32} color="#84848B" />
        </Pressable>
      </View>
      <CreateHangout />
    </BaseScreen>
  );
};

export default CreateHangoutScreen;

const styles = StyleSheet.create({
  header: {
    height: hp("5%"),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: wp(4),
    marginVertical: hp(1),
  },
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
