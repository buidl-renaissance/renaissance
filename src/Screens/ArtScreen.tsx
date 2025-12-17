import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from "react-native";
import * as Linking from "expo-linking";
import { SectionTitle } from "../Components/SectionTitle";
import { ArtworkCard } from "../Components/ArtworkCard";
import { Button } from "../Components/Button";
import { useArtworks } from "../hooks/useArtwork";
import { DAArtwork } from "../interfaces";
import { lightGreen } from "../colors";

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

  const handleExploreMore = React.useCallback(() => {
    Linking.openURL("https://art.gods.work/");
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.headerIcon}>🎨</Text>
          <Text style={styles.headerTitle}>Detroit Art</Text>
          <Text style={styles.headerSubtitle}>
            Discover and collect artwork from Detroit's vibrant art scene
          </Text>
        </View>

        {artworks && artworks.length > 0 ? (
          <>
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

            <View style={styles.exploreSection}>
              <Text style={styles.exploreTitle}>GODS WORK</Text>
              <Text style={styles.exploreDescription}>
                Our mission is to empower artistic communities to create by
                providing opportunities for collaboration, growth, and
                financial sustainability.
              </Text>
              <Button
                title="Explore More Artwork"
                size="medium"
                onPress={handleExploreMore}
              />
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
    backgroundColor: lightGreen,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 16,
    backgroundColor: "white",
  },
  headerIcon: {
    fontSize: 48,
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
  section: {
    marginTop: 16,
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
  exploreSection: {
    backgroundColor: "white",
    marginTop: 16,
    padding: 24,
    alignItems: "center",
  },
  exploreTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  exploreDescription: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
    paddingHorizontal: 16,
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
});

export default ArtScreen;

