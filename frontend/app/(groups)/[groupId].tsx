import { Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import BaseScreen from "@/components/utils/BaseScreen";
import BackButton from "@/components/utils/BackButton";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const Group = () => {
  const { groupId, groupName } = useLocalSearchParams();
  const router = useRouter();

  const fetchGroup = async () => {
    return axios
      .get(`${process.env.EXPO_PUBLIC_API_URL}/group/${groupId}`)
      .then((res) => res.data);
  };

  const { data: groupData, isPending: isPendingGroup } = useQuery({
    queryKey: ["group", groupId],
    queryFn: fetchGroup,
  });

  return (
    <BaseScreen>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: wp(1),
        }}
      >
        <BackButton />
        <Text style={styles.groupName}>{groupName}</Text>
        <View style={{ flexDirection: "row", gap: wp(2) }}>
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/(groups)/InviteGroupScreen",
                params: {
                  groupId: groupId,
                  groupName: groupData.groupName,
                  isPressedFromGroupScreen: "false",
                },
              })
            }
          >
            <MaterialCommunityIcons name="share" size={30} color="#FFF" />
          </Pressable>

          {/* <Pressable onPress={() => setModalVisible(true)}>
            <Ionicons name="ellipsis-horizontal" size={30} color="#FFF" />
          </Pressable> */}
        </View>
      </View>
    </BaseScreen>
  );
};

export default Group;

const styles = StyleSheet.create({
  groupName: {
    fontSize: 24,
    fontFamily: "inter",
    fontWeight: "700",
    color: "#FFF",
  },
});
