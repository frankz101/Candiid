import React from "react";
import { StyleSheet, Text, View, FlatList } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

interface Item {
  id: string;
  title: string;
}

const data = Array.from({ length: 20 }, (_, i) => ({
  id: i.toString(),
  title: `Item ${i + 1}`,
}));

const renderItem = ({ item, index }: { item: Item; index: number }) => {
  const isEven = index % 2 === 0;
  const isFirstItem = index === 0;
  const style = isEven
    ? styles.evenItem
    : [styles.oddItem, { marginTop: isFirstItem ? 50 : -50 }];

  return (
    <View style={style}>
      <Text>{item.title}</Text>
    </View>
  );
};

const MemoriesScreen = () => {
  const numColumns = 2;
  const numRows = Math.ceil(data.length / numColumns);
  const itemHeight = 300;
  const itemWidth = 240;
  const marginTopAdjustment = 400;
  const containerHeight =
    numRows * itemHeight + (numRows - 1) * 8 + marginTopAdjustment;

  const containerWidth = numColumns * itemWidth + (numColumns - 1) * 16 + 400;

  const translateX = useSharedValue<number>(0);
  const translateY = useSharedValue<number>(0);

  const context = useSharedValue({ x: 0, y: 0 });

  const pan = Gesture.Pan()
    .onStart((e) => {
      context.value = { x: translateX.value, y: translateY.value };
    })
    .onUpdate((e) => {
      const newTranslateX = e.translationX + context.value.x;
      const newTranslateY = e.translationY + context.value.y;

      const maxX = containerWidth / 3.5;
      const maxY = containerHeight / 2.5;
      const minX = -containerWidth / 3.5;
      const minY = -containerHeight / 2.5;

      translateX.value = Math.max(minX, Math.min(maxX, newTranslateX));
      translateY.value = Math.max(minY, Math.min(maxY, newTranslateY));
    });

  const rStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
    };
  });

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.screen, rStyle]}>
        <View
          style={{
            height: containerHeight,
            width: containerWidth,
            backgroundColor: "black",
          }}
        >
          <FlatList
            data={data}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            numColumns={numColumns}
            scrollEnabled={false}
            contentContainerStyle={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          />
        </View>
      </Animated.View>
    </GestureDetector>
  );
};

export default MemoriesScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "grey",
    justifyContent: "center",
    alignItems: "center",
  },
  box: {
    width: 240,
    height: 300,
    backgroundColor: "blue",
  },
  evenItem: {
    backgroundColor: "#f9c2ff",
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    height: 300,
    width: 240,
  },
  oddItem: {
    backgroundColor: "#f9c2ff",
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    height: 300,
    width: 240,
  },
});
