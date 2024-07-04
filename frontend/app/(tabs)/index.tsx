import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  Dimensions,
  ScrollView,
  RefreshControl,
} from "react-native";
import React, { useEffect, useState } from "react";
import { TabView, SceneMap } from "react-native-tab-view";
import { useRouter } from "expo-router";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useUser } from "@clerk/clerk-expo";
import axios from "axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Carousel from "react-native-reanimated-carousel";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import BaseScreen from "@/components/utils/BaseScreen";
import FeedPost from "@/components/home/FeedPost";
import CreateHangoutButton from "@/components/home/CreateHangoutButton";
import CompletedHangouts from "@/components/home/CompletedHangouts";
import ProfileTabBar from "@/components/home/ProfileTabBar";
import FreshHangouts from "@/components/home/FreshHangouts";
import Contacts, { Contact } from "react-native-contacts";

interface Photo {
  fileUrl: string;
  takenAt: string;
  takenBy: string;
}

const BATCH_SIZE = 100;

interface User {
  userId: string;
  name: string;
  username: string;
  profilePhoto: {
    fileUrl: string;
  };
}

const initialLayout = { width: Dimensions.get("window").width };
const screenWidth = Dimensions.get("screen").width;

const Home = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [index, setIndex] = useState(0);
  const queryClient = useQueryClient();
  const [routes] = useState([
    { key: "completedHangouts", title: "Completed Hangouts" },
    { key: "freshHangouts", title: "Fresh Hangouts" },
  ]);

  const renderScene = SceneMap({
    completedHangouts: () => (
      <CompletedHangouts refreshing={refreshing} onRefresh={onRefresh} />
    ),
    freshHangouts: () => (
      <FreshHangouts refreshing={refreshing} onRefresh={onRefresh} />
    ),
  });

  const router = useRouter();
  const { user } = useUser();
  const { expoPushToken, notification } = usePushNotifications();
  const data = JSON.stringify(notification, undefined, 2);
  console.log(expoPushToken?.data ?? "");

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  useEffect(() => {
    fetchRegisteredContacts();
  }, [user?.id]);

  const getContacts = async (): Promise<Contact[]> => {
    try {
      const contacts = await Contacts.getAll();
      const sortedContacts = contacts.sort((a: any, b: any) => {
        const nameA = a.givenName?.toLowerCase() || "";
        const nameB = b.givenName?.toLowerCase() || "";

        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;
        return 0;
      });
      return sortedContacts;
    } catch (err: any) {
      console.error(err);
      return [];
    }
  };

  const fetchRegisteredContacts = async () => {
    try {
      if (!user) {
        return;
      }
      const contacts = await getContacts();
      const phoneNumbers = contacts
        .map((contact) => contact.phoneNumbers.map((pn: any) => pn.number))
        .flat();

      let registeredUsers: User[] = [];

      for (let i = 0; i < phoneNumbers.length; i += BATCH_SIZE) {
        const batch = phoneNumbers.slice(i, i + BATCH_SIZE);
        const res = await axios.post(
          `${process.env.EXPO_PUBLIC_API_URL}/user/check-contacts`,
          {
            phoneNumbers: batch,
            userId: user?.id,
          }
        );

        if (res.data && res.data.result) {
          registeredUsers = registeredUsers.concat(res.data.result);
        }
      }

      const users = registeredUsers;
      queryClient.setQueryData(["registeredContacts"], users);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <BaseScreen>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require("../../assets/images/logo-white.png")}
          style={styles.logo}
        ></Image>
        <Pressable
          onPress={() => {
            router.push("/(profile)/NotificationsScreen");
          }}
          style={{ alignSelf: "center" }}
        >
          <Feather name="bell" size={32} color="#84848B" />
        </Pressable>
      </View>

      {/* TabBar Content */}
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={initialLayout}
        renderTabBar={(props) => <ProfileTabBar {...props} />}
      />
    </BaseScreen>
  );
};

export default Home;

const styles = StyleSheet.create({
  header: {
    height: hp("5%"),
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: wp(4),
    marginVertical: hp(1),
  },
  logo: {
    height: hp(4),
    width: wp(44),
  },
  tabBar: {
    height: hp("2%"),
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  tabTextStyle: {
    color: "#FFF",
    fontFamily: "Inter",
    fontSize: 14,
  },
  tabUnderline: {
    // width: wp("45%"),
    flexDirection: "row",
    justifyContent: "center",
  },
  main: {
    flexDirection: "row",
    justifyContent: "center",
  },
  createHangoutButton: {
    width: wp("95%"),
    aspectRatio: 4.5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#282828",
    backgroundColor: "rgba(44, 44, 48, 0.5)",
    marginTop: hp(2),
    justifyContent: "center",
    alignItems: "center",
  },
  createButtonContent: {
    color: "grey",
  },
  image: {
    width: screenWidth,
    height: screenWidth,
  },
  underline: {
    width: wp("47.5%"),
    height: 3,
    backgroundColor: "#FFF",
    marginTop: 2,
  },
});
