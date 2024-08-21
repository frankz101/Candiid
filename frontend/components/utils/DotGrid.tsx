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

  // Calculate the number of dots that can fit horizontally and vertically
  const numberOfDotsX = Math.floor(screenWidth / spacing);
  const numberOfDotsY = Math.floor(screenHeight / spacing);

  // Calculate the offset needed to center the grid
  const offsetX = (screenWidth - (numberOfDotsX - 1) * spacing) / 2;
  const offsetY = (screenHeight - (numberOfDotsY - 1) * spacing) / 2;

  for (let i = 0; i < numberOfDotsX; i++) {
    for (let j = 0; j < numberOfDotsY; j++) {
      const x = offsetX + i * spacing;
      const y = offsetY + j * spacing;

      dots.push(
        <View
          key={`${x}-${y}`}
          style={{
            position: "absolute",
            left: x - dotSize / 2,
            top: y - dotSize / 2,
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
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
