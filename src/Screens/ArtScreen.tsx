import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ImageBackground,
  ActivityIndicator,
} from "react-native";
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

  const handleResourcePress = React.useCallback((url: string, title: string) => {
    navigation.push("MiniApp", {
      url,
      title,
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
  ], []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
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
        ) : artworks && artworks.length > 0 ? (
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

            {/* Art Resources Section */}
            <View style={styles.resourcesSection}>
              <SectionTitle>ART RESOURCES</SectionTitle>

              {/* Publications & Blogs */}
              <View style={styles.resourceCategory}>
                <Text style={styles.categoryTitle}>🖼️ Publications & Blogs</Text>
                <TouchableOpacity 
                  style={styles.resourceItem}
                  onPress={() => handleResourcePress("https://barbedmagazine.com/", "Barbed Magazine")}
                >
                  <Text style={styles.resourceName}>Barbed Magazine</Text>
                  <Text style={styles.resourceDescription}>Detroit-area art publication amplifying LGBTQ+ and BIPOC artists</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.resourceItem}
                  onPress={() => handleResourcePress("https://www.runnerdetroit.run/runnerart.html", "Runner Magazine - ART Section")}
                >
                  <Text style={styles.resourceName}>Runner Magazine – ART Section</Text>
                  <Text style={styles.resourceDescription}>Detroit grassroots arts coverage with studio visits, reviews and features</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.resourceItem}
                  onPress={() => handleResourcePress("https://blog.feedspot.com/detroit_art_blogs/", "Feedspot List of Detroit Art Blogs")}
                >
                  <Text style={styles.resourceName}>Feedspot List of Detroit Art Blogs</Text>
                  <Text style={styles.resourceDescription}>Community blogs like Mint Artists Guild, Art In Motion, BridgeDetroit Arts & Culture, and others</Text>
                </TouchableOpacity>
              </View>

              {/* Major Art Institutions */}
              <View style={styles.resourceCategory}>
                <Text style={styles.categoryTitle}>🖼️ Major Art Institutions</Text>
                <TouchableOpacity 
                  style={styles.resourceItem}
                  onPress={() => handleResourcePress("https://dia.org/", "Detroit Institute of Arts")}
                >
                  <Text style={styles.resourceName}>Detroit Institute of Arts (DIA)</Text>
                  <Text style={styles.resourceDescription}>Museum site with exhibitions, events, and news</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.resourceItem}
                  onPress={() => handleResourcePress("https://detroitartistsmarket.org/", "Detroit Artists Market")}
                >
                  <Text style={styles.resourceName}>Detroit Artists Market (DAM)</Text>
                  <Text style={styles.resourceDescription}>Contemporary art gallery promoting local artists (website has exhibitions/events)</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.resourceItem}
                  onPress={() => handleResourcePress("https://scarabclub.org/", "Scarab Club")}
                >
                  <Text style={styles.resourceName}>Scarab Club</Text>
                  <Text style={styles.resourceDescription}>Historic artist club/gallery offering exhibitions and programs</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.resourceItem}
                  onPress={() => handleResourcePress("https://cranbrookartmuseum.org/", "Cranbrook Art Museum")}
                >
                  <Text style={styles.resourceName}>Cranbrook Art Museum</Text>
                  <Text style={styles.resourceDescription}>Renowned regional art museum with online resources, exhibitions, and research</Text>
                </TouchableOpacity>
              </View>


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
  },
  horizontalScroll: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
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
  resourcesSection: {
    backgroundColor: theme.background,
    paddingTop: 8,
    paddingBottom: 16,
  },
  resourceCategory: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.text,
    marginBottom: 12,
  },
  resourceItem: {
    backgroundColor: theme.surfaceElevated,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  resourceName: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.text,
    marginBottom: 6,
  },
  resourceDescription: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 20,
  },
});

export default ArtScreen;

