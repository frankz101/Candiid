import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useUser } from "@clerk/clerk-expo";
import axios from "axios";
import { useRouter, useSegments } from "expo-router";
import useStore from "@/store/useStore";
// import { HangoutDetails } from "@/store/createHangoutSlice";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import BaseScreen from "@/components/utils/BaseScreen";
import SearchBar from "@/components/utils/SearchBar";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import DebouncedPressable from "../utils/DebouncedPressable";

interface User {
  userId: string;
  name: string;
  username: string;
  profilePhoto?: {
    fileUrl: string;
  };
  friends?: string[];
  phoneNumber: string;
  createdHangouts?: string[];
  upcomingHangouts?: string[];
}

const CreateHangout = () => {
  const [clicked, setClicked] = useState(false);
  const [searchPhrase, setSearchPhrase] = useState("");
  const [hangoutName, setHangoutName] = useState("");
  const [hangoutDescription, setHangoutDescription] = useState("");
  const { user } = useUser();
  const router = useRouter();
  const queryClient = useQueryClient();
  const segments = useSegments() as string[];

  const fetchFriends = async () => {
    return axios
      .get(`${process.env.EXPO_PUBLIC_API_URL}/user/${user?.id}/friends`)
      .then((res) => res.data);
  };

  const { data: friendsData, isPending } = useQuery({
    queryKey: ["friendsData", user?.id],
    queryFn: fetchFriends,
  });

  const handleHangoutSubmit = async () => {
    const hangoutData = {
      userId: user?.id,
      completed: false,
      hangoutName: hangoutName,
      hangoutDescription: hangoutDescription,
    };
    try {
      const hangoutResponse = await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/hangout`,
        hangoutData
      );
      const newHangout = hangoutResponse.data;

      const currentProfile = queryClient.getQueryData<User>([
        "profile",
        user?.id,
      ]);

      if (currentProfile && newHangout) {
        const updatedUpcomingHangouts = [
          ...(currentProfile.upcomingHangouts || []),
          newHangout,
        ];

        queryClient.setQueryData(["profile", user?.id], {
          ...currentProfile,
          upcomingHangouts: updatedUpcomingHangouts,
        });
      }

      const inTab = segments.includes("(tabs)");

      if (inTab) {
        router.push(`/(hangout)/${hangoutResponse.data}`);
        Keyboard.dismiss();
      } else {
        router.replace(`/(hangout)/${hangoutResponse.data}`);
      }
      await queryClient.invalidateQueries({
        queryKey: ["profile", user?.id],
      });

      await queryClient.invalidateQueries({
        queryKey: ["upcomingHangouts", user?.id],
      });

      setHangoutName("");
      setHangoutDescription("");
    } catch (error) {
      console.error("Error creating hangout:", error);
      return;
    }
  };

  const onSubmit = () => {}; // TODO: Implement search functionality
  const isSubmitDisabled = !hangoutName || !hangoutDescription;

  return (
    <BaseScreen>
      <Pressable style={styles.container} onPress={() => Keyboard.dismiss()}>
        <View style={styles.nameInputContainer}>
          <TextInput
            placeholder="what's your plan?"
            onChangeText={(input) => setHangoutName(input)}
            maxLength={37}
            value={hangoutName}
            accessibilityLabel="text-input"
            placeholderTextColor="#3F3F3F"
            cursorColor="white"
            style={styles.nameInput}
          />
          <Pressable>
            <TextInput
              placeholder="describe it :)"
              onChangeText={(input) => setHangoutDescription(input)}
              maxLength={150}
              value={hangoutDescription}
              accessibilityLabel="text-input"
              placeholderTextColor="#3F3F3F"
              cursorColor="white"
              style={styles.descriptionInput}
              multiline={true}
            />
          </Pressable>
        </View>
        <View style={styles.submitContainer}>
          <DebouncedPressable
            onPress={handleHangoutSubmit}
            style={[
              styles.submitButton,
              { opacity: isSubmitDisabled ? 0.5 : 1 },
            ]}
            accessibilityRole="button"
            disabled={isSubmitDisabled}
          >
            <Text style={{ color: "white" }}>Create your hangout</Text>
            <Ionicons name="arrow-forward" size={32} color="white" />
          </DebouncedPressable>
        </View>
      </Pressable>
    </BaseScreen>
  );
};

export default CreateHangout;

const styles = StyleSheet.create({
  header: {
    height: hp("5%"),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: wp(4),
    marginVertical: hp(1),
  },
  container: {
    flex: 1,
    alignItems: "center",
  },
  nameInputContainer: {
    backgroundColor: "rgba(44, 44, 48, 0.50)",
    width: wp("95%"),
    aspectRatio: 1.75,
    marginTop: hp(2),
    borderRadius: 15,
  },
  nameInput: {
    paddingHorizontal: wp(3),
    paddingTop: hp(2),
    paddingBottom: hp(1),
    fontFamily: "inter",
    fontSize: 24,
    fontWeight: "500",
    color: "#FFF",
  },
  descriptionInput: {
    width: "100%",
    height: hp(18),
    paddingHorizontal: wp(3),
    fontFamily: "inter",
    fontSize: 16,
    fontWeight: "500",
    color: "#FFF",
  },
  inviteText: {
    alignSelf: "center",
    padding: 4,
  },
  profilePhoto: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  friendItem: {
    flex: 1,
    padding: 7,
  },
  checkmarkIcon: {
    position: "absolute",
    right: 10,
    bottom: 15,
    color: "green",
  },
  submitContainer: {
    alignItems: "flex-end",
    marginTop: 20,
    width: "100%",
    paddingRight: 20,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
});
