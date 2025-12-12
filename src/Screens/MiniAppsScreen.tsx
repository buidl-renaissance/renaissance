import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { lightGreen } from "../colors";

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
  React.useEffect(() => {
    navigation.setOptions({
      title: "Mini Apps",
    });
  }, [navigation]);

  const handleOpenApp = (app: MiniApp) => {
    navigation.navigate("MiniApp", {
      url: app.url,
      title: app.name,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
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

        {MINI_APPS.length === 1 && (
          <View style={styles.comingSoon}>
            <Ionicons name="rocket-outline" size={32} color="#999" />
            <Text style={styles.comingSoonText}>More apps coming soon!</Text>
            <Text style={styles.comingSoonSubtext}>
              Stay tuned for new Farcaster mini apps
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

