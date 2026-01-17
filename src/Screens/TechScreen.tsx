import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MiniAppsGrid } from "../Components/MiniAppsGrid";
import { MiniApp } from "../interfaces";
import { theme } from "../colors";

interface TechScreenProps {
  navigation: any;
}

const TechScreen: React.FC<TechScreenProps> = ({ navigation }) => {
  React.useEffect(() => {
    navigation.setOptions({
      title: "Tech",
    });
  }, [navigation]);

  const handleMiniAppPress = React.useCallback((app: MiniApp) => {
    navigation.push("MiniApp", {
      url: app.url,
      title: app.title,
      emoji: app.emoji,
      image: app.image,
    });
  }, [navigation]);

  // Tech mini apps configuration
  const miniApps: MiniApp[] = React.useMemo(() => {
    const apps: MiniApp[] = [
      {
        name: "vibe-code-detroit",
        title: "Vibe Code",
        url: "https://vibe.builddetroit.xyz/",
        backgroundColor: "#7C3AED",
        image: require("../../assets/vibe-code-detroit.png"),
      },
      {
        name: "d-newtech",
        title: "D-NewTech",
        url: "https://dnewtech.builddetroit.xyz/",
        backgroundColor: "#0EA5E9",
        image: require("../../assets/d-new-tech.png"),
      },
      {
        name: "djq",
        title: "DJQ",
        url: "https://djq.builddetroit.xyz/dashboard",
        backgroundColor: "#0D0D12",
        image: require("../../assets/djq-icon-texture.png"),
      },
      {
        name: "sponsorships",
        title: "Sponsorships",
        url: "https://sponsorships.builddetroit.xyz/",
        emoji: "💎",
        backgroundColor: "#8B5CF6",
      },
      {
        name: "create-app-block",
        title: "Create App Block",
        url: "https://create-app-block.builddetroit.xyz/",
        backgroundColor: "#0D0D12",
        image: require("../../assets/create-app-block.png"),
      },
    ];

    // Only show localhost apps in development environment
    if (__DEV__) {
      apps.push(
        {
          name: "localhost-3000",
          title: "Local :3000",
          url: "http://localhost:3000",
          emoji: "🔧",
          backgroundColor: "#059669",
        },
        {
          name: "localhost-3001",
          title: "Local :3001",
          url: "http://localhost:3001",
          emoji: "🔧",
          backgroundColor: "#0891B2",
        },
        {
          name: "localhost-3002",
          title: "Local :3002",
          url: "http://localhost:3002",
          emoji: "🔧",
          backgroundColor: "#7C3AED",
        },
        {
          name: "localhost-3003",
          title: "Local :3003",
          url: "http://localhost:3003",
          emoji: "🔧",
          backgroundColor: "#DB2777",
        },
        {
          name: "localhost-3004",
          title: "Local :3004",
          url: "http://localhost:3004",
          emoji: "🔧",
          backgroundColor: "#EA580C",
        },
      );
    }

    return apps;
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerOverlay}>
            <Text style={styles.headerEmoji}>💻</Text>
            <Text style={styles.headerTitle}>Tech & Innovation</Text>
            <Text style={styles.headerSubtitle}>
              Connect with Detroit's tech community, build projects, and collaborate
            </Text>
          </View>
        </View>

        {/* Mini Apps Section */}
        <View style={styles.miniAppsSection}>
          <MiniAppsGrid apps={miniApps} onPress={handleMiniAppPress} />
        </View>

        {/* Additional content section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Detroit Tech Community</Text>
          <Text style={styles.infoText}>
            Detroit's tech scene is thriving with meetups, hackathons, and 
            collaborative spaces. From Vibe Code sessions to D-NewTech monthly 
            gatherings, there are countless ways to connect with fellow 
            innovators and build something great together.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    width: "100%",
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a1a2e",
  },
  headerOverlay: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 16,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    backgroundColor: "#7C3AED",
  },
  headerEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 12,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 24,
  },
  miniAppsSection: {
    backgroundColor: theme.background,
    paddingVertical: 16,
  },
  infoSection: {
    backgroundColor: theme.surfaceElevated,
    marginHorizontal: 16,
    marginTop: 8,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.text,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 22,
  },
});

export default TechScreen;
