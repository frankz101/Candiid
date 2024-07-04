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

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

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

  useEffect(() => {
    SplashScreen.preventAutoHideAsync();
    console.log("Main page UseEffect");

    const fetchDataAndNavigate = async () => {
      if (isSignedIn && user) {
        await queryClient.prefetchQuery({
          queryKey: ["profile", user.id],
          queryFn: fetchUser,
          staleTime: 1000 * 60 * 5,
        });
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
  }, [isLoaded, isSignedIn, user]);

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
