import { Dimensions } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;
const postWidth = screenWidth / 2 - 15;
const postHeight = (postWidth * 5) / 4;

interface AnimatedPostProps {
  positionX: number;
  positionY: number;
}

const AnimatedPost = ({ positionX, positionY }: AnimatedPostProps) => {
  console.log("PositionX: " + positionX + " " + "PositionY: " + positionY);
  const postStyle = useAnimatedStyle(() => ({
    position: "absolute",
    width: postWidth,
    height: postHeight,
    borderRadius: 10,
    backgroundColor: "blue",
    transform: [{ translateX: positionX }, { translateY: positionY }],
  }));

  return <Animated.View style={postStyle} />;
};

export default AnimatedPost;
