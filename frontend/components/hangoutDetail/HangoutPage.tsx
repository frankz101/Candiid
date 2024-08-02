import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Dimensions,
  Pressable,
  Modal,
  Alert,
  FlatList,
} from "react-native";
import React, { useEffect, useState } from "react";
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
import UserBanner from "@/components/friends/UserBanner";
import useStore from "@/store/useStore";

interface HangoutPageProps {
  hangoutId: string;
}

const screenHeight = Dimensions.get("window").height;
const headerHeight = 140;
const bottomPadding = 20;

const scrollViewHeight = screenHeight - headerHeight - bottomPadding;

const HangoutPage: React.FC<HangoutPageProps> = ({ hangoutId }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [transferModalVisible, setTransferModalVisible] = useState(false);
  const router = useRouter();
  const { user } = useUser();
  const queryClient = useQueryClient();

  const fetchHangout = async () => {
    return axios
      .get(`${process.env.EXPO_PUBLIC_API_URL}/hangout/${hangoutId}`)
      .then((res) => res.data);
  };

  const fetchParticipants = async () => {
    if (hangoutData?.participantIds?.length > 0) {
      return axios
        .post(`${process.env.EXPO_PUBLIC_API_URL}/user/list`, {
          userIds: hangoutData.participantIds,
        })
        .then((res) => res.data);
    }
    return [];
  };

  const { data: hangoutData, isPending: isPendingHangout } = useQuery({
    queryKey: ["hangoutPhotos", hangoutId],
    queryFn: fetchHangout,
  });

  const { data: participants, isPending: isPendingParticipants } = useQuery({
    queryKey: ["hangoutParticipants", hangoutId],
    queryFn: fetchParticipants,
    enabled: !!hangoutData,
  });

  if (isPendingHangout || isPendingParticipants) {
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
            if (user?.id === hangoutData.userId) {
              ownerLeaveHangout();
            } else {
              router.back();
              const res = await axios.put(
                `${process.env.EXPO_PUBLIC_API_URL}/hangout/leave`,
                {
                  userId: user?.id,
                  hangoutId,
                }
              );
              queryClient.invalidateQueries({
                queryKey: ["upcomingHangouts", user?.id],
              });
              console.log(res.data);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const ownerLeaveHangout = () => {
    if (hangoutData.participantIds.length === 1) {
      deleteHangout();
    } else {
      Alert.alert(
        "You are the owner of this hangout",
        "Would you like to transfer ownership or delete the hangout?",
        [
          {
            text: "Transfer",
            style: "cancel",
            onPress: () => {
              setTransferModalVisible(true);
            },
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => {
              deleteHangout();
            },
          },
        ],
        { cancelable: true }
      );
    }
  };

  const removeParticipant = async (userId: string) => {
    Alert.alert(
      "Are you sure you want to remove this user?",
      "They will no longer be able to contribute to this hangout.",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Yes",
          style: "destructive",
          onPress: async () => {
            const res = await axios.put(
              `${process.env.EXPO_PUBLIC_API_URL}/hangout/leave`,
              {
                userId,
                hangoutId,
              }
            );
            //check if we need both are they the same
            queryClient.setQueryData(
              ["hangoutParticipants", hangoutId],
              (oldData: any) => {
                if (!Array.isArray(oldData)) return [];

                const updatedParticipants = oldData.filter(
                  (participant) => participant.id !== userId
                );

                return updatedParticipants;
              }
            );
            queryClient.setQueryData(
              ["participants", hangoutId],
              (oldData: any) => {
                if (!Array.isArray(oldData)) return [];

                const updatedParticipants = oldData.filter(
                  (participant) => participant.id !== userId
                );

                return updatedParticipants;
              }
            );
          },
        },
      ],
      { cancelable: true }
    );
  };

  const deleteHangout = async () => {
    router.back();
    const res = await axios.delete(
      `${process.env.EXPO_PUBLIC_API_URL}/hangout/delete/${hangoutId}`
    );
    queryClient.invalidateQueries({
      queryKey: ["upcomingHangouts", user?.id],
    });
    console.log(res.data);
  };

  const transferOwnership = async (hangoutId: string, newUserId: string) => {
    router.back();
    const res = await axios.put(
      `${process.env.EXPO_PUBLIC_API_URL}/hangout/transfer`,
      {
        hangoutId,
        userId: user?.id,
        newUserId,
      }
    );
    queryClient.setQueryData(["upcomingHangouts", user?.id], (oldData: any) => {
      if (!Array.isArray(oldData)) return [];

      const updatedHangouts = oldData.filter(
        (hangout) => hangout.id !== hangoutId
      );

      return updatedHangouts;
    });
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
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/(hangout)/InviteFriendsScreen",
                params: {
                  hangoutId: hangoutId,
                  hangoutName: hangoutData.hangoutName,
                  isPressedFromHangoutScreen: "true",
                },
              })
            }
          >
            <MaterialCommunityIcons name="share" size={30} color="#FFF" />
          </Pressable>

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
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={styles.sectionTwoText}>Participants</Text>
        <Pressable onPress={() => setEditModalVisible(true)}>
          <Text
            style={[
              styles.sectionTwoText,
              { color: "gray", fontWeight: "normal" },
            ]}
          >
            Show more
          </Text>
        </Pressable>
        <Modal
          transparent={true}
          animationType="slide"
          visible={editModalVisible}
        >
          <Pressable
            style={styles.bottomOverlay}
            onPress={() => setEditModalVisible(false)}
          >
            <View style={styles.bottomModalContainer}>
              <FlatList
                data={participants}
                renderItem={({ item }) => (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <UserBanner user={item} type="participants" />
                    </View>
                    {hangoutData.userId === user?.id &&
                      hangoutData.userId !== item.userId && (
                        <Pressable
                          style={{ paddingRight: wp(3) }}
                          onPress={() => removeParticipant(item.userId)}
                        >
                          <Ionicons
                            name="remove-outline"
                            color="gray"
                            size={20}
                          />
                        </Pressable>
                      )}
                  </View>
                )}
                keyExtractor={(item) => item.id}
              />
            </View>
          </Pressable>
        </Modal>
        <Modal
          transparent={true}
          animationType="slide"
          visible={transferModalVisible}
        >
          <Pressable
            style={styles.bottomOverlay}
            onPress={() => setTransferModalVisible(false)}
          >
            <View style={styles.bottomModalContainer}>
              <FlatList
                data={participants}
                renderItem={({ item }) => {
                  if (user?.id !== item.userId) {
                    return (
                      <Pressable
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                        onPress={() =>
                          transferOwnership(hangoutId, item.userId)
                        }
                      >
                        <View style={{ flex: 1 }}>
                          <UserBanner
                            user={item}
                            type="participants"
                            disabled={true}
                          />
                        </View>
                      </Pressable>
                    );
                  }
                  return null;
                }}
                keyExtractor={(item) => item.id}
              />
            </View>
          </Pressable>
        </Modal>
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
      <Pressable
        onPress={() =>
          router.push({
            pathname: "/(hangout)/ChatScreen",
            params: { hangoutId, name: hangoutData.hangoutName },
          })
        }
      >
        <Text style={{ color: "white" }}>Chat</Text>
      </Pressable>
    </BaseScreen>
  );
};

export default HangoutPage;

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
  bottomOverlay: {
    flex: 1,
  },
  bottomModalContainer: {
    position: "absolute",
    bottom: 0,
    width: wp(100),
    height: hp(80),
    backgroundColor: "#2a2a2d",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: hp(1),
  },
});
