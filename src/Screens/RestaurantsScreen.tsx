import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MiniAppsGrid } from "../Components/MiniAppsGrid";
import { FeaturedRestaurantCard } from "../Components/FeaturedRestaurantCard";
import { MiniApp } from "../interfaces";
import { theme } from "../colors";

interface RestaurantsScreenProps {
  navigation: any;
}

const RestaurantsScreen: React.FC<RestaurantsScreenProps> = ({ navigation }) => {
  React.useEffect(() => {
    navigation.setOptions({
      title: "Restaurants",
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

  // Services (reservations, reviews, rankings)
  const servicesApps: MiniApp[] = React.useMemo(() => [
    {
      name: "best-of",
      title: "Best Of",
      url: "internal:BestOf",
      emoji: "🏆",
      backgroundColor: "#F59E0B",
      isInternal: true,
    },
    {
      name: "resy",
      title: "Resy",
      url: "https://resy.com/cities/det",
      emoji: "📅",
      backgroundColor: "#DC2626",
    },
    {
      name: "opentable",
      title: "OpenTable",
      url: "https://www.opentable.com/detroit-restaurants",
      emoji: "🍽️",
      backgroundColor: "#DC2626",
    },
    {
      name: "yelp",
      title: "Yelp Detroit",
      url: "https://www.yelp.com/detroit",
      emoji: "⭐",
      backgroundColor: "#EF4444",
    },
  ], []);

  // Publications
  const publicationsApps: MiniApp[] = React.useMemo(() => [
    {
      name: "eater-detroit",
      title: "Eater Detroit",
      url: "https://detroit.eater.com",
      emoji: "📰",
      backgroundColor: "#1F2937",
    },
    {
      name: "infatuation",
      title: "The Infatuation",
      url: "https://www.theinfatuation.com/detroit",
      emoji: "💯",
      backgroundColor: "#EF4444",
    },
  ], []);

  const handleAppPress = React.useCallback((app: MiniApp) => {
    if (app.isInternal && app.url === "internal:BestOf") {
      navigation.push("BestOf");
    } else {
      handleMiniAppPress(app);
    }
  }, [navigation, handleMiniAppPress]);

  const handleFeaturedPress = React.useCallback((url: string, title: string) => {
    navigation.push("MiniApp", {
      url,
      title,
    });
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerOverlay}>
            <Text style={styles.headerEmoji}>🍽️</Text>
            <Text style={styles.headerTitle}>Restaurants & Dining</Text>
            <Text style={styles.headerSubtitle}>
              Discover Detroit's best restaurants, book reservations, and explore the local food scene
            </Text>
          </View>
        </View>

        {/* Featured Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>FEATURED</Text>
          
          <FeaturedRestaurantCard
            title="Midnight Temple"
            tagline="Step into the Hidden Gem of Detroit"
            description="Authentic Indian dishes with rich flavors, traditions, and warmth. Eastern Market."
            image={require("../../assets/midnight-temple.jpg")}
            backgroundColor="#5B4B5B"
            onPress={() => handleFeaturedPress("https://midnighttemple.com/", "Midnight Temple")}
          />
          
          <FeaturedRestaurantCard
            title="Puma"
            tagline="Energetic. Raw. Chaotic. Fun."
            description="A party disguised as a restaurant. Bold flavors and unforgettable vibes."
            image={require("../../assets/puma.png")}
            backgroundColor="#C62828"
            onPress={() => handleFeaturedPress("https://www.pumadetroit.com/", "Puma")}
          />
        </View>

        {/* Services Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SERVICES</Text>
          <MiniAppsGrid apps={servicesApps} onPress={handleAppPress} />
        </View>

        {/* Publications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PUBLICATIONS</Text>
          <MiniAppsGrid apps={publicationsApps} onPress={handleAppPress} />
        </View>

        {/* Additional content section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Detroit's Culinary Scene</Text>
          <Text style={styles.infoText}>
            From iconic Coney Island diners to award-winning fine dining, Detroit's 
            food scene is thriving. Explore local favorites, discover hidden gems, 
            and support the restaurants that make our city delicious.
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
    backgroundColor: "#D97706",
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
  section: {
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.textSecondary,
    letterSpacing: 1,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  infoSection: {
    backgroundColor: theme.surfaceElevated,
    marginHorizontal: 16,
    marginTop: 16,
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

export default RestaurantsScreen;
