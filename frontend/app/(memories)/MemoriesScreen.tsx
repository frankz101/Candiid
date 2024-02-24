import { Ionicons } from "@expo/vector-icons";
import axios, { AxiosResponse } from "axios";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Dimensions, Pressable, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;
const postWidth = screenWidth / 2 - 15;
const postHeight = (postWidth * 5) / 4;

const MemoriesScreen = () => {
  const { hangoutId, newPost } = useLocalSearchParams();
  const isNewPost = newPost === "true";
  const [isPlacementMode, setIsPlacementMode] = useState(false);

  useEffect(() => {
    if (isNewPost) {
      setIsPlacementMode(true);
    }
  }, [isNewPost]);

  const screenX = useSharedValue<number>(0);
  const screenY = useSharedValue<number>(0);

  const postX = useSharedValue<number>(0);
  const postY = useSharedValue<number>(0);

  const scale = useSharedValue<number>(1);

  const scaleContext = useSharedValue({ scale: 1 });
  const screenContext = useSharedValue({ x: 0, y: 0 });
  const postContext = useSharedValue({ x: 0, y: 0 });
  const ispostActive = useSharedValue<boolean>(false);

  const screenPan = Gesture.Pan()
    .onStart((e) => {
      screenContext.value = {
        x: screenX.value * scale.value,
        y: screenY.value * scale.value,
      };
    })
    .onUpdate((e) => {
      if (!ispostActive.value) {
        let newX = (e.translationX + screenContext.value.x) / scale.value;
        let newY = (e.translationY + screenContext.value.y) / scale.value;

        const extraSpace = 50;
        const maxX = Math.max(
          0,
          ((screenWidth * scale.value - screenWidth) / 2 + extraSpace) /
            scale.value
        );
        const maxY = Math.max(
          0,
          ((screenHeight * scale.value - screenHeight) / 2 + extraSpace) /
            scale.value
        );
        const minX = -maxX;
        const minY = -maxY;

        screenX.value = Math.min(Math.max(newX, minX), maxX);
        screenY.value = Math.min(Math.max(newY, minY), maxY);
      }
    });

  const postPan = Gesture.Pan()
    .onStart(() => {
      ispostActive.value = true;
      postContext.value = {
        x: postX.value * scale.value,
        y: postY.value * scale.value,
      };
    })
    .onUpdate((e) => {
      let newpostX = (e.translationX + postContext.value.x) / scale.value;
      let newpostY = (e.translationY + postContext.value.y) / scale.value;

      const halfPostWidth = postWidth / 2;
      const halfPostHeight = postHeight / 2;

      const minX = -screenWidth / 2 + halfPostWidth;
      const maxX = screenWidth / 2 - halfPostWidth;
      const minY = -screenHeight / 2 + halfPostHeight;
      const maxY = screenHeight / 2 - halfPostHeight;

      postX.value = Math.min(Math.max(newpostX, minX), maxX);
      postY.value = Math.min(Math.max(newpostY, minY), maxY);
    })
    .onEnd(() => {
      ispostActive.value = false;
    });

  const pinch = Gesture.Pinch()
    .onStart((e) => {
      scaleContext.value = { scale: scale.value };
    })
    .onUpdate((e) => {
      const newScale = e.scale * scaleContext.value.scale;
      scale.value = Math.min(Math.max(newScale, 0.9), 2);
    });

  const combinedGesture = Gesture.Simultaneous(screenPan, pinch);

  const containerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { translateX: screenX.value },
        { translateY: screenY.value },
      ],
    };
  });

  const postStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: postX.value }, { translateY: postY.value }],
    };
  });

  return (
    <View style={{ flex: 1 }}>
      <GestureDetector gesture={combinedGesture}>
        <Animated.View style={[styles.container, containerStyle]}>
          {isPlacementMode && (
            <GestureDetector gesture={postPan}>
              <Animated.View style={[styles.post, postStyle]} />
            </GestureDetector>
          )}
        </Animated.View>
      </GestureDetector>
      {isPlacementMode && (
        <Pressable
          onPress={() => {
            router.push("/(tabs)/profile");
          }}
          style={{ position: "absolute", right: 14, bottom: 75 }}
        >
          <Ionicons name="checkmark-circle" size={64} />
        </Pressable>
      )}
    </View>
  );
};

export default MemoriesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "grey",
  },
  post: {
    width: postWidth,
    height: postHeight,
    borderRadius: 10,
    backgroundColor: "blue",
  },
});

// import React from "react";
// import { StyleSheet, Text, View, FlatList } from "react-native";
// import { Gesture, GestureDetector } from "react-native-gesture-handler";
// import Animated, {
//   useAnimatedStyle,
//   useSharedValue,
// } from "react-native-reanimated";

// interface Item {
//   id: string;
//   title: string;
// }

// const data = Array.from({ length: 20 }, (_, i) => ({
//   id: i.toString(),
//   title: `Item ${i + 1}`,
// }));

// const renderItem = ({ item, index }: { item: Item; index: number }) => {
//   const isEven = index % 2 === 0;
//   const isFirstItem = index === 0;
//   const style = isEven
//     ? styles.evenItem
//     : [styles.oddItem, { marginTop: isFirstItem ? 50 : -50 }];

//   return (
//     <View style={style}>
//       <Text>{item.title}</Text>
//     </View>
//   );
// };

// const MemoriesScreen = () => {
//   const numColumns = 2;
//   const numRows = Math.ceil(data.length / numColumns);
//   const itemHeight = 300;
//   const itemWidth = 240;
//   const marginTopAdjustment = 400;
//   const containerHeight =
//     numRows * itemHeight + (numRows - 1) * 8 + marginTopAdjustment;

//   const containerWidth = numColumns * itemWidth + (numColumns - 1) * 16 + 400;

//   const translateX = useSharedValue<number>(0);
//   const translateY = useSharedValue<number>(0);

//   const context = useSharedValue({ x: 0, y: 0 });

//   const pan = Gesture.Pan()
//     .onStart((e) => {
//       context.value = { x: translateX.value, y: translateY.value };
//     })
//     .onUpdate((e) => {
//       const newTranslateX = e.translationX + context.value.x;
//       const newTranslateY = e.translationY + context.value.y;

//       const maxX = containerWidth / 3.5;
//       const maxY = containerHeight / 2.5;
//       const minX = -containerWidth / 3.5;
//       const minY = -containerHeight / 2.5;

//       translateX.value = Math.max(minX, Math.min(maxX, newTranslateX));
//       translateY.value = Math.max(minY, Math.min(maxY, newTranslateY));
//     });

//   const rStyle = useAnimatedStyle(() => {
//     return {
//       transform: [
//         { translateX: translateX.value },
//         { translateY: translateY.value },
//       ],
//     };
//   });

//   return (
//     <GestureDetector gesture={pan}>
//       <Animated.View style={[styles.screen, rStyle]}>
//         <View
//           style={{
//             height: containerHeight,
//             width: containerWidth,
//             backgroundColor: "black",
//           }}
//         >
//           <FlatList
//             data={data}
//             renderItem={renderItem}
//             keyExtractor={(item) => item.id}
//             numColumns={numColumns}
//             scrollEnabled={false}
//             contentContainerStyle={{
//               flex: 1,
//               justifyContent: "center",
//               alignItems: "center",
//             }}
//           />
//         </View>
//       </Animated.View>
//     </GestureDetector>
//   );
// };

// export default MemoriesScreen;

// const styles = StyleSheet.create({
//   screen: {
//     flex: 1,
//     backgroundColor: "grey",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   box: {
//     width: 240,
//     height: 300,
//     backgroundColor: "blue",
//   },
//   evenItem: {
//     backgroundColor: "#f9c2ff",
//     padding: 20,
//     marginVertical: 8,
//     marginHorizontal: 16,
//     height: 300,
//     width: 240,
//   },
//   oddItem: {
//     backgroundColor: "#f9c2ff",
//     padding: 20,
//     marginVertical: 8,
//     marginHorizontal: 16,
//     height: 300,
//     width: 240,
//   },
// });
