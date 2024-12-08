import React from "react";
import HomeNavigationStack from "./src/Navigation/HomeNavigationStack";

// import * as SplashScreen from 'expo-splash-screen';
// SplashScreen.preventAutoHideAsync();

import {
  AppStateStatus,
  AppState,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Button,
} from "react-native";

import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

export const isReadyRef = React.createRef();

export const navigationRef = React.createRef();

import { NavigationContainer } from "@react-navigation/native";
import { checkForUpdates } from "./src/utils/checkForUpdate";
import { AudioPlayerProvider } from "./src/context/AudioPlayer";
import { LocalStorageProvider } from "./src/context/LocalStorage";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [expoPushToken, setExpoPushToken] = React.useState("");
  const [notification, setNotification] = React.useState(false);
  const notificationListener = React.useRef();
  const responseListener = React.useRef();

  const _handleAppStateChange = async (nextAppState: AppStateStatus) => {
    const appState = AppState.currentState;
    console.log("[AppReview] _handleAppStateChange", nextAppState, appState);
    if (appState?.match(/inactive|background/) && nextAppState === "active") {
      console.log("App has come to the foreground!");
      checkForUpdates();
    }
  };

  React.useEffect(() => {
    registerForPushNotificationsAsync().then((token) =>
      setExpoPushToken(token)
    );

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  React.useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      _handleAppStateChange
    );
    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <>
      <StatusBar barStyle="default" />
      <LocalStorageProvider>
        <AudioPlayerProvider>
          <NavigationContainer
            onReady={() => {
              isReadyRef.current = true;
            }}
            ref={navigationRef}
          >
            <HomeNavigationStack />
          </NavigationContainer>
        </AudioPlayerProvider>
      </LocalStorageProvider>
    </>
  );
}

const registerForPushNotificationsAsync = async () => {
  let token;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert(`Failed to get push token for push notification!, ${finalStatus}`);
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log(token);
  } else {
    alert("Must use physical device for Push Notifications");
  }

  return token;
};
