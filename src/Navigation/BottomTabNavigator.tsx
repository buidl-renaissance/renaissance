import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import HomeNavigationStack from "./HomeNavigationStack";
import { navigationRef } from "../../App";

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#3449ff",
        tabBarInactiveTintColor: "#999",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#e5e5e5",
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      <Tab.Screen
        name="HomeStack"
        component={HomeNavigationStack}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            // Navigate to Calendar screen when Home tab is pressed
            if (navigationRef.current?.isReady()) {
              navigationRef.current.navigate("HomeStack", { screen: "Calendar" });
            }
          },
        })}
      />
      <Tab.Screen
        name="SearchTab"
        component={HomeNavigationStack}
        options={{
          tabBarLabel: "Search",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={size} color={color} />
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            if (navigationRef.current?.isReady()) {
              navigationRef.current.navigate("HomeStack", { screen: "Search" });
            }
          },
        })}
      />
      <Tab.Screen
        name="AppsTab"
        component={HomeNavigationStack}
        options={{
          tabBarLabel: "Apps",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="apps" size={size} color={color} />
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            if (navigationRef.current?.isReady()) {
              navigationRef.current.navigate("HomeStack", { screen: "MiniApps" });
            }
          },
        })}
      />
      <Tab.Screen
        name="ChatTab"
        component={HomeNavigationStack}
        options={{
          tabBarLabel: "Chat",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-outline" size={size} color={color} />
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            if (navigationRef.current?.isReady()) {
              navigationRef.current.navigate("HomeStack", { screen: "Chat" });
            }
          },
        })}
      />
      <Tab.Screen
        name="NearbyTab"
        component={HomeNavigationStack}
        options={{
          tabBarLabel: "Nearby",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="location" size={size} color={color} />
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            if (navigationRef.current?.isReady()) {
              navigationRef.current.navigate("HomeStack", { screen: "BrowseMap" });
            }
          },
        })}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;

