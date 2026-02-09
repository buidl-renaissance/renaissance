// Polyfills must be imported first
import "text-encoding-polyfill";

import React from "react";
import { LogBox } from "react-native";
import HomeNavigationStack from "./src/Navigation/HomeNavigationStack";

// Suppress deprecation warnings from react-native-render-html
// This is a known issue in the library that will be fixed in a future update
LogBox.ignoreLogs([
  "TNodeChildrenRenderer: Support for defaultProps will be removed from function components",
  "TRenderEngineProvider: Support for defaultProps will be removed from function components",
  "MemoizedTNodeRenderer: Support for defaultProps will be removed from memo components",
  /defaultProps.*will be removed/i, // Catch any other defaultProps warnings from the library
]);

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
  Alert,
} from "react-native";
import { useShareIntent } from "expo-share-intent";

import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

export const isReadyRef = React.createRef();

export const navigationRef = React.createRef();

import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { checkForUpdates } from "./src/utils/checkForUpdate";
import { AudioPlayerProvider } from "./src/context/AudioPlayer";
import { LocalStorageProvider } from "./src/context/LocalStorage";
import { FarcasterFrameProvider } from "./src/context/FarcasterFrame";
import { AuthProvider } from "./src/context/Auth";
import * as Linking from "expo-linking";

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
      // Auto-reload with latest update when coming back to foreground
      checkForUpdates({ autoReload: true });
    }
  };

  // Check for updates on initial app load and auto-reload if available
  React.useEffect(() => {
    checkForUpdates({ autoReload: true });
  }, []);

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
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
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
    // Helper function to extract token from authenticate deep link
    const extractAuthToken = (url: string): string | null => {
      if (!url.startsWith("renaissance://authenticate")) {
        return null;
      }
      try {
        // Parse the URL to extract the token query parameter
        const urlObj = new URL(url);
        return urlObj.searchParams.get("token");
      } catch (e) {
        // Fallback for URL parsing issues - try regex
        const match = url.match(/[?&]token=([^&]+)/);
        return match ? decodeURIComponent(match[1]) : null;
      }
    };

    // Helper function to navigate to Authenticate screen
    const navigateToAuthenticate = (token: string) => {
      console.log("[App] Navigating to Authenticate screen with token:", token);
      if (isReadyRef.current && navigationRef.current) {
        (navigationRef.current as any).navigate("Authenticate", { token });
      } else {
        // If navigation isn't ready yet, wait a bit and try again
        setTimeout(() => {
          if (isReadyRef.current && navigationRef.current) {
            (navigationRef.current as any).navigate("Authenticate", { token });
          }
        }, 500);
      }
    };

    const handleDeepLink = (event: { url: string }) => {
      console.log("[App] Deep link received:", event.url);
      
      const url = event.url;
      
      // Check if this is a QR authentication deep link
      const authToken = extractAuthToken(url);
      if (authToken) {
        console.log("[App] Authentication deep link detected, token:", authToken);
        navigateToAuthenticate(authToken);
        return;
      }
      
      // Check if this is a shared URL (http/https)
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
        
        // Check if this is a QR authentication deep link
        const authToken = extractAuthToken(url);
        if (authToken) {
          console.log("[App] Initial authentication deep link detected, token:", authToken);
          navigateToAuthenticate(authToken);
          return;
        }
        
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

  // Handle URLs shared from other apps via share sheet
  const { hasShareIntent, shareIntent, resetShareIntent } = useShareIntent();

  React.useEffect(() => {
    if (hasShareIntent && shareIntent) {
      console.log("[App] Received share intent:", shareIntent);
      
      // Extract the URL from the shared content
      const sharedUrl = shareIntent.webUrl || shareIntent.text;
      
      if (sharedUrl) {
        console.log("[App] Shared URL from share sheet:", sharedUrl);
        
        // Navigate to SharedURLScreen to process the URL
        const navigateToSharedURL = () => {
          if (isReadyRef.current && navigationRef.current) {
            (navigationRef.current as any).navigate("SharedURL", {
              url: sharedUrl,
            });
          } else {
            // If navigation isn't ready yet, wait and try again
            setTimeout(navigateToSharedURL, 500);
          }
        };
        
        navigateToSharedURL();
      }
      
      // Reset the share intent after handling
      resetShareIntent();
    }
  }, [hasShareIntent, shareIntent, resetShareIntent]);

  // Farcaster auth listener disabled
  // React.useEffect(() => {
  //   console.log("[App] Setting up Farcaster auth listener");
  //   const cleanup = setupFarcasterAuthListener();
  //   return cleanup;
  // }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      <LocalStorageProvider>
        <AuthProvider>
          <FarcasterFrameProvider>
            <AudioPlayerProvider>
              <BottomSheetModalProvider>
                <NavigationContainer
                  onReady={() => {
                    isReadyRef.current = true;
                  }}
                  ref={navigationRef}
                >
                  <HomeNavigationStack />
                </NavigationContainer>
              </BottomSheetModalProvider>
            </AudioPlayerProvider>
          </FarcasterFrameProvider>
        </AuthProvider>
      </LocalStorageProvider>
    </GestureHandlerRootView>
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
