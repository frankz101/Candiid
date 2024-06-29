import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, Image } from "react-native";
import Contacts, { Contact } from "react-native-contacts";
import BaseScreen from "../utils/BaseScreen";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@clerk/clerk-expo";
import UserBanner from "./UserBanner";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

interface User {
  userId: string;
  name: string;
  username: string;
  profilePhoto: {
    fileUrl: string;
  };
}

const ContactsList: React.FC = () => {
  const queryClient = useQueryClient();
  const registeredContacts = queryClient.getQueryData<User[]>([
    "registeredContacts",
  ]);

  const renderItem = ({ item }: { item: User }) => {
    return <UserBanner user={item} type="searchResults" />;
  };

  return (
    <BaseScreen>
      {registeredContacts && (
        <View style={styles.container}>
          <Text style={styles.header}>Active Contacts</Text>
          <FlatList
            data={registeredContacts}
            keyExtractor={(item) => item.userId}
            renderItem={renderItem}
          />
        </View>
      )}
    </BaseScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
    marginLeft: wp(3),
  },
});

export default ContactsList;
