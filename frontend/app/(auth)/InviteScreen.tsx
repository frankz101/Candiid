import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";

type InviteScreenRouteParams = {
  userId: string;
};

// Define the type for the route prop
type InviteScreenRouteProp = RouteProp<
  { Invite: InviteScreenRouteParams },
  "Invite"
>;

const InviteScreen = () => {
  const route = useRoute<InviteScreenRouteProp>();
  const { userId } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Invite User ID: {userId}</Text>
    </View>
  );
};

export default InviteScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 18,
  },
});
