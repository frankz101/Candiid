import { Pressable, StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import BaseScreen from "@/components/utils/BaseScreen";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Feather } from "@expo/vector-icons";
import { TextInput } from "react-native-gesture-handler";
import BackButton from "@/components/utils/BackButton";
import { useUser } from "@clerk/clerk-expo";
import axios from "axios";
import { useRouter } from "expo-router";

const CreateGroupScreen = () => {
  const [groupName, setGroupName] = useState("");
  const { user } = useUser();
  const router = useRouter();

  const handleGroupSubmit = async () => {
    const groupData = {
      owner: user?.id,
      groupName: groupName,
    };

    try {
      const groupResponse = await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/group`,
        groupData
      );

      console.log(groupResponse.data);

      router.push({
        pathname: "/(groups)/InviteGroupScreen",
        params: {
          groupId: groupResponse.data,
          groupName: groupName,
          isPressedFromGroupScreen: "false",
        },
      });
      setGroupName("");
    } catch (error) {
      console.error("Error creating hangout:", error);
      return;
    }
  };

  return (
    <BaseScreen>
      {/* Header */}
      <View style={styles.headerContainer}>
        <BackButton />
        <Pressable
          onPress={handleGroupSubmit}
          disabled={groupName.trim() === ""}
        >
          <Text
            style={{
              color: groupName.trim() === "" ? "grey" : "white",
              fontWeight: "bold",
              marginRight: wp(2),
            }}
          >
            Create
          </Text>
        </Pressable>
      </View>
      <View style={{ alignItems: "center" }}>
        <View style={styles.tempBox} />
        <TextInput
          style={styles.groupNameInput}
          placeholder="Group Name"
          placeholderTextColor="#3F3F3F"
          cursorColor="white"
          value={groupName}
          onChangeText={(input) => setGroupName(input)}
          maxLength={20}
        />
      </View>
    </BaseScreen>
  );
};

export default CreateGroupScreen;

const styles = StyleSheet.create({
  headerContainer: {
    position: "relative",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp(3),
    paddingHorizontal: wp(2),
  },
  header: {
    position: "absolute",
    left: wp(20),
    right: wp(20),
    textAlign: "center",
    color: "white",
    fontWeight: "bold",
    fontSize: 20,
  },
  tempBox: {
    width: wp(30),
    aspectRatio: 1,
    backgroundColor: "grey",
  },
  groupNameInput: {
    backgroundColor: "rgba(44, 44, 48, 0.50)",
    borderRadius: 15,
    width: wp(60),
    aspectRatio: 5,
    margin: hp(1),
    padding: wp(2),
    fontSize: 24,
    color: "#FFF",
    textAlign: "center",
  },
});
