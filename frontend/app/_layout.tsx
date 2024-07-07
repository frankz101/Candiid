import { ClerkProvider, useAuth, useUser } from "@clerk/clerk-expo";
import { SheetProvider } from "react-native-actions-sheet";
import "@/components/utils/sheets";
import {
  QueryClientProvider,
  QueryClient,
  useQueryClient,
} from "@tanstack/react-query";
import { Slot, Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import React from "react";
import * as SplashScreen from "expo-splash-screen";
import { ImageBackground } from "react-native";
import Toast from "react-native-toast-message";
import toastConfig from "@/toastConfig";
import axios from "axios";
import Contacts, { Contact } from "react-native-contacts";

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

const BATCH_SIZE = 100;

interface User {
  userId: string;
  name: string;
  username: string;
  profilePhoto: {
    fileUrl: string;
  };
}

const InitialLayout = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const segments = useSegments();
  const router = useRouter();
  const queryClient = useQueryClient();

  SplashScreen.preventAutoHideAsync();
  setTimeout(SplashScreen.hideAsync, 1000);

  const fetchUser = async () => {
    console.log("Fetching User Information");
    return axios
      .get(`${process.env.EXPO_PUBLIC_API_URL}/users/${user?.id}/${user?.id}`)
      .then((res) => res.data);
  };

  const getContacts = async (): Promise<Contact[]> => {
    try {
      const contacts = await Contacts.getAll();
      const sortedContacts = contacts.sort((a: any, b: any) => {
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
    try {
      if (!user) {
        return;
      }
      const contacts = await getContacts();
      const phoneNumbers = contacts
        .map((contact) => contact.phoneNumbers.map((pn: any) => pn.number))
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
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    SplashScreen.preventAutoHideAsync();
    console.log("Main page UseEffect");

    const fetchDataAndNavigate = async () => {
      if (isSignedIn && user) {
        Promise.all([
          queryClient.prefetchQuery({
            queryKey: ["profile", user.id],
            queryFn: fetchUser,
            staleTime: 1000 * 60 * 5,
          }),
          queryClient.prefetchQuery({
            queryKey: ["registeredContacts", user.id],
            queryFn: fetchRegisteredContacts,
            staleTime: 1000 * 60 * 5,
          }),
        ]);
      }

      SplashScreen.hideAsync();

      const inTabsGroup = segments[0] === "(tabs)";
      if (isSignedIn && !inTabsGroup) {
        router.replace("/(tabs)/");
      } else if (!isSignedIn) {
        router.replace("/SignUpScreen");
      }
    };

    if (isLoaded) {
      fetchDataAndNavigate();
    }
  }, [isSignedIn]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(profile)" options={{ headerShown: false }} />
      <Stack.Screen name="(hangout)" options={{ headerShown: false }} />
    </Stack>
  );
};

const tokenCache = {
  async getToken(key: string) {
    try {
      return SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

const RootLayout = React.memo(() => {
  const queryClient = new QueryClient();
  console.log("Root Layout Rendered");
  return (
    <ClerkProvider
      publishableKey={CLERK_PUBLISHABLE_KEY!}
      tokenCache={tokenCache}
    >
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SheetProvider>
            <InitialLayout />
            <Toast config={toastConfig} />
          </SheetProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </ClerkProvider>
  );
});

export default RootLayout;
