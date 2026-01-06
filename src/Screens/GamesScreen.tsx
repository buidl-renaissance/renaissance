import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MiniAppsGrid } from "../Components/MiniAppsGrid";
import { MiniApp } from "../interfaces";
import { theme } from "../colors";

interface GamesScreenProps {
  navigation: any;
}

const GamesScreen: React.FC<GamesScreenProps> = ({ navigation }) => {
  React.useEffect(() => {
    navigation.setOptions({
      title: "Games",
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

  // Games mini apps configuration
  const miniApps: MiniApp[] = React.useMemo(() => [
    {
      name: "mystic-island",
      title: "Mystic Island",
      url: "https://mystic-island.yourland.network/",
      emoji: "🏝️",
      backgroundColor: "#14B8A6",
    },
    {
      name: "beacon-hq",
      title: "Beacon HQ",
      url: "https://www.thebeaconhq.com/",
      emoji: "🎮",
      backgroundColor: "#059669",
    },
    {
      name: "collector-quest",
      title: "Collector Quest",
      url: "https://collectorquest.ai",
      emoji: "🏆",
      backgroundColor: "#3B82F6",
    },
  ], []);

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerOverlay}>
            <Text style={styles.headerEmoji}>🎮</Text>
            <Text style={styles.headerTitle}>Games & Entertainment</Text>
            <Text style={styles.headerSubtitle}>
              Explore gaming experiences and entertainment venues in Detroit
            </Text>
          </View>
        </View>

        {/* Mini Apps Section */}
        <View style={styles.miniAppsSection}>
          <MiniAppsGrid apps={miniApps} onPress={handleMiniAppPress} />
        </View>

        {/* Additional content section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Detroit Gaming Scene</Text>
          <Text style={styles.infoText}>
            From immersive virtual worlds to arcade bars and gaming lounges, 
            Detroit has a thriving gaming and entertainment community. 
            Explore local venues, connect with fellow gamers, and discover 
            new experiences.
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
    backgroundColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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

export default GamesScreen;
