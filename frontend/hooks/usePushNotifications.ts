import { useState, useEffect, useRef } from "react";
import { AppState, Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import axios from "axios";
import Toast from "react-native-toast-message";

export interface PushNotificationState {
  expoPushToken?: Notifications.ExpoPushToken;
  notification?: Notifications.Notification;
}

export const usePushNotifications = (): PushNotificationState => {
  const router = useRouter();
  const [appState, setAppState] = useState(AppState.currentState);
  const [expoPushToken, setExpoPushToken] = useState<
    Notifications.ExpoPushToken | undefined
  >();
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >();

  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  async function registerForPushNotificationsAsync() {
    let token;
    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        alert("Failed to get push token for push notification");
        return;
      }
      token = await Notifications.getExpoPushTokenAsync({
        projectId: "fc5076d9-8f6e-4b4c-bd9e-59b535b52c34",
      });
    } else {
      alert("Must be using a physical device for Push notifications");
    }

    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    return token;
  }

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      setAppState(nextAppState);
    });

    registerForPushNotificationsAsync().then(async (token) => {
      setExpoPushToken(token);
    });

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: false,
        shouldShowAlert: appState !== "active",
        shouldSetBadge: false,
      }),
    });

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
        if (appState === "active") {
          const { title, body } = notification.request.content;
          Toast.show({
            type: "info",
            text1: title as string,
            text2: body as string,
            position: "top",
            visibilityTime: 3000,
            onPress: () => {
              router.push("/(profile)/NotificationsScreen");
            },
          });
        }
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
        const screen = response.notification.request.content.data.screen;
        if (screen) {
          router.navigate(screen);
        }
      });

    return () => {
      subscription.remove();
      Notifications.removeNotificationSubscription(
        notificationListener.current!
      );
      Notifications.removeNotificationSubscription(responseListener.current!);
    };
  }, [appState]);

  return {
    expoPushToken,
    notification,
  };
};
