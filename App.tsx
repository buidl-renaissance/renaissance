// Polyfills must be imported first
import "text-encoding-polyfill";

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
import { FarcasterFrameProvider } from "./src/context/FarcasterFrame";
import { AuthProvider } from "./src/context/Auth";
import * as Linking from "expo-linking";
import { setupFarcasterAuthListener } from "./src/utils/farcasterAuth";

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

  // Handle deep links for auth callbacks and shared URLs
  React.useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      console.log("[App] Deep link received:", event.url);
      
      // Check if this is a shared URL (http/https)
      const url = event.url;
      if (url && (url.startsWith("http://") || url.startsWith("https://"))) {
        console.log("[App] Shared URL detected, navigating to MiniApp:", url);
        // Wait for navigation to be ready
        if (isReadyRef.current && navigationRef.current) {
          (navigationRef.current as any).navigate("MiniApp", {
            url: url,
            title: "Shared Link",
          });
        } else {
          // If navigation isn't ready yet, wait a bit and try again
          setTimeout(() => {
            if (isReadyRef.current && navigationRef.current) {
              (navigationRef.current as any).navigate("MiniApp", {
                url: url,
                title: "Shared Link",
              });
            }
          }, 500);
        }
        return;
      }
      
      // Deep links for auth sessions are handled by Neynar auth utilities
      // and by the navigation container for screen navigation
    };

    const subscription = Linking.addEventListener("url", handleDeepLink);

    // Check for initial URL (app opened via deep link or shared content)
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log("[App] Initial URL:", url);
        
        // Check if this is a shared URL (http/https)
        if (url && (url.startsWith("http://") || url.startsWith("https://"))) {
          console.log("[App] Initial shared URL detected, navigating to MiniApp:", url);
          // Wait for navigation to be ready
          if (isReadyRef.current && navigationRef.current) {
            (navigationRef.current as any).navigate("MiniApp", {
              url: url,
              title: "Shared Link",
            });
          } else {
            // If navigation isn't ready yet, wait a bit and try again
            setTimeout(() => {
              if (isReadyRef.current && navigationRef.current) {
                (navigationRef.current as any).navigate("MiniApp", {
                  url: url,
                  title: "Shared Link",
                });
              }
            }, 500);
          }
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Set up Farcaster auth listener
  React.useEffect(() => {
    console.log("[App] Setting up Farcaster auth listener");
    const cleanup = setupFarcasterAuthListener();
    return cleanup;
  }, []);

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      <LocalStorageProvider>
        <AuthProvider>
          <FarcasterFrameProvider>
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
          </FarcasterFrameProvider>
        </AuthProvider>
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
    // alert("Must use physical device for Push Notifications");
  }

  return token;
};
