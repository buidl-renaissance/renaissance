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

interface FitnessScreenProps {
  navigation: any;
}

const FitnessScreen: React.FC<FitnessScreenProps> = ({ navigation }) => {
  React.useEffect(() => {
    navigation.setOptions({
      title: "Fitness",
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

  // Fitness mini apps configuration
  const miniApps: MiniApp[] = React.useMemo(() => [
    {
      name: "dyno-detroit",
      title: "Dyno Detroit",
      url: "https://dynodetroit.com",
      emoji: "🧗",
      backgroundColor: "#DC2626",
    },
    {
      name: "hot-bones",
      title: "Hot Bones",
      url: "https://hotbones.com",
      emoji: "🧘",
      backgroundColor: "#F97316",
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
            <Text style={styles.headerEmoji}>💪</Text>
            <Text style={styles.headerTitle}>Fitness & Wellness</Text>
            <Text style={styles.headerSubtitle}>
              Discover climbing, yoga, and wellness experiences in Detroit
            </Text>
          </View>
        </View>

        {/* Mini Apps Section */}
        <View style={styles.miniAppsSection}>
          <MiniAppsGrid apps={miniApps} onPress={handleMiniAppPress} />
        </View>

        {/* Additional content section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Detroit Fitness Community</Text>
          <Text style={styles.infoText}>
            From world-class climbing gyms to hot yoga studios, Detroit offers 
            diverse fitness experiences for every level. Join the community, 
            challenge yourself, and discover new ways to stay active and healthy.
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
    backgroundColor: "#DC2626",
  },
  headerOverlay: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 16,
    width: "100%",
    height: "100%",
    justifyContent: "center",
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

export default FitnessScreen;
