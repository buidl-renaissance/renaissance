import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import AccountScreen from "../Screens/AccountScreen";
import ArtworkScreen from '../Screens/ArtworkScreen';
import BookmarksScreen from "../Screens/BookmarksScreen";
import CalendarScreen from "../Screens/CalendarScreen";
import ActivityScreen from "../Screens/ActivityScreen";
import AddContentScreen from "../Screens/AddContentScreen";
import CreateEventScreen from "../Screens/CreateEventScreen";
import FilesScreen from "../Screens/FilesScreen";
import ProposalCreationScreen from "../Screens/ProposalCreationScreen";
import ProposalListScreen from "../Screens/ProposalListScreen";
import ReviewEventsScreen from "../Screens/ReviewEventsScreen";
import EventEditScreen from "../Screens/EventEditScreen";
import AudioContentScreen from "../Screens/AudioContentScreen";
import NFCScreen from "../Screens/NFCScreen";
import ShareScreen from "../Screens/ShareScreen";
import MapScreen from "../Screens/MapScreen";
import BrowseMap from "../Screens/BrowseMapScreen";
import ChatScreen from "../Screens/ChatScreen";
import EventScreen from "../Screens/EventScreen";
import SearchScreen from "../Screens/SearchScreen";
import ContentUploadScreen from "../Screens/ContentUploadScreen";
import CreateFlyerScreen from "../Screens/CreateFlyerScreen";
import DPoPAuthScreen from "../Screens/DPoPAuthScreen";
import VerifyScreen from "../Screens/VerifyScreen";
// import SplashScreen from '../Screens/SplashScreen';

type HomeNavigationStackParamList = {
  Account: undefined;
  Activity: undefined;
  AudioContent: undefined;
  Artist: undefined;
  Artwork: undefined;
  AddContent: undefined;
  Bookmarks: undefined;
  BrowseMap: undefined;
  Calendar: undefined;
  Camera: undefined;
  ContentUpload: undefined;
  Chat: undefined;
  Collect: undefined;
  CreateEvent: undefined;
  CreateFlyer: undefined;
  CreateProposal: undefined;
  NFC: undefined;
  CreateGrant: undefined;
  DPoPAuth: undefined;
  Event: undefined;
  EventEdit: undefined;
  Files: undefined;
  GetStarted: undefined;
  GrantCreate: undefined;
  Home: undefined;
  Map: undefined;
  ProposalList: undefined;
  ProposalDetail: undefined;
  ReviewEvents: undefined;
  Search: undefined;
  Share: undefined;
  Splash: undefined;
  Verify: undefined;
};

const Stack = createStackNavigator<HomeNavigationStackParamList>();

const HomeNavigationStack = () => {
  return (
    <Stack.Navigator>
      {/* <Stack.Screen
        component={GetStartedScreen}
        name="GetStarted"
        options={{
          headerStyle: {
            backgroundColor: "#d2e4dd",
          },
          headerTintColor: "#000",
        }}
      /> */}
      <Stack.Screen
        component={CalendarScreen}
        name="Calendar"
        options={{
          headerStyle: {
            backgroundColor: "#d2e4dd",
          },
          headerTintColor: "#000",
        }}
      />
      <Stack.Screen
        component={DPoPAuthScreen}
        name="DPoPAuth"
        options={{
          headerStyle: {
            backgroundColor: "#d2e4dd",
          },
          headerTintColor: "#000",
        }}
      />
      <Stack.Screen
        component={VerifyScreen}
        name="Verify"
        options={{
          headerStyle: {
            backgroundColor: "#d2e4dd",
          },
          headerTintColor: "#000",
        }}
      />
      <Stack.Screen
        component={ProposalCreationScreen}
        name="CreateProposal"
        options={{
          headerStyle: {
            backgroundColor: "#d2e4dd",
          },
          headerTintColor: "#000",
        }}
      />
      <Stack.Screen
        component={ReviewEventsScreen}
        name="ReviewEvents"
        options={{
          headerStyle: {
            backgroundColor: "#d2e4dd",
          },
          headerTintColor: "#000",
        }}
      />
      <Stack.Screen
        component={ChatScreen}
        name="Chat"
        options={{
          headerStyle: {
            backgroundColor: "#d2e4dd",
          },
          headerTintColor: "#000",
        }}
      />
      <Stack.Screen
        component={ActivityScreen}
        name="Activity"
        options={{
          headerStyle: {
            backgroundColor: "#d2e4dd",
          },
          headerTintColor: "#000",
        }}
      />
      <Stack.Screen
        component={EventEditScreen}
        name="EventEdit"
        options={{
          headerStyle: {
            backgroundColor: "#d2e4dd",
          },
          headerTintColor: "#000",
        }}
      />
      <Stack.Screen
        component={CreateEventScreen}
        name="CreateEvent"
        options={{
          headerStyle: {
            backgroundColor: "#d2e4dd",
          },
          headerTintColor: "#000",
        }}
      />
      <Stack.Screen
        component={CreateFlyerScreen}
        name="CreateFlyer"
        options={{
          headerStyle: {
            backgroundColor: "#d2e4dd",
          },
          headerTintColor: "#000",
        }}
      />
      <Stack.Screen
        component={FilesScreen}
        name="Files"
        options={{
          headerStyle: {
            backgroundColor: "#d2e4dd",
          },
          headerTintColor: "#000",
        }}
      />
      <Stack.Screen
        component={ProposalListScreen}
        name="ProposalList"
        options={{
          headerStyle: {
            backgroundColor: "#d2e4dd",
          },
          headerTintColor: "#000",
        }}
      />
      <Stack.Screen
        component={NFCScreen}
        name="NFC"
        options={{
          headerStyle: {
            backgroundColor: "#d2e4dd",
          },
          headerTintColor: "#000",
        }}
      />
      <Stack.Screen
        component={AccountScreen}
        name="Account"
        options={{
          headerStyle: {
            backgroundColor: "#d2e4dd",
          },
          headerTintColor: "#000",
        }}
      />
      <Stack.Screen
        component={BookmarksScreen}
        name="Bookmarks"
        options={{
          headerStyle: {
            backgroundColor: "#d2e4dd",
          },
          headerTintColor: "#000",
        }}
      />
      <Stack.Screen
        component={BrowseMap}
        name="BrowseMap"
        options={{
          headerStyle: {
            backgroundColor: "#d2e4dd",
          },
          headerTintColor: "#000",
        }}
      />
      <Stack.Screen
        component={MapScreen}
        name="Map"
        options={{
          headerStyle: {
            backgroundColor: "#d2e4dd",
          },
          headerTintColor: "#000",
        }}
      />
      <Stack.Screen
        component={ShareScreen}
        name="Share"
        options={{
          headerStyle: {
            backgroundColor: "#d2e4dd",
          },
          headerTintColor: "#000",
        }}
      />
      <Stack.Screen
        component={ContentUploadScreen}
        name="ContentUpload"
        options={{
          headerStyle: {
            backgroundColor: "#d2e4dd",
          },
          headerTintColor: "#000",
        }}
      />
      <Stack.Screen
        component={SearchScreen}
        name="Search"
        options={{
          headerStyle: {
            backgroundColor: "#d2e4dd",
          },
          headerTintColor: "#000",
        }}
      />
      <Stack.Screen
        component={EventScreen}
        name="Event"
        options={{
          headerStyle: {
            backgroundColor: "#d2e4dd",
          },
          headerTintColor: "#000",
        }}
      />
      <Stack.Screen
        component={ArtworkScreen}
        name="Artwork"
        options={{
          headerStyle: {
            backgroundColor: "#d2e4dd",
          },
          headerTintColor: "#000",
        }}
      />
      <Stack.Screen
        component={AudioContentScreen}
        name="AudioContent"
        options={{
          headerStyle: {
            backgroundColor: "#d2e4dd",
          },
          headerTintColor: "#000",
        }}
      />
      <Stack.Screen
        component={AddContentScreen}
        name="AddContent"
        options={{
          headerStyle: {
            backgroundColor: "#d2e4dd",
          },
          headerTintColor: "#000",
        }}
      />
    </Stack.Navigator>
  );
};

export default HomeNavigationStack;
