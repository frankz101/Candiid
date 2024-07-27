import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
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
import { useRouter } from "expo-router";
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

const CreateHangout = () => {
  const [clicked, setClicked] = useState(false);
  const [searchPhrase, setSearchPhrase] = useState("");
  const [hangoutName, setHangoutName] = useState("");
  const [hangoutDescription, setHangoutDescription] = useState("");
  const hangoutDetails = useStore((state) => state.hangoutDetails);
  const setHangoutDetails = useStore((state) => state.setHangoutDetails);
  const { addFriend, removeFriend } = useStore();
  const { user } = useUser();
  const router = useRouter();
  const queryClient = useQueryClient();

  const fetchFriends = async () => {
    return axios
      .get(`${process.env.EXPO_PUBLIC_API_URL}/user/${user?.id}/friends`)
      .then((res) => res.data);
  };

  const { data: friendsData, isPending } = useQuery({
    queryKey: ["friendsData", user?.id],
    queryFn: fetchFriends,
  });

  useEffect(() => {
    if (hangoutDetails?.hangoutName) {
      setHangoutName(hangoutDetails.hangoutName);
    }
  }, [hangoutDetails]);

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
      console.log(hangoutResponse.data);

      await queryClient.invalidateQueries({ queryKey: ["hangouts", user?.id] });

      router.push({
        pathname: "/(hangout)/InviteFriendsScreen",
        params: {
          hangoutId: hangoutResponse.data.result,
          hangoutName: hangoutName,
          isPressedFromHangoutScreen: "false",
        },
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
      <View style={styles.container}>
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
      </View>
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
