import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, Image } from "react-native";
import Contacts, { Contact } from "react-native-contacts";
import BaseScreen from "../utils/BaseScreen";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@clerk/clerk-expo";
import UserBanner from "./UserBanner";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const BATCH_SIZE = 100;

interface User {
  userId: string;
  name: string;
  username: string;
  profilePhoto: {
    fileUrl: string;
  };
}

const ContactsList: React.FC = () => {
  const { user } = useUser();
  useEffect(() => {
    getContacts();
  }, []);

  const getContacts = async (): Promise<Contact[]> => {
    try {
      const contacts = await Contacts.getAll();
      const sortedContacts = contacts.sort((a, b) => {
        const nameA = a.givenName?.toLowerCase() || "";
        const nameB = b.givenName?.toLowerCase() || "";

        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;
        return 0;
      });
      return sortedContacts;
    } catch (err: any) {
      console.error(err);
      return [];
    }
  };

  const fetchRegisteredContacts = async () => {
    const contacts = await getContacts();
    const phoneNumbers = contacts
      .map((contact) => contact.phoneNumbers.map((pn) => pn.number))
      .flat();

    let registeredUsers: User[] = [];

    for (let i = 0; i < phoneNumbers.length; i += BATCH_SIZE) {
      const batch = phoneNumbers.slice(i, i + BATCH_SIZE);
      const res = await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/user/check-contacts`,
        {
          phoneNumbers: batch,
          userId: user?.id,
        }
      );

      if (res.data && res.data.result) {
        registeredUsers = registeredUsers.concat(res.data.result);
      }
    }

    return registeredUsers;
  };

  const {
    data: registeredContacts,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["registeredContacts"],
    queryFn: fetchRegisteredContacts,
  });

  const renderItem = ({ item }: { item: User }) => {
    return <UserBanner user={item} type="searchResults" />;
  };

  return (
    <BaseScreen>
      <View style={styles.container}>
        <Text style={styles.header}>Active Contacts</Text>
        <FlatList
          data={registeredContacts}
          keyExtractor={(item) => item.userId}
          renderItem={renderItem}
        />
      </View>
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
