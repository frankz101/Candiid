import React, { ReactNode } from "react";
import { SafeAreaView, StyleSheet, StyleProp, ViewStyle } from "react-native";

interface BaseScreenProps {
  children: ReactNode;
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
}

const BaseScreen: React.FC<BaseScreenProps> = ({
  children,
  backgroundColor = "#141417",
  style,
}) => {
  return (
    <SafeAreaView style={[styles.container, { backgroundColor }, style]}>
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default BaseScreen;
