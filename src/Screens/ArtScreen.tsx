import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { SectionTitle } from "../Components/SectionTitle";
import { ArtworkCard } from "../Components/ArtworkCard";
import { useArtworks } from "../hooks/useArtwork";
import { DAArtwork } from "../interfaces";
import { theme } from "../colors";

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
    });
  }, [navigation]);

  const handleArtClvb = React.useCallback(() => {
    navigation.push("MiniApp", {
      url: "https://www.artclvb.xyz/",
      title: "ArtClvb",
      emoji: "🎨",
    });
  }, [navigation]);

  const handleResourcePress = React.useCallback((url: string, title: string) => {
    navigation.push("MiniApp", {
      url,
      title,
    });
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.headerIcon}>🎨</Text>
          <Text style={styles.headerTitle}>Detroit Art</Text>
          <Text style={styles.headerSubtitle}>
            Discover Detroit's vibrant art scene
          </Text>
        </View>

        {artworks && artworks.length > 0 ? (
          <>
            {/* Mini Apps Section */}
            <View style={styles.miniAppsSection}>
              <View style={styles.miniAppsContainer}>
                <TouchableOpacity 
                  onPress={handleArtDetroitNowApp}
                  style={styles.miniAppItem}
                >
                  <View style={[styles.miniAppIconContainer, { backgroundColor: "#EC4899" }]}>
                    <Text style={styles.miniAppIconEmoji}>📅</Text>
                  </View>
                  <Text style={styles.miniAppLabel}>Art Detroit Now</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={handleArtClvb}
                  style={styles.miniAppItem}
                >
                  <View style={[styles.miniAppIconContainer, { backgroundColor: "#8B5CF6" }]}>
                    <Text style={styles.miniAppIconEmoji}>🎨</Text>
                  </View>
                  <Text style={styles.miniAppLabel}>ArtClvb</Text>
                </TouchableOpacity>
              </View>
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
                  onPress={() => handleResourcePress("https://www.artdetroitnow.com/", "Art Detroit Now")}
                >
                  <Text style={styles.resourceName}>Art Detroit Now</Text>
                  <Text style={styles.resourceDescription}>Guide to contemporary art events, gallery openings, exhibitions and happenings in Detroit</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.resourceItem}
                  onPress={() => handleResourcePress("https://detroitartreview.com/", "Detroit Art Review")}
                >
                  <Text style={styles.resourceName}>Detroit Art Review</Text>
                  <Text style={styles.resourceDescription}>Critical reviews of Detroit art exhibitions and gallery shows</Text>
                </TouchableOpacity>
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
                  onPress={() => handleResourcePress("https://runnerdetroit.com/art", "Runner Magazine - ART Section")}
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

              {/* Other Useful Resources */}
              <View style={styles.resourceCategory}>
                <Text style={styles.categoryTitle}>📣 Other Useful Art & Culture Resources</Text>
                <TouchableOpacity 
                  style={styles.resourceItem}
                  onPress={() => handleResourcePress("https://www.theartnewspaper.com/tag/detroit", "The Art Newspaper - Detroit Tag")}
                >
                  <Text style={styles.resourceName}>The Art Newspaper – Detroit Tag</Text>
                  <Text style={styles.resourceDescription}>Art news aggregator with international and local Detroit art coverage</Text>
                </TouchableOpacity>
              </View>

              {/* Iconic Public Art Sites */}
              <View style={styles.resourceCategory}>
                <Text style={styles.categoryTitle}>📌 Iconic Public Art Sites</Text>
                <TouchableOpacity 
                  style={styles.resourceItem}
                  onPress={() => handleResourcePress("https://www.heidelberg.org/", "The Heidelberg Project")}
                >
                  <Text style={styles.resourceName}>The Heidelberg Project</Text>
                  <Text style={styles.resourceDescription}>Outdoor community art installation and cultural org</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.resourceItem}
                  onPress={() => handleResourcePress("https://www.makeartworkdetroit.org/", "Lincoln Street Art Park / Make Art Work Detroit")}
                >
                  <Text style={styles.resourceName}>Lincoln Street Art Park / Make Art Work Detroit</Text>
                  <Text style={styles.resourceDescription}>Outdoor art park with installations and public engagement</Text>
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
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 16,
    backgroundColor: "#EC4899",
  },
  headerIcon: {
    fontSize: 48,
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
    backgroundColor: theme.surface,
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 16,
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
  miniAppsContainer: {
    flexDirection: "row",
    paddingHorizontal: 12,
    justifyContent: "flex-start",
  },
  miniAppItem: {
    alignItems: "center",
    width: 66,
    marginRight: 12,
  },
  miniAppIconContainer: {
    borderRadius: 14,
    width: 66,
    height: 66,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  miniAppIconEmoji: {
    fontSize: 30,
  },
  miniAppLabel: {
    fontSize: 9,
    fontWeight: "600",
    color: theme.text,
    textAlign: "center",
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
    backgroundColor: theme.surface,
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

