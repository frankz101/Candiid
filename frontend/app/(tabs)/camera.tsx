// import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
// import React, { useCallback, useMemo, useRef, useState } from "react";
// import BaseScreen from "@/components/utils/BaseScreen";
// import {
//   BottomSheetModal,
//   BottomSheetView,
//   BottomSheetModalProvider,
// } from "@gorhom/bottom-sheet";
// import {
//   widthPercentageToDP as wp,
//   heightPercentageToDP as hp,
// } from "react-native-responsive-screen";
// import HangoutSelect from "@/components/camera/HangoutSelect";
// import CameraComponent from "@/components/camera/CameraComponent";
// import { useUser } from "@clerk/clerk-expo";
// import axios from "axios";
// import { useQuery } from "@tanstack/react-query";
// import { useRouter } from "expo-router";

// const Camera = () => {
//   const [selectedHangout, setSelectedHangout] = useState("Select Hangout");
//   const [selectedHangoutId, setSelectedHangoutId] = useState("");
//   const { user } = useUser();
//   const router = useRouter();

//   const bottomSheetModalRef = useRef<BottomSheetModal>(null);

//   const snapPoints = useMemo(() => ["25%", "50%", "90%"], []);

//   const handlePresentModalPress = useCallback(() => {
//     bottomSheetModalRef.current?.present();
//   }, []);
//   const handleSheetChanges = useCallback((index: number) => {
//     console.log("handleSheetChanges", index);
//   }, []);

//   const fetchHangouts = async () => {
//     console.log("Fetching Hangouts");
//     return axios
//       .get(`${process.env.EXPO_PUBLIC_API_URL}/hangouts/users/${user?.id}`)
//       .then((res) => res.data);
//   };

//   const { data: hangoutData, isPending } = useQuery({
//     queryKey: ["hangouts-1"],
//     queryFn: fetchHangouts,
//   });

//   const handleHangoutSelect = (name: string, id: string) => {
//     setSelectedHangout(name);
//     setSelectedHangoutId(id);
//     bottomSheetModalRef.current?.dismiss();
//   };

//   if (!isPending) {
//     console.log(hangoutData);
//   }
//   return (
//     <BottomSheetModalProvider>
//       <CameraComponent hangoutId={selectedHangoutId} />
//       <View style={styles.header}>
//         <Pressable onPress={handlePresentModalPress}>
//           <Text style={styles.hangoutName}>{selectedHangout}</Text>
//         </Pressable>
//       </View>
//       <BottomSheetModal
//         ref={bottomSheetModalRef}
//         index={1}
//         snapPoints={snapPoints}
//         onChange={handleSheetChanges}
//         enablePanDownToClose={true}
//         enableHandlePanningGesture={true}
//       >
//         <BottomSheetView style={styles.contentContainer}>
//           <FlatList
//             data={hangoutData}
//             keyExtractor={(item) => item.id}
//             renderItem={({ item }) => (
//               <HangoutSelect
//                 name={item.hangoutName}
//                 hangoutId={item.id}
//                 onSelect={handleHangoutSelect}
//               />
//             )}
//             ListEmptyComponent={
//               <View>
//                 <Pressable
//                   onPress={() => router.push("/(hangout)/CreateHangoutScreen")}
//                 >
//                   <Text>Create a hangout</Text>
//                 </Pressable>
//               </View>
//             }
//           />
//         </BottomSheetView>
//       </BottomSheetModal>
//     </BottomSheetModalProvider>
//   );
// };

// export default Camera;

// const styles = StyleSheet.create({
//   header: {
//     position: "absolute",
//     // left: "50%",
//     top: hp(6),
//     alignSelf: "center",
//     padding: wp(3),
//     borderRadius: 25,
//     backgroundColor: "rgba(44, 44, 48, 0.50)",
//   },
//   hangoutName: {
//     fontSize: 20,
//     fontFamily: "inter",
//     fontWeight: "700",
//     color: "#FFF",
//   },
//   contentContainer: {
//     flex: 1,
//     alignItems: "center",
//   },
// });
