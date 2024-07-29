import { Modal, Pressable, SafeAreaView } from "react-native";
import BaseScreen from "@/components/utils/BaseScreen";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import CreateHangoutScreen from "../(hangout)/CreateHangoutScreen";

const createHangout = () => {
  return (
    <BaseScreen>
      <CreateHangoutScreen />
    </BaseScreen>
  );
};

export default createHangout;
