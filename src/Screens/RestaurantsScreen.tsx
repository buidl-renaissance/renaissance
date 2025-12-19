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
import { Ionicons } from "@expo/vector-icons";
import { SectionTitle } from "../Components/SectionTitle";

const { width } = Dimensions.get("window");

// Curated list of popular nearby restaurants, grouped by neighborhood.
// To update, add/remove entries below – no API calls are involved.
const POPULAR_RESTAURANTS: {
  neighborhood: string;
  restaurants: { name: string; tags?: string[] }[];
}[] = [
  {
    neighborhood: "Downtown",
    restaurants: [
      { name: "San Morello", tags: ["Italian", "Wood-fired"] },
      { name: "Parc", tags: ["American", "Campus Martius"] },
    ],
  },
  {
    neighborhood: "Midtown",
    restaurants: [
      { name: "Grey Ghost", tags: ["Steaks", "Cocktails"] },
      { name: "Selden Standard", tags: ["Small Plates", "Seasonal"] },
    ],
  },
  {
    neighborhood: "Corktown",
    restaurants: [
      { name: "Takoi", tags: ["Thai-inspired", "Late Night"] },
      { name: "Ima", tags: ["Noodles", "Comfort"] },
    ],
  },
  {
    neighborhood: "Eastern Market",
    restaurants: [
      { name: "Supino Pizzeria", tags: ["Pizza", "Casual"] },
      { name: "Vivio's", tags: ["Bar", "Oysters"] },
    ],
  },
];

interface RestaurantsScreenProps {
  navigation: any;
}

const RestaurantsScreen: React.FC<RestaurantsScreenProps> = ({ navigation }) => {
  React.useEffect(() => {
    navigation.setOptions({
      title: "Restaurants",
      headerStyle: {
        backgroundColor: "#d2e4dd",
      },
      headerTintColor: "#000",
    });
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Ionicons name="restaurant" size={48} color="#3449ff" />
          <Text style={styles.headerTitle}>Popular Nearby Restaurants</Text>
          <Text style={styles.headerSubtitle}>
            Discover great dining spots across Detroit neighborhoods
          </Text>
        </View>

        <View style={styles.content}>
          <SectionTitle>RESTAURANTS BY AREA</SectionTitle>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {POPULAR_RESTAURANTS.map((group) => (
              <View key={group.neighborhood} style={styles.areaCard}>
                <Text style={styles.areaTitle}>{group.neighborhood}</Text>
                {group.restaurants.map((restaurant) => (
                  <View key={restaurant.name} style={styles.restaurantItem}>
                    <Text style={styles.restaurantName}>{restaurant.name}</Text>
                    {restaurant.tags && restaurant.tags.length > 0 && (
                      <View style={styles.tagsContainer}>
                        {restaurant.tags.map((tag, index) => (
                          <View key={index} style={styles.tag}>
                            <Text style={styles.tagText}>{tag}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                ))}
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.footer}>
          <Ionicons name="information-circle-outline" size={20} color="#999" />
          <Text style={styles.footerText}>
            More restaurants and features coming soon
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 16,
    backgroundColor: "#f9f9f9",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginTop: 12,
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
  },
  content: {
    paddingTop: 24,
  },
  horizontalScroll: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  areaCard: {
    marginRight: 12,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#f5f5f5",
    width: 240,
    minHeight: 200,
  },
  areaTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#444",
    marginBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: "#3449ff",
    paddingBottom: 8,
  },
  restaurantItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  restaurantName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111",
    marginBottom: 4,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
  },
  tag: {
    backgroundColor: "#e5e5e5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 11,
    color: "#666",
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  footerText: {
    fontSize: 13,
    color: "#999",
    marginLeft: 8,
    textAlign: "center",
  },
});

export default RestaurantsScreen;

