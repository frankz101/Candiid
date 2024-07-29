import { Modal, Pressable } from "react-native";
import BaseScreen from "@/components/utils/BaseScreen";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import CreateHangout from "@/components/createHangout/CreateHangout";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const createHangout = () => {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setModalVisible(true);
      return () => setModalVisible(false);
    }, [])
  );
  return (
    <BaseScreen>
      <Modal animationType="slide" visible={modalVisible} transparent={true}>
        <Pressable
          onPress={() => {
            router.back();
          }}
        >
          <Ionicons
            style={{ marginTop: hp(8), marginLeft: wp(2) }}
            name="close-outline"
            size={32}
            color="white"
          />
        </Pressable>
        <CreateHangout />
      </Modal>
    </BaseScreen>
  );
};

export default createHangout;
