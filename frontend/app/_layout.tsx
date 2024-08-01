import { ClerkProvider, useAuth, useUser } from "@clerk/clerk-expo";
import {
  QueryClientProvider,
  QueryClient,
  useQueryClient,
} from "@tanstack/react-query";
import { Slot, Stack, usePathname, useRouter, useSegments } from "expo-router";
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
import { usePushNotifications } from "@/hooks/usePushNotifications";
import * as Linking from "expo-linking";

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
  const { expoPushToken } = usePushNotifications();
  const [deepLinkData, setDeepLinkData] = useState<{
    id?: string;
    hostname?: string;
  } | null>(null);
  const pathname = usePathname();

  SplashScreen.preventAutoHideAsync();
  setTimeout(SplashScreen.hideAsync, 1000);

  const handleDeepLink = (event: { url: string }) => {
    const { url } = event;
    const parsedUrl = Linking.parse(url);

    const { hostname, path } = parsedUrl;

    if (user && isSignedIn) {
      console.log(user.id, isSignedIn);
      if (hostname === "invite" && path) {
        console.log("signed in bringing");
        router.replace({
          pathname: "/(profile)/FriendsScreen",
          params: { id: path },
        });
      } else {
        console.warn("Invalid deep link or unsupported action:", parsedUrl);
      }
    } else {
      if (hostname && path) {
        if (pathname !== "/SignUpScreen") {
          router.replace("/(auth)/SignUpScreen");
        }
        setDeepLinkData({ id: path, hostname });
      } else {
        console.warn("Invalid deep link or unsupported action:", parsedUrl);
      }
    }
  };

  useEffect(() => {
    const subscription = Linking.addEventListener("url", handleDeepLink);

    return () => {
      subscription.remove();
    };
  }, []);

  const fetchUser = async () => {
    try {
      console.log("Fetching User Information in Initial Layout");
      return axios
        .get(`${process.env.EXPO_PUBLIC_API_URL}/users/${user?.id}/${user?.id}`)
        .then((res) => res.data);
    } catch (error) {
      console.error("Error prefetching user: ", error);
    }
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

        if (res.data && res.data) {
          registeredUsers = registeredUsers.concat(res.data);
        }
      }
      return registeredUsers;
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    SplashScreen.preventAutoHideAsync();

    const fetchDataAndNavigate = async () => {
      try {
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
          if (expoPushToken && expoPushToken.data) {
            await axios.post(
              `${process.env.EXPO_PUBLIC_API_URL}/notification/token`,
              {
                userId: user.id,
                pushToken: expoPushToken.data,
              }
            );
          }
        }
      } catch (error) {
        console.error("Error in prefetch: ", error);
      }

      SplashScreen.hideAsync();

      const inTabsGroup = segments[0] === "(tabs)";
      if (isSignedIn && !inTabsGroup) {
        router.replace("/(tabs)/");
        if (deepLinkData) {
          if (deepLinkData.hostname === "invite") {
            console.log("bringing after sign in");
            router.push({
              pathname: "/(profile)/FriendsScreen",
              params: { id: deepLinkData.id as string },
            });
          }
        }
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
          <InitialLayout />
          <Toast config={toastConfig} />
        </GestureHandlerRootView>
      </QueryClientProvider>
    </ClerkProvider>
  );
});

export default RootLayout;
