import { Pressable, StyleSheet, Text, View } from "react-native";
import React, { useCallback, useMemo, useRef, useState } from "react";
import BaseScreen from "@/components/utils/BaseScreen";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import HangoutSelect from "@/components/camera/HangoutSelect";
import CameraComponent from "@/components/camera/CameraComponent";

const tempHangoutData = [
  {
    id: "hangout_1",
    name: "Weekend BBQ",
  },
  {
    id: "hangout_2",
    name: "Beach Party",
  },
  {
    id: "hangout_3",
    name: "Mountain Hike",
  },
  {
    id: "hangout_4",
    name: "City Tour",
  },
  {
    id: "hangout_5",
    name: "Concert Night",
  },
  {
    id: "hangout_6",
    name: "Movie Marathon",
  },
  {
    id: "hangout_7",
    name: "Picnic Day",
  },
  {
    id: "hangout_8",
    name: "Sports Event",
  },
  {
    id: "hangout_9",
    name: "Art Exhibition",
  },
  {
    id: "hangout_10",
    name: "Food Festival",
  },
];

const Camera = () => {
  const [selectedHangout, setSelectedHangout] = useState("");

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const snapPoints = useMemo(() => ["25%", "50%", "90%"], []);

  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);
  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);

  // renders
  return (
    <BottomSheetModalProvider>
      <CameraComponent hangoutId={"1"} />
      <View style={styles.header}>
        <Pressable onPress={handlePresentModalPress}>
          <Text style={styles.hangoutName}>Hangout Name</Text>
        </Pressable>
      </View>
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={1}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        enablePanDownToClose={true}
        enableHandlePanningGesture={true}
      >
        <BottomSheetView style={styles.contentContainer}>
          <HangoutSelect name={"Hangout Name"} hangoutId={"1"} />
        </BottomSheetView>
      </BottomSheetModal>
    </BottomSheetModalProvider>
  );
};

export default Camera;

const styles = StyleSheet.create({
  header: {
    position: "absolute",
    // left: "50%",
    top: hp(6),
    alignSelf: "center",
    padding: wp(3),
    borderRadius: 25,
    backgroundColor: "rgba(44, 44, 48, 0.50)",
  },
  hangoutName: {
    fontSize: 20,
    fontFamily: "inter",
    fontWeight: "700",
    color: "#FFF",
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
  },
});
