import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import AccountScreen from "../Screens/AccountScreen";
import AdminScreen from "../Screens/AdminScreen";
import ArtScreen from "../Screens/ArtScreen";
// import ArtistScreen from '../Screens/ArtistScreen';
import ArtworkScreen from '../Screens/ArtworkScreen';
import BookmarksScreen from "../Screens/BookmarksScreen";
import CalendarScreen from "../Screens/CalendarScreen";
// import CameraScreen from '../Screens/CameraScreen';
// import CollectScreen from '../Screens/CollectScreen';
import ActivityScreen from "../Screens/ActivityScreen";
import AddContentScreen from "../Screens/AddContentScreen";
import FilesScreen from "../Screens/FilesScreen";
import GrantCreationScreen from "../Screens/GrantCreationScreen";
import ProposalCreationScreen from "../Screens/ProposalCreationScreen";
import ProposalListScreen from "../Screens/ProposalListScreen";
import ProposalDetailScreen from "../Screens/ProposalDetailScreen";
import ReviewEventsScreen from "../Screens/ReviewEventsScreen";
import EventEditScreen from "../Screens/EventEditScreen";
import AudioContentScreen from "../Screens/AudioContentScreen";
import GetStartedScreen from "../Screens/GetStartedScreen";
import ShareScreen from "../Screens/ShareScreen";
import MapScreen from "../Screens/MapScreen";
import BrowseMap from "../Screens/BrowseMapScreen";
// import HomeScreen from '../Screens/HomeScreen';
import ChatScreen from "../Screens/ChatScreen";
import EventScreen from "../Screens/EventScreen";
import SearchScreen from "../Screens/SearchScreen";
import ContentUploadScreen from "../Screens/ContentUploadScreen";
import DPoPAuthScreen from "../Screens/DPoPAuthScreen";
import VerifyScreen from "../Screens/VerifyScreen";
import MiniAppScreen from "../Screens/MiniAppScreen";
import MiniAppsScreen from "../Screens/MiniAppsScreen";
import AccountManagementScreen from "../Screens/AccountManagementScreen";
import LoginScreen from "../Screens/LoginScreen";
import RestaurantsScreen from "../Screens/RestaurantsScreen";
import FarcasterProfileScreen from "../Screens/FarcasterProfileScreen";
import CalendarViewScreen from "../Screens/CalendarViewScreen";
import WalletScreen from "../Screens/WalletScreen";
// import SplashScreen from '../Screens/SplashScreen';

type HomeNavigationStackParamList = {
  Account: undefined;
  AccountManagement: undefined;
  Activity: undefined;
  Admin: undefined;
  Art: undefined;
  AudioContent: undefined;
  Artist: undefined;
  Artwork: undefined;
  AddContent: undefined;
  Bookmarks: undefined;
  BrowseMap: undefined;
  Calendar: undefined;
  CalendarView: { selectedDate?: string; eventsGroup?: any[] } | undefined;
  Camera: undefined;
  ContentUpload: undefined;
  Chat: undefined;
  Collect: undefined;
  CreateProposal: undefined;
  CreateFlyer: undefined;
  DPoPAuth: undefined;
  Event: undefined;
  EventEdit: undefined;
  Files: undefined;
  FarcasterProfile: undefined;
  GetStarted: undefined;
  CreateGrant: undefined;
  Home: undefined;
  Login: undefined;
  Map: undefined;
  MiniApp: { url?: string; title?: string; emoji?: string } | undefined;
  MiniApps: undefined;
  ProposalList: undefined;
  ProposalDetail: undefined;
  ReviewEvents: undefined;
  Restaurants: undefined;
  Search: undefined;
  Share: undefined;
  Splash: undefined;
  Verify: undefined;
  Wallet: undefined;
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
        component={CalendarViewScreen}
        name="CalendarView"
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
        component={GrantCreationScreen}
        name="CreateGrant"
        options={{
          headerStyle: {
            backgroundColor: "#d2e4dd",
          },
          headerTintColor: "#000",
        }}
      />
      <Stack.Screen
        component={ProposalDetailScreen}
        name="ProposalDetail"
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
        component={FarcasterProfileScreen}
        name="FarcasterProfile"
        options={{
          headerStyle: {
            backgroundColor: "#d2e4dd",
          },
          headerTintColor: "#000",
        }}
      />
      <Stack.Screen
        component={AdminScreen}
        name="Admin"
        options={{
          headerStyle: {
            backgroundColor: "#d2e4dd",
          },
          headerTintColor: "#000",
        }}
      />
      <Stack.Screen
        component={GetStartedScreen}
        name="GetStarted"
        options={{
          headerStyle: {
            backgroundColor: "#d2e4dd",
          },
          headerTintColor: "#000",
          title: "Get Connected",
        }}
      />
      <Stack.Screen
        component={LoginScreen}
        name="Login"
        options={{
          headerStyle: {
            backgroundColor: "#d2e4dd",
          },
          headerTintColor: "#000",
          title: "Sign In",
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
        component={ArtScreen}
        name="Art"
        options={{
          headerStyle: {
            backgroundColor: "#d2e4dd",
          },
          headerTintColor: "#000",
          title: "Art",
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
      <Stack.Screen
        component={MiniAppsScreen}
        name="MiniApps"
        options={{
          headerStyle: {
            backgroundColor: "#d2e4dd",
          },
          headerTintColor: "#000",
          title: "Mini Apps",
        }}
      />
      <Stack.Screen
        component={MiniAppScreen}
        name="MiniApp"
        options={{
          headerStyle: {
            backgroundColor: "#d2e4dd",
          },
          headerTintColor: "#000",
          title: "Mini App",
          animationEnabled: true,
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        component={AccountManagementScreen}
        name="AccountManagement"
        options={{
          headerStyle: {
            backgroundColor: "#d2e4dd",
          },
          headerTintColor: "#000",
          title: "Account",
        }}
      />
      <Stack.Screen
        component={WalletScreen}
        name="Wallet"
        options={{
          headerStyle: {
            backgroundColor: "#d2e4dd",
          },
          headerTintColor: "#000",
          title: "Wallet",
        }}
      />
      <Stack.Screen
        component={RestaurantsScreen}
        name="Restaurants"
        options={{
          headerStyle: {
            backgroundColor: "#d2e4dd",
          },
          headerTintColor: "#000",
          title: "Restaurants",
        }}
      />
    </Stack.Navigator>
  );
};

export default HomeNavigationStack;
