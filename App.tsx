import React from 'react';
import HomeNavigationStack from './src/Navigation/HomeNavigationStack';

// import * as SplashScreen from 'expo-splash-screen';
// SplashScreen.preventAutoHideAsync();

import { StatusBar } from 'react-native';

export const isReadyRef = React.createRef();

export const navigationRef = React.createRef();

import { NavigationContainer } from '@react-navigation/native';

export default function App() {
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
