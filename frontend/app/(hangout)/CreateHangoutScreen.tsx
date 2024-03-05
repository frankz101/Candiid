import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import SearchBar from "@/components/utils/SearchBar";
import BackButton from "@/components/utils/BackButton";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "@clerk/clerk-expo";
import axios, { AxiosResponse } from "axios";
import { useRouter } from "expo-router";
import useStore from "@/store/useStore";
import { HangoutDetails } from "@/store/createHangoutSlice";

const CreateHangoutScreen = () => {
  const [clicked, setClicked] = useState(false);
  const [searchPhrase, setSearchPhrase] = useState("");
  const [hangoutName, setHangoutName] = useState("");
  const hangoutDetails = useStore((state) => state.hangoutDetails);
  const setHangoutDetails = useStore((state) => state.setHangoutDetails);

  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (hangoutDetails?.hangoutName) {
      setHangoutName(hangoutDetails.hangoutName);
    }
  }, [hangoutDetails]);

  const handleHangoutSubmit = async () => {
    const newHangoutDetails: HangoutDetails = {
      hangoutName: hangoutName,
    };

    console.log(hangoutName);
    console.log("First " + hangoutDetails);

    setHangoutDetails(newHangoutDetails);

    console.log("Second: " + hangoutDetails);

    router.push({
      pathname: "/(hangout)/MemoriesScreen",
      params: {
        newPost: "true",
      },
    });
  };

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
        <Text style={{ fontSize: 24 }}>Create a Hangout</Text>
        <View style={{ width: 32 }} />
      </View>
      <View style={styles.test}>
        <View style={{ alignSelf: "center" }}>
          <TextInput
            placeholder="what's your plan?"
            onChangeText={(input) => setHangoutName(input)} //CONSIDER CHANGING THIS TO ONSUBMITEDITING
            multiline={false} //change back to true later
            maxLength={90}
            value={hangoutName}
          />
        </View>
        <View>
          <Text style={{ alignSelf: "center", padding: 4 }}>
            Invite your Friends
          </Text>
          <SearchBar
            clicked={clicked}
            searchPhrase={searchPhrase}
            setSearchPhrase={setSearchPhrase}
            setClicked={setClicked}
          />
        </View>

        <View
          style={{
            alignItems: "flex-end",
          }}
        >
          <Pressable
            onPress={handleHangoutSubmit}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              padding: 8,
            }}
          >
            <Text>Create your hangout</Text>
            <Ionicons name="arrow-forward" size={32} />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default CreateHangoutScreen;

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
