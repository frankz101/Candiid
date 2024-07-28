import {
  Alert,
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useUser } from "@clerk/clerk-expo";
import {
  LongPressGestureHandler,
  State,
  TapGestureHandler,
} from "react-native-gesture-handler";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useRef, useState, useEffect } from "react";
import * as Haptics from "expo-haptics";

interface Hangout {
  hangoutName: string;
  hangoutDescription: string;
  id: string;
  participantIds: string[];
  participants: Participant[];
  userId: string;
}

interface Participant {
  userId: string;
  profilePhoto: null | { fileUrl: string };
}

const UpcomingHangouts = () => {
  const { user } = useUser();
  const fetchUpcomingHangouts = async () => {
    console.log("Fetching Upcoming Hangouts in Profile Tab");
    return axios
      .get(`${process.env.EXPO_PUBLIC_API_URL}/hangout/upcoming/${user?.id}`)
      .then((res) => res.data);
  };

  const { data: upcomingHangouts, isPending } = useQuery({
    queryKey: ["upcomingHangouts", user?.id],
    queryFn: fetchUpcomingHangouts,
    staleTime: 1000 * 60 * 5,
  });

  const router = useRouter();
  const [editMode, setEditMode] = useState(false);
  const scaleValues = useRef<{ [key: string]: Animated.Value }>({}).current;
  const rotationValue = useRef(new Animated.Value(0)).current;

  const queryClient = useQueryClient();

  useEffect(() => {
    if (editMode) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(rotationValue, {
            toValue: 1,
            duration: 200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(rotationValue, {
            toValue: -1,
            duration: 200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(rotationValue, {
            toValue: 1,
            duration: 200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(rotationValue, {
            toValue: -0.5,
            duration: 200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(rotationValue, {
            toValue: 0,
            duration: 200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      rotationValue.stopAnimation();
      rotationValue.setValue(0);
    }
  }, [editMode]);

  const getScaleValue = (hangoutId: string) => {
    if (!scaleValues[hangoutId]) {
      scaleValues[hangoutId] = new Animated.Value(1);
    }
    return scaleValues[hangoutId];
  };

  const handleLongPress = (
    { nativeEvent }: { nativeEvent: any },
    hangoutId: string
  ) => {
    const scaleValue = getScaleValue(hangoutId);
    if (nativeEvent.state === State.BEGAN) {
      Animated.spring(scaleValue, {
        toValue: 1.05,
        friction: 3,
        useNativeDriver: true,
      }).start();
    } else if (nativeEvent.state === State.ACTIVE) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setEditMode(true);
    } else if (
      nativeEvent.state === State.END ||
      nativeEvent.state === State.CANCELLED
    ) {
      Animated.spring(scaleValue, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleTap = (
    { nativeEvent }: { nativeEvent: any },
    hangoutId: string
  ) => {
    const scaleValue = getScaleValue(hangoutId);
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
    if (nativeEvent.state === State.END) {
      if (editMode) {
        setEditMode(false);
      } else {
        router.push(`/(hangout)/${hangoutId}`);
      }
    }
  };

  const leaveHangout = (hangout: Hangout) => {
    Alert.alert(
      "Are you sure you want to leave this hangout?",
      "You will no longer have access unless invited back.",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Yes",
          style: "destructive",
          onPress: async () => {
            if (user?.id === hangout.userId) {
              ownerLeaveHangout(hangout);
            } else {
              queryClient.setQueryData(
                ["upcomingHangouts", user?.id],
                (oldData: Hangout[]) =>
                  oldData.filter((oldHangout) => oldHangout.id !== hangout.id)
              );
              await axios.put(
                `${process.env.EXPO_PUBLIC_API_URL}/hangout/leave`,
                {
                  userId: user?.id,
                  hangoutId: hangout.id,
                }
              );
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const ownerLeaveHangout = (hangout: Hangout) => {
    if (hangout.participantIds.length === 1) {
      deleteHangout(hangout.id);
    } else {
      Alert.alert(
        "You are the owner of a hangout with multiple participants.",
        "Please click into the hangout to transfer ownership.",
        [
          {
            text: "OK",
            onPress: () => console.log("OK Pressed"),
          },
        ],
        { cancelable: false }
      );
    }
  };

  const deleteHangout = async (hangoutId: string) => {
    queryClient.setQueryData(
      ["upcomingHangouts", user?.id],
      (oldData: Hangout[]) =>
        oldData.filter((hangout) => hangout.id !== hangoutId)
    );
    await axios.delete(
      `${process.env.EXPO_PUBLIC_API_URL}/hangout/delete/${hangoutId}`
    );
  };

  const rotate = rotationValue.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ["-1deg", "0deg", "1deg"],
  });

  if (isPending) {
    return <Text>Loading</Text>;
  }

  return (
    <View>
      <Text style={styles.headerText}>Upcoming Hangouts</Text>
      <View style={styles.upcomingHangouts}>
        {upcomingHangouts && upcomingHangouts.length > 0 ? (
          upcomingHangouts.map((hangout: Hangout) => {
            const scaleValue = getScaleValue(hangout.id);
            return (
              <Animated.View
                style={{ transform: [{ scale: scaleValue }, { rotate }] }}
                key={hangout.id}
              >
                {editMode && (
                  <Pressable
                    style={styles.remove}
                    onPress={() => leaveHangout(hangout)}
                  >
                    <Ionicons
                      name="remove-circle"
                      size={32}
                      color="lightgray"
                    />
                  </Pressable>
                )}
                <LongPressGestureHandler
                  onHandlerStateChange={(e) => handleLongPress(e, hangout.id)}
                  minDurationMs={300}
                >
                  <TapGestureHandler
                    onHandlerStateChange={(e) => handleTap(e, hangout.id)}
                  >
                    <View style={styles.hangoutBanner}>
                      <View>
                        <Text style={styles.hangoutNameText}>
                          {hangout.hangoutName}
                        </Text>
                        <Text style={styles.hangoutDescriptionText}>
                          {hangout.hangoutDescription}
                        </Text>
                      </View>

                      <View style={styles.participants}>
                        {hangout.participants.map(
                          (participant: Participant, index: number) => {
                            return participant.profilePhoto ? (
                              <Image
                                key={participant.userId}
                                source={{
                                  uri: participant.profilePhoto.fileUrl,
                                }}
                                style={styles.participantPhoto}
                              />
                            ) : (
                              <View
                                key={participant.userId}
                                style={styles.participantPhoto}
                              >
                                <Ionicons
                                  name="person-circle"
                                  size={40}
                                  color="white"
                                />
                              </View>
                            );
                          }
                        )}
                        {hangout.participantIds.length > 2 && (
                          <View style={styles.additionalParticipants}>
                            <Text>+{hangout.participantIds.length - 2}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </TapGestureHandler>
                </LongPressGestureHandler>
              </Animated.View>
            );
          })
        ) : (
          <Pressable
            onPress={() => router.push("/(hangout)/CreateHangoutScreen")}
          >
            <View style={[styles.hangoutBanner, styles.emptyBanner]}>
              <AntDesign name="plus" size={48} color="#AEAEB4" />
            </View>
          </Pressable>
        )}
        {upcomingHangouts && upcomingHangouts.length % 2 == 1 && (
          <Pressable onPress={() => setEditMode(false)}>
            <View style={[styles.hangoutBanner, { opacity: 0 }]}></View>
          </Pressable>
        )}
      </View>
    </View>
  );
};

export default UpcomingHangouts;

const styles = StyleSheet.create({
  headerText: {
    marginTop: hp(2),
    color: "#FFF",
    fontFamily: "Inter",
    fontSize: 16,
    fontWeight: "bold",
  },
  upcomingHangouts: {
    marginVertical: hp(1),
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  remove: {
    position: "absolute",
    right: wp(-2),
    top: hp(-0.5),
    zIndex: 999,
  },
  hangoutBanner: {
    marginTop: hp(1),
    width: wp("47%"),
    aspectRatio: 4 / 5,
    backgroundColor: "#202023",
    borderRadius: 20,
    justifyContent: "space-between",
  },
  emptyBanner: {
    alignItems: "center",
    justifyContent: "center",
  },
  hangoutNameText: {
    paddingHorizontal: wp(3),
    paddingTop: hp(2),
    color: "#FFF",
    fontFamily: "Inter",
    fontSize: 18,
    fontWeight: "bold",
  },
  hangoutDescriptionText: {
    paddingTop: hp(1),
    paddingHorizontal: wp(3),
    fontFamily: "inter",
    fontSize: 12,
    color: "#FFF",
  },
  participants: {
    flexDirection: "row",
    alignSelf: "flex-end",
    padding: wp(4),
    gap: -wp(4),
  },
  participantPhoto: {
    height: 36,
    width: 36,
    borderRadius: 18,
    borderColor: "white",
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  additionalParticipants: {
    height: 36,
    width: 36,
    borderRadius: 18,
    backgroundColor: "#D9D9D9",
    borderColor: "white",
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
