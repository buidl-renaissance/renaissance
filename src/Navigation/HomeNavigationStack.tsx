import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// import ArtistScreen from '../Screens/ArtistScreen';
// import ArtworkScreen from '../Screens/ArtworkScreen';
import CalendarScreen from '../Screens/CalendarScreen';
// import CameraScreen from '../Screens/CameraScreen';
// import CollectScreen from '../Screens/CollectScreen';
// import GetStartedScreen from '../Screens/GetStartedScreen';
// import MapScreen from '../Screens/MapScreen';
// import HomeScreen from '../Screens/HomeScreen';
import EventScreen from '../Screens/EventScreen';
// import SplashScreen from '../Screens/SplashScreen';


type HomeNavigationStackParamList = {
  Artist: undefined;
  Artwork: undefined;
  Calendar: undefined;
  Camera: undefined;
  Collect: undefined;
  GetStarted: undefined;
  Home: undefined;
  Event: undefined;
  Splash: undefined;
};

const Stack = createStackNavigator<HomeNavigationStackParamList>();

const HomeNavigationStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        component={CalendarScreen}
        name="Calendar"
        options={{
          headerStyle: {
            backgroundColor: '#d2e4dd',
          },
          headerTintColor: '#000',
        }}
      />
      {/* <Stack.Screen
        component={SplashScreen}
        name="Splash"
        options={{
          headerStyle: {
            backgroundColor: '#d2e4dd',
          },
          headerTintColor: '#000',
        }}
      />
      <Stack.Screen
        component={HomeScreen}
        name="Home"
        options={{
          headerStyle: {
            backgroundColor: '#d2e4dd',
          },
          headerTintColor: '#000',
        }}
      />
      <Stack.Screen
        component={GetStartedScreen}
        name="GetStarted"
        options={{
          headerStyle: {
            backgroundColor: '#d2e4dd',
          },
          headerTintColor: '#000',
        }}
      />
      <Stack.Screen
        component={MapScreen}
        name="Map"
        options={{
          headerStyle: {
            backgroundColor: '#d2e4dd',
          },
          headerTintColor: '#000',
        }}
      />
      <Stack.Screen
        component={CameraScreen}
        name="Camera"
        options={{
          headerStyle: {
            backgroundColor: '#d2e4dd',
          },
          headerTintColor: '#000',
        }}
      />
      <Stack.Screen
        component={CollectScreen}
        name="Collect"
        options={{
          headerStyle: {
            backgroundColor: '#d2e4dd',
          },
          headerTintColor: '#000',
        }}
      /> */}
      <Stack.Screen
        component={EventScreen}
        name="Event"
        options={{
          headerStyle: {
            backgroundColor: '#d2e4dd',
          },
          headerTintColor: '#000',
        }}
      />
      {/* <Stack.Screen
        component={ArtistScreen}
        name="Artist"
        options={{
          headerStyle: {
            backgroundColor: '#d2e4dd',
          },
          headerTintColor: '#000',
        }}
      />
      <Stack.Screen
        component={ArtworkScreen}
        name="Artwork"
        options={{
          headerStyle: {
            backgroundColor: '#d2e4dd',
          },
          headerTintColor: '#000',
        }}
      /> */}
    </Stack.Navigator>
  );
};

export default HomeNavigationStack;

// screenOptions={{
//     headerTintColor: colors.navigationTint,
//     headerStyle: { ...Styles.defaultHeaderStyle, backgroundColor: colors.navigationBackground },
//     headerTitleStyle: {
//       fontWeight: 'bold',
//       color: colors.text,
//     },
//   }}
