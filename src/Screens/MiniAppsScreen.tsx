import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { lightGreen } from "../colors";
import { useAuth } from "../context/Auth";

interface MiniApp {
  id: string;
  name: string;
  description: string;
  url: string;
  icon: string;
  color: string;
}

const MINI_APPS: MiniApp[] = [
  {
    id: "art",
    name: "Art",
    description: "Discover and collect artwork from Detroit's vibrant art scene. Explore featured pieces and support local artists.",
    url: "native://Art", // Special URL to indicate native screen
    icon: "🎨",
    color: "#EC4899",
  },
  {
    id: "parking",
    name: "Parking",
    description: "Find and reserve parking spots in Detroit. Quick and easy parking solutions for events and daily needs.",
    url: "https://buymyspot.com/detroit",
    icon: "🅿️",
    color: "#10B981",
  },
  {
    id: "music",
    name: "Music",
    description: "Discover live music events, DJs, and nightlife in Detroit. Explore the city's vibrant electronic music scene.",
    url: "https://ra.co/events/us/detroit",
    icon: "🎵",
    color: "#F59E0B",
  },
  {
    id: "quests",
    name: "Quests",
    description: "Collect NFTs, complete quests, and earn rewards. Explore the world of digital collectibles and blockchain gaming.",
    url: "https://collectorquest.ai",
    icon: "🏆",
    color: "#3B82F6",
  },
  {
    id: "mystic-island",
    name: "Mystic Island",
    description: "Build. Connect. Grow. Communities forge realms, realms forge totems, totems forge worlds.",
    url: "https://mystic-island.yourland.network/",
    icon: "🏝️",
    color: "#6366F1",
  },
  // Add more mini apps here as they become available
];

interface MiniAppsScreenProps {
  navigation: any;
}

const MiniAppsScreen: React.FC<MiniAppsScreenProps> = ({ navigation }) => {
  const { state: authState } = useAuth();

  React.useEffect(() => {
    navigation.setOptions({
      title: "Mini Apps",
      headerRight: () => (
        <TouchableOpacity
          style={styles.headerAccountButton}
          onPress={() => navigation.navigate("AccountManagement")}
        >
          <Ionicons
            name={authState.isAuthenticated ? "person-circle" : "person-circle-outline"}
            size={28}
            color={authState.isAuthenticated ? "#6366F1" : "#666"}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation, authState.isAuthenticated]);

  const handleOpenApp = (app: MiniApp) => {
    // Check if this is a native screen
    if (app.url.startsWith("native://")) {
      const screenName = app.url.replace("native://", "");
      navigation.navigate(screenName);
    } else {
      // Open web-based mini app
      navigation.navigate("MiniApp", {
        url: app.url,
        title: app.name,
      });
    }
  };

  const getAuthStatusLabel = () => {
    if (!authState.isAuthenticated) return "Not signed in";
    if (authState.user?.type === "farcaster") return `@${authState.user.username || "farcaster"}`;
    if (authState.user?.type === "local_email") return authState.user.local?.email || "Email user";
    return "Guest";
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Auth Status Banner */}
        <TouchableOpacity
          style={[
            styles.authBanner,
            authState.isAuthenticated && styles.authBannerAuthenticated,
          ]}
          onPress={() => navigation.navigate("AccountManagement")}
        >
          <View style={styles.authBannerContent}>
            <Ionicons
              name={authState.isAuthenticated ? "checkmark-circle" : "alert-circle-outline"}
              size={20}
              color={authState.isAuthenticated ? "#10B981" : "#F59E0B"}
            />
            <View style={styles.authBannerText}>
              <Text style={styles.authBannerTitle}>
                {authState.isAuthenticated ? "Signed In" : "Sign in for full access"}
              </Text>
              <Text style={styles.authBannerSubtitle}>{getAuthStatusLabel()}</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>

        <View style={styles.header}>
          <Ionicons name="apps" size={48} color="#6366F1" />
          <Text style={styles.headerTitle}>Farcaster Mini Apps</Text>
          <Text style={styles.headerSubtitle}>
            Explore decentralized apps built on Farcaster
          </Text>
        </View>

        <View style={styles.appsContainer}>
          {MINI_APPS.map((app) => (
            <TouchableOpacity
              key={app.id}
              style={styles.appCard}
              onPress={() => handleOpenApp(app)}
              activeOpacity={0.7}
            >
              <View style={[styles.appIconContainer, { backgroundColor: app.color }]}>
                <Text style={styles.appIcon}>{app.icon}</Text>
              </View>
              <View style={styles.appInfo}>
                <Text style={styles.appName}>{app.name}</Text>
                <Text style={styles.appDescription} numberOfLines={2}>
                  {app.description}
                </Text>
              </View>
              <View style={styles.openButton}>
                <Text style={styles.openButtonText}>Open</Text>
                <Ionicons name="chevron-forward" size={16} color="#6366F1" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {MINI_APPS.length <= 4 && (
          <View style={styles.comingSoon}>
            <Ionicons name="rocket-outline" size={32} color="#999" />
            <Text style={styles.comingSoonText}>More apps coming soon!</Text>
            <Text style={styles.comingSoonSubtext}>
              Stay tuned for new apps and experiences
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightGreen,
  },
  scrollView: {
    flex: 1,
  },
  headerAccountButton: {
    padding: 8,
    marginRight: 8,
  },
  authBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FEF3C7",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
  },
  authBannerAuthenticated: {
    backgroundColor: "#D1FAE5",
  },
  authBannerContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  authBannerText: {
    marginLeft: 10,
    flex: 1,
  },
  authBannerTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  authBannerSubtitle: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  header: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginTop: 12,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 4,
    textAlign: "center",
  },
  appsContainer: {
    paddingHorizontal: 16,
  },
  appCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  appIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  appIcon: {
    fontSize: 28,
  },
  appInfo: {
    flex: 1,
    marginLeft: 14,
  },
  appName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  appDescription: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
    lineHeight: 18,
  },
  openButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  openButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6366F1",
    marginRight: 4,
  },
  comingSoon: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 16,
  },
  comingSoonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 12,
  },
  comingSoonSubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 4,
  },
});

export default MiniAppsScreen;

