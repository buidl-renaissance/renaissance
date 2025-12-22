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
    });
  }, [navigation]);

  const handleArtClvb = React.useCallback(() => {
    navigation.push("MiniApp", {
      url: "https://www.artclvb.xyz/",
      title: "ArtClvb",
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
    backgroundColor: "white",
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
    backgroundColor: "white",
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
    backgroundColor: "white",
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
    color: "#333",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
  },
  miniAppsSection: {
    backgroundColor: "white",
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
    color: "#333",
    textAlign: "center",
  },
});

export default ArtScreen;

