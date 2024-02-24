import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const MemoriesScreen = () => {
  const screenX = useSharedValue<number>(0);
  const screenY = useSharedValue<number>(0);

  const ballX = useSharedValue<number>(0);
  const ballY = useSharedValue<number>(0);

  const scale = useSharedValue<number>(1);

  const scaleContext = useSharedValue({ scale: 1 });
  const screenContext = useSharedValue({ x: 0, y: 0 });
  const ballContext = useSharedValue({ x: 0, y: 0 });
  const isBallActive = useSharedValue<boolean>(false);

  const screenPan = Gesture.Pan()
    .onStart((e) => {
      screenContext.value = {
        x: screenX.value * scale.value,
        y: screenY.value * scale.value,
      };
    })
    .onUpdate((e) => {
      if (!isBallActive.value) {
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

  const ballPan = Gesture.Pan()
    .onStart(() => {
      isBallActive.value = true;
      ballContext.value = {
        x: ballX.value * scale.value,
        y: ballY.value * scale.value,
      };
    })
    .onUpdate((e) => {
      let newBallX = (e.translationX + ballContext.value.x) / scale.value;
      let newBallY = (e.translationY + ballContext.value.y) / scale.value;

      const ballRadius = 25;

      const minX = -screenWidth / 2 + ballRadius;
      const maxX = screenWidth / 2 - ballRadius;
      const minY = -screenHeight / 2 + ballRadius;
      const maxY = screenHeight / 2 - ballRadius;

      ballX.value = Math.min(Math.max(newBallX, minX), maxX);
      ballY.value = Math.min(Math.max(newBallY, minY), maxY);
    })
    .onEnd(() => {
      isBallActive.value = false;
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

  const ballStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: ballX.value }, { translateY: ballY.value }],
    };
  });

  return (
    <GestureDetector gesture={combinedGesture}>
      <Animated.View style={[styles.container, containerStyle]}>
        <GestureDetector gesture={ballPan}>
          <Animated.View style={[styles.ball, ballStyle]} />
        </GestureDetector>
      </Animated.View>
    </GestureDetector>
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
  ball: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
