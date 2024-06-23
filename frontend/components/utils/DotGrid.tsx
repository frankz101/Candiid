import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

interface DotGridProps {
  width: number;
  height: number;
}

const DotGrid: React.FC<DotGridProps> = () => {
  const dots = [];
  const dotSize = 4; // Size of each dot
  const spacing = 25; // Spacing between dots

  for (let x = 0; x < screenWidth; x += spacing) {
    for (let y = 0; y < screenHeight; y += spacing) {
      dots.push(
        <View
          key={`${x}-${y}`}
          style={{
            position: "absolute",
            left: x,
            top: y,
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 4,
            backgroundColor: "rgba(255, 255, 255, 0.5)", // Semi-transparent white
          }}
        />
      );
    }
  }

  return <View style={styles.gridContainer}>{dots}</View>;
};

const styles = StyleSheet.create({
  gridContainer: {
    position: "absolute",
    width: screenWidth,
    height: screenHeight,
  },
});

export default DotGrid;
