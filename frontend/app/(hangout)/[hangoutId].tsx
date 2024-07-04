import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Dimensions,
  Pressable,
  Modal,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useUser } from "@clerk/clerk-expo";

const screenHeight = Dimensions.get("window").height;
const headerHeight = 140;
const bottomPadding = 20;

const scrollViewHeight = screenHeight - headerHeight - bottomPadding;

const Hangout = () => {
  const { hangoutId, memoryId } = useLocalSearchParams();
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();
  const { user } = useUser();
  const queryClient = useQueryClient();
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

  const leaveHangout = () => {
    Alert.alert(
      "Are you sure you want to leave this hangout?",
      "You will no longer be able to access associated photos.",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Yes",
          style: "destructive",
          onPress: async () => {
            router.back();
            const res = await axios.put(
              `${process.env.EXPO_PUBLIC_API_URL}/hangout/leave`,
              {
                userId: user?.id,
                hangoutId,
              }
            );
            queryClient.invalidateQueries({ queryKey: ["hangouts"] });
            console.log(res.data.result);
          },
        },
      ],
      { cancelable: true }
    );
  };

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

        <View style={{ flexDirection: "row", gap: wp(2) }}>
          <MaterialCommunityIcons name="share" size={30} color="#FFF" />
          <Pressable onPress={() => setModalVisible(true)}>
            <Ionicons name="ellipsis-horizontal" size={30} color="#FFF" />
          </Pressable>
          <Modal transparent={true} animationType="fade" visible={modalVisible}>
            <Pressable
              style={styles.overlay}
              onPress={() => setModalVisible(false)}
            >
              <View style={styles.modalContainer}>
                <Pressable
                  style={({ pressed }) => [
                    styles.modalButton,
                    pressed
                      ? { backgroundColor: "#3a3a3d" }
                      : { backgroundColor: "#2a2a2d" },
                  ]}
                  onPress={() => {
                    setModalVisible(false);
                    leaveHangout();
                  }}
                >
                  <Text style={styles.modalButtonText}>Leave Hangout</Text>
                  <Ionicons name="exit-outline" color="red" size={24} />
                </Pressable>
              </View>
            </Pressable>
          </Modal>
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
  scrollViewContainer: {
    flexGrow: 1,
    height: scrollViewHeight,
  },
  modalContainer: {
    width: wp(50),
    maxWidth: wp(90),
    backgroundColor: "#d9d9d9",
    borderRadius: 10,
    overflow: "hidden",
  },
  modalButton: {
    paddingHorizontal: wp(3),
    paddingVertical: hp(1),
    borderBottomColor: "#4a4a4d",
    borderBottomWidth: 0.5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalButtonText: {
    color: "red",
    fontSize: 16,
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: hp(11),
    paddingRight: wp(3),
  },
});
