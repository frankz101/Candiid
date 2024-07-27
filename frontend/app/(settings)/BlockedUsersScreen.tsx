import BackButton from "@/components/utils/BackButton";
import BaseScreen from "@/components/utils/BaseScreen";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useEffect, useState } from "react";
import {
  FlatList,
  ListRenderItem,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

interface BlockedUser {
  id: string;
  userId: string;
  username: string;
}

const BlockedUsersScreen = () => {
  const { user } = useUser();
  const [users, setUsers] = useState<BlockedUser[]>([]);
  const getBlockedUsers = async () => {
    const res = await axios.get(
      `${process.env.EXPO_PUBLIC_API_URL}/user/block/${user?.id}`
    );
    if (res.status === 201) {
      setUsers(res.data);
    }
  };
  useEffect(() => {
    getBlockedUsers();
  }, []);

  const unblockUser = async (id: string) => {
    const res = await axios.delete(
      `${process.env.EXPO_PUBLIC_API_URL}/user/unblock/${id}`
    );
    console.log(res.data);
    setUsers(users.filter((user) => user.id !== id));
  };

  const renderItem: ListRenderItem<BlockedUser> = ({ item, index }) => (
    <View style={styles.container}>
      <View style={{ flexDirection: "row", gap: wp(4) }}>
        <Text style={styles.index}>{index + 1}.</Text>
        <Text style={styles.text}>{item.username}</Text>
      </View>
      <Pressable onPress={() => unblockUser(item.id)}>
        <Ionicons name="close-outline" color="white" size={20} />
      </Pressable>
    </View>
  );
  return (
    <BaseScreen>
      <View style={styles.headerContainer}>
        <BackButton />
        <Text style={styles.headerText}>Blocked Users</Text>
      </View>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      ></FlatList>
    </BaseScreen>
  );
};

export default BlockedUsersScreen;

const styles = StyleSheet.create({
  headerContainer: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(3),
  },
  headerText: {
    position: "absolute",
    left: wp(20),
    right: wp(20),
    textAlign: "center",
    color: "white",
    fontWeight: "bold",
    fontSize: 20,
  },
  container: {
    paddingHorizontal: wp(4),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp(1),
  },
  index: {
    width: wp(4),
    textAlign: "center",
    color: "white",
    fontSize: 16,
  },
  text: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
