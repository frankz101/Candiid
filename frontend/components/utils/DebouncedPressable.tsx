import React, { useRef, useCallback } from "react";
import { Pressable, PressableProps } from "react-native";

interface DebouncedPressableProps extends PressableProps {
  onPress: () => void;
  resetDelay?: number; // Optional reset delay
}

const DebouncedPressable: React.FC<DebouncedPressableProps> = ({
  onPress,
  resetDelay = 1000, // Default reset delay of 1 second
  ...props
}) => {
  const isPressedRef = useRef(false);

  const handlePress = useCallback(() => {
    if (isPressedRef.current) return;
    isPressedRef.current = true;
    onPress();

    setTimeout(() => {
      isPressedRef.current = false;
    }, resetDelay);
  }, [onPress, resetDelay]);

  return <Pressable {...props} onPress={handlePress} />;
};

export default DebouncedPressable;
