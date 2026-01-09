import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SectionTitle } from "../Components/SectionTitle";
import { ArtworkCard } from "../Components/ArtworkCard";
import { useArtworks } from "../hooks/useArtwork";
import { DAArtwork } from "../interfaces";
import { theme } from "../colors";
import { MiniAppsGrid } from "../Components/MiniAppsGrid";
import { MiniApp } from "../interfaces";

interface ArtScreenProps {
  navigation: any;
}

const ArtScreen: React.FC<ArtScreenProps> = ({ navigation }) => {
  const [artworks, loading] = useArtworks();

  React.useEffect(() => {
    navigation.setOptions({
      title: "Art",
    });
  }, [navigation]);

  const handleShowArtwork = React.useCallback((artwork: DAArtwork) => {
    navigation.push("Artwork", {
      artwork,
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


  // Memoize mini apps configuration
  const miniApps: MiniApp[] = React.useMemo(() => [
    {
      name: "art-detroit-now",
      title: "Art Detroit Now",
      url: "https://www.artdetroitnow.com/",
      backgroundColor: "#EC4899",
      image: require("../../assets/art-detroit-now.png"),
    },
    {
      name: "artclvb",
      title: "ArtClvb",
      url: "https://www.artclvb.xyz/",
      backgroundColor: "#10B981",
      image: require("../../assets/artclvb.jpg"),
    },
    {
      name: "be-the-light",
      title: "Be The Light",
      url: "https://bethelight222.com/",
      backgroundColor: "#14B8A6",
      image: require("../../assets/be-the-light.webp"),
    },
    {
      name: "heidelberg",
      title: "Heidelberg",
      url: "https://www.heidelberg.org/",
      backgroundColor: "#10B981",
      image: require("../../assets/heidelberg.png"),
    },
    {
      name: "art-park",
      title: "Art Park",
      url: "https://www.makeartworkdetroit.com/",
      backgroundColor: "#14B8A6",
      image: require("../../assets/make-art-work.png"),
    },
    // Publications & Blogs
    {
      name: "barbed-magazine",
      title: "Barbed Magazine",
      url: "https://barbedmagazine.com/",
      backgroundColor: "#8B5CF6",
      emoji: "🖼️",
    },
    {
      name: "runner-magazine",
      title: "Runner Magazine",
      url: "https://www.runnerdetroit.run/runnerart.html",
      backgroundColor: "#F59E0B",
      emoji: "📰",
    },
    {
      name: "feedspot-blogs",
      title: "Detroit Art Blogs",
      url: "https://blog.feedspot.com/detroit_art_blogs/",
      backgroundColor: "#EF4444",
      emoji: "📚",
    },
    // Major Art Institutions
    {
      name: "dia",
      title: "Detroit Institute of Arts",
      url: "https://dia.org/",
      backgroundColor: "#3B82F6",
      emoji: "🏛️",
    },
    {
      name: "dam",
      title: "Detroit Artists Market",
      url: "https://detroitartistsmarket.org/",
      backgroundColor: "#EC4899",
      emoji: "🎨",
    },
    {
      name: "scarab-club",
      title: "Scarab Club",
      url: "https://scarabclub.org/",
      backgroundColor: "#10B981",
      emoji: "🦋",
    },
    {
      name: "cranbrook",
      title: "Cranbrook Art Museum",
      url: "https://cranbrookartmuseum.org/",
      backgroundColor: "#14B8A6",
      emoji: "🏛️",
    },
  ], []);

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <ImageBackground
          source={require("../../assets/detroit-art.jpeg")}
          style={styles.header}
          imageStyle={styles.headerImage}
        >
          <View style={styles.headerOverlay}>
            <Text style={styles.headerTitle}>Detroit Arts</Text>
            <Text style={styles.headerSubtitle}>
              Explore galleries, murals, and creative spaces across the city
            </Text>
          </View>
        </ImageBackground>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={styles.loadingText}>Loading artwork...</Text>
          </View>
        ) : artworks && Array.isArray(artworks) && artworks.length > 0 ? (
          <>
            {/* Mini Apps Section */}
            <View style={styles.miniAppsSection}>
              <MiniAppsGrid apps={miniApps} onPress={handleMiniAppPress} />
            </View>

            <View style={styles.section}>
              <SectionTitle>FEATURED ARTWORK</SectionTitle>
              <ScrollView
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                style={styles.horizontalScroll}
                contentContainerStyle={styles.horizontalScrollContent}
              >
                {artworks.map((artwork) => {
                  if (!artwork.data?.image) return null;
                  return (
                    <TouchableOpacity
                      key={artwork.id}
                      style={styles.artworkCardContainer}
                      onPress={() => handleShowArtwork(artwork)}
                    >
                      <ArtworkCard
                        image={artwork.data?.image}
                        name={artwork.title}
                        description={artwork.description}
                      />
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🖼️</Text>
            <Text style={styles.emptyText}>No artwork available</Text>
            <Text style={styles.emptySubtext}>
              Check back soon for new artwork from Detroit artists
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
    height: 250,
    justifyContent: "center",
    alignItems: "center",
  },
  headerImage: {
    resizeMode: "cover",
    width: "100%",
    height: "100%",
  },
  headerOverlay: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 16,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
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
    marginTop: 4,
    textAlign: "center",
  },
  section: {
    backgroundColor: theme.background,
    paddingBottom: 24,
    marginBottom: 16,
  },
  horizontalScroll: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  horizontalScrollContent: {
    paddingRight: 16,
  },
  artworkCardContainer: {
    marginRight: 16,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 32,
    backgroundColor: theme.surfaceElevated,
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
  },
  emptyIcon: {
    fontSize: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.textSecondary,
    marginTop: 8,
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.textSecondary,
  },
  miniAppsSection: {
    backgroundColor: theme.background,
    paddingVertical: 16,
  },
});

export default ArtScreen;

