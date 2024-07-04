import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import React, { useCallback, useMemo, useRef, useState } from "react";
import BaseScreen from "@/components/utils/BaseScreen";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import HangoutSelect from "@/components/camera/HangoutSelect";
import CameraComponent from "@/components/camera/CameraComponent";
import { useUser } from "@clerk/clerk-expo";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";

const Camera = () => {
  const { id, hangoutName } = useLocalSearchParams();
  const { user } = useUser();
  const router = useRouter();

  const fetchHangouts = async () => {
    console.log("Fetching Hangouts");
    return axios
      .get(`${process.env.EXPO_PUBLIC_API_URL}/hangouts/users/${user?.id}`)
      .then((res) => res.data);
  };

  const { data: hangoutData, isPending } = useQuery({
    queryKey: ["hangouts-3"],
    queryFn: fetchHangouts,
  });

  if (!isPending) {
    console.log(hangoutData);
  }
  return (
    <View style={{ flex: 1 }}>
      <CameraComponent hangoutId={id as string} />
      <View style={styles.header}>
        <Text style={styles.hangoutName}>{hangoutName}</Text>
      </View>
    </View>
  );
};

export default Camera;

const styles = StyleSheet.create({
  header: {
    position: "absolute",
    // left: "50%",
    top: hp(6),
    alignSelf: "center",
    padding: wp(3),
    borderRadius: 25,
    backgroundColor: "rgba(44, 44, 48, 0.50)",
  },
  hangoutName: {
    fontSize: 20,
    fontFamily: "inter",
    fontWeight: "700",
    color: "#FFF",
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
  },
});
