import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ImageBackground,
} from "react-native";
import { SectionTitle } from "../Components/SectionTitle";
import { ArtworkCard } from "../Components/ArtworkCard";
import { useArtworks } from "../hooks/useArtwork";
import { DAArtwork } from "../interfaces";
import { theme } from "../colors";
import { MiniAppsGrid, MiniAppConfig } from "../Components/MiniAppsGrid";

interface ArtScreenProps {
  navigation: any;
}

const ArtScreen: React.FC<ArtScreenProps> = ({ navigation }) => {
  const [artworks] = useArtworks();

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

  const handleArtDetroitNowApp = React.useCallback(() => {
    navigation.push("MiniApp", {
      url: "https://www.artdetroitnow.com/",
      title: "Art Detroit Now",
      emoji: "📅",
      image: require("../../assets/art-detroit-now.png"),
    });
  }, [navigation]);

  const handleArtClvb = React.useCallback(() => {
    navigation.push("MiniApp", {
      url: "https://www.artclvb.xyz/",
      title: "ArtClvb",
      emoji: "🎨",
      image: require("../../assets/artclvb.jpg"),
    });
  }, [navigation]);

  const handleBeTheLight = React.useCallback(() => {
    navigation.push("MiniApp", {
      url: "https://bethelight222.com/",
      title: "Be The Light",
      emoji: "✨",
      image: require("../../assets/be-the-light.webp"),
    });
  }, [navigation]);

  const handleHeidelbergProject = React.useCallback(() => {
    navigation.push("MiniApp", {
      url: "https://www.heidelberg.org/",
      title: "The Heidelberg Project",
      emoji: "🏛️",
    });
  }, [navigation]);

  const handleLincolnStreetArtPark = React.useCallback(() => {
    navigation.push("MiniApp", {
      url: "https://www.makeartworkdetroit.com/",
      title: "Lincoln Street Art Park",
      emoji: "🏞️",
    });
  }, [navigation]);

  const handleResourcePress = React.useCallback((url: string, title: string) => {
    navigation.push("MiniApp", {
      url,
      title,
    });
  }, [navigation]);

  // Memoize mini apps configuration
  const miniApps: MiniAppConfig[] = React.useMemo(() => [
    {
      label: "Art Detroit Now",
      backgroundColor: "#EC4899",
      onPress: handleArtDetroitNowApp,
      image: require("../../assets/art-detroit-now.png"),
    },
    {
      label: "ArtClvb",
      backgroundColor: "#10B981",
      onPress: handleArtClvb,
      image: require("../../assets/artclvb.jpg"),
    },
    {
      label: "Be The Light",
      backgroundColor: "#14B8A6",
      onPress: handleBeTheLight,
      image: require("../../assets/be-the-light.webp"),
    },
    {
      label: "Heidelberg",
      backgroundColor: "#10B981",
      onPress: handleHeidelbergProject,
      image: require("../../assets/heidelberg.png"),
    },
    {
      label: "Art Park",
      backgroundColor: "#14B8A6",
      onPress: handleLincolnStreetArtPark,
      image: require("../../assets/make-art-work.png"),
    },
  ], [
    handleArtDetroitNowApp,
    handleArtClvb,
    handleBeTheLight,
    handleHeidelbergProject,
    handleLincolnStreetArtPark,
  ]);

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

        {artworks && artworks.length > 0 ? (
          <>
            {/* Mini Apps Section */}
            <View style={styles.miniAppsSection}>
              <MiniAppsGrid apps={miniApps} />
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
              
              {/* Local Art Guides & Events */}
              <View style={styles.resourceCategory}>
                <Text style={styles.categoryTitle}>🎨 Local Art Guides & Events</Text>
                <TouchableOpacity 
                  style={styles.resourceItem}
                  onPress={() => handleResourcePress("https://thedetroiter.com/", "TheDetroiter.com")}
                >
                  <Text style={styles.resourceName}>TheDetroiter.com</Text>
                  <Text style={styles.resourceDescription}>Long-running Detroit cultural site with arts & culture articles, interviews, event listings, and critiques</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.resourceItem}
                  onPress={() => handleResourcePress("https://spreadart.org/", "Spread Art")}
                >
                  <Text style={styles.resourceName}>Spread Art</Text>
                  <Text style={styles.resourceDescription}>Community creative space and incubator supporting local artistic collaborations and cultural programming</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.resourceItem}
                  onPress={() => handleResourcePress("https://www.hourdetroit.com/arts/", "Hour Detroit - Art Section")}
                >
                  <Text style={styles.resourceName}>Hour Detroit – Art Section</Text>
                  <Text style={styles.resourceDescription}>Local magazine coverage highlighting Detroit art events, features, and artist stories</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.resourceItem}
                  onPress={() => handleResourcePress("https://www.metrotimes.com/arts-culture", "Metro Times - Arts & Culture")}
                >
                  <Text style={styles.resourceName}>Metro Times – Arts & Culture</Text>
                  <Text style={styles.resourceDescription}>Weekly news and reviews on art, gallery shows, performances, and local culture</Text>
                </TouchableOpacity>
              </View>

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

