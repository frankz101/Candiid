import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Dimensions,
  Pressable,
} from "react-native";
import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import BackButton from "@/components/utils/BackButton";
import SharedAlbumPreview from "@/components/hangoutDetail/SharedAlbumPreview";
import BaseScreen from "@/components/utils/BaseScreen";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import ParticipantsList from "@/components/hangoutDetail/ParticipantsList";
import CompleteHangoutButton from "@/components/hangoutDetail/CompleteHangoutButton";
import HangoutDetailCard from "@/components/hangoutDetail/HangoutDetailCard";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const screenHeight = Dimensions.get("window").height;
const headerHeight = 140;
const bottomPadding = 20;

const scrollViewHeight = screenHeight - headerHeight - bottomPadding;

const Hangout = () => {
  const { hangoutId, memoryId } = useLocalSearchParams();
  const router = useRouter();
  console.log("Memory ID Hangout: " + memoryId);

  const fetchHangout = async () => {
    return axios
      .get(`${process.env.EXPO_PUBLIC_API_URL}/hangout/${hangoutId}`)
      .then((res) => res.data);
  };

  const { data: hangoutData, isPending } = useQuery({
    queryKey: ["hangoutPhotos", hangoutId],
    queryFn: fetchHangout,
  });

  const handleInvite = () => {
    router.push({
      pathname: "/(hangout)/InviteFriendsScreen",
      params: {
        hangoutId: hangoutId,
        hangoutName: hangoutData.hangoutName,
        isPressedFromHangoutScreen: "true",
      },
    });
  };

  if (isPending) {
    return (
      <BaseScreen>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingBottom: 28,
          }}
        >
          <BackButton />
          <Text style={styles.headerText}>Loading...</Text>
          <View style={{ width: 32 }} />
        </View>
        <ActivityIndicator size="large" color="#FFF" />
      </BaseScreen>
    );
  }

  const latestPhotos = hangoutData.sharedAlbum?.slice(-6) || [];

  if (!isPending) {
    console.log(hangoutData);
  }

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

        <View style={{ flexDirection: "row" }}>
          <Pressable onPress={handleInvite}>
            <MaterialCommunityIcons name="share" size={32} color="#FFF" />
          </Pressable>
          <MaterialCommunityIcons name="dots-vertical" size={32} color="#FFF" />
        </View>
      </View>

      <View style={{ alignItems: "center", padding: wp(2) }}>
        <Text style={styles.headerText}>{hangoutData.hangoutName}</Text>
        <Text style={styles.descriptionText}>
          {hangoutData.hangoutDescription}
        </Text>
      </View>

      <View>
        <Text style={styles.sectionText}>All Photos</Text>
      </View>
      <View>
        <SharedAlbumPreview
          sharedAlbum={latestPhotos}
          hangoutId={hangoutId as string}
          hangoutName={hangoutData.hangoutName}
        />
      </View>
      <View>
        <Text style={styles.sectionTwoText}>Participants</Text>
      </View>
      {hangoutData && hangoutData.participantIds ? (
        <View>
          <ParticipantsList
            participants={hangoutData.participantIds}
            hangoutId={hangoutId as string}
          />
        </View>
      ) : null}
      <View
        style={{
          alignSelf: "center",
        }}
      >
        <CompleteHangoutButton hangoutId={hangoutId as string} />
      </View>
    </BaseScreen>
  );
};

export default Hangout;

const styles = StyleSheet.create({
  headerText: {
    fontSize: 30,
    fontFamily: "inter",
    fontWeight: "700",
    color: "#FFF",
  },
  descriptionText: {
    fontSize: 14,
    fontFamily: "inter",
    fontWeight: "500",
    color: "#FFF",
    padding: wp(1),
  },
  sectionText: {
    fontSize: 14,
    fontFamily: "inter",
    fontWeight: "700",
    padding: wp(2),
    color: "#FFF",
  },
  sectionTwoText: {
    fontSize: 14,
    fontFamily: "inter",
    fontWeight: "700",
    paddingTop: wp(4),
    paddingBottom: wp(2),
    paddingHorizontal: wp(2),
    color: "#FFF",
  },
  emptyAlbumContainer: {
    flex: 1,
    // justifyContent: "center",
    // alignItems: "center",
  },
  greyPost: {
    width: 100,
    height: 100,
    backgroundColor: "grey",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  scrollViewContainer: {
    flexGrow: 1,
    height: scrollViewHeight,
  },
});
