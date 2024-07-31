import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import axios from "axios";
import { useUser } from "@clerk/clerk-expo";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

interface Group {
  id: string;
  createdAt: Date;
  groupMemberIds: string[];
  groupName: string;
  owner: string;
}

const Groups = () => {
  const router = useRouter();
  const { user } = useUser();

  const fetchGroups = async () => {
    console.log("Fetching User Information in profile screen");
    return axios
      .get(`${process.env.EXPO_PUBLIC_API_URL}/group/users/${user?.id}`)
      .then((res) => res.data);
  };

  const { data: groupsData, isPending: isPendingGroups } = useQuery({
    queryKey: ["groups", user?.id],
    queryFn: fetchGroups,
    staleTime: 1000 * 60 * 5,
  });

  const renderGroups = ({ item, index }: { item: Group; index: number }) => {
    if (item.id === "plusButton") {
      return (
        <Pressable
          style={styles.groupItem}
          onPress={() => router.push("/(groups)/CreateGroupScreen")}
        >
          <Ionicons name="add" size={32} color="#FFF" />
          <Text style={styles.groupItemText}>New Group</Text>
        </Pressable>
      );
    }

    return (
      <Pressable
        onPress={() =>
          router.push({
            pathname: `/(groups)/${item.id}`,
            params: { groupName: item.groupName },
          })
        }
      >
        <View style={styles.groupItem}>
          <Text style={styles.groupText}>{item.groupName}</Text>
        </View>
      </Pressable>
    );
  };

  const dataToRender =
    groupsData && groupsData.length > 0
      ? [...groupsData, { id: "plusButton" } as Group]
      : [{ id: "plusButton" } as Group];

  if (!isPendingGroups) {
    console.log(JSON.stringify(groupsData));
  }

  return (
    <View>
      <Text style={styles.groupsHeaderText}>Groups</Text>
      <FlatList
        data={dataToRender}
        renderItem={renderGroups}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        horizontal
      />
    </View>
  );
};

export default Groups;

const styles = StyleSheet.create({
  groupsHeaderText: {
    fontSize: 18,
    color: "#FFF",
    fontWeight: "bold",
    fontFamily: "Inter",
    margin: wp(2),
  },
  groupItem: {
    backgroundColor: "#202023",
    marginHorizontal: wp(2),
    borderRadius: 5,
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "center",
    aspectRatio: 2,
    width: wp("35%"),
  },
  groupItemText: {
    fontSize: 14,
    color: "#FFF",
    fontWeight: "bold",
    fontFamily: "Inter",
  },
  groupText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
  },
});
