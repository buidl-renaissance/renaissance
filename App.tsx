import React from 'react';
import HomeNavigationStack from './src/Navigation/HomeNavigationStack';

// import * as SplashScreen from 'expo-splash-screen';
// SplashScreen.preventAutoHideAsync();

import { AppStateStatus, AppState, Platform, StatusBar, StyleSheet } from 'react-native';

export const isReadyRef = React.createRef();

export const navigationRef = React.createRef();

import { NavigationContainer } from '@react-navigation/native';
import { checkForUpdates } from './src/utils/checkForUpdate';


export default function App() {
  const _handleAppStateChange = async (nextAppState: AppStateStatus) => {
    const appState = AppState.currentState;
    console.log('[AppReview] _handleAppStateChange', nextAppState, appState);
    if (appState?.match(/inactive|background/) && nextAppState === 'active') {
      console.log('App has come to the foreground!');
      checkForUpdates();
    }
  };

  React.useEffect(() => {
    const subscription = AppState.addEventListener('change', _handleAppStateChange);
    return () => {
      subscription.remove()
    };
  }, []);
  
  return (
    <>
      <StatusBar barStyle="default" />
      <NavigationContainer
        onReady={() => {
          isReadyRef.current = true;
        }}
        ref={navigationRef}
      >
        <HomeNavigationStack />
      </NavigationContainer>
    </>
  );
}
