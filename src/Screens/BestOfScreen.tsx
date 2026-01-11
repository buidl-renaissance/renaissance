import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { SectionTitle } from "../Components/SectionTitle";
import { CategoryFilter } from "../Components/CategoryFilter";
import { RestaurantCard } from "../Components/RestaurantCard";
import { RestaurantRankingCard } from "../Components/RestaurantRankingCard";
import { BucketListCard } from "../Components/BucketListCard";
import { BucketListModal } from "../Components/BucketListModal";
import { FoodPostCard } from "../Components/FoodPostCard";
import { theme } from "../colors";
import {
  Restaurant,
  RestaurantCategory,
  BucketList,
  FoodPost,
} from "../interfaces";
import { getCategoryEmoji } from "../Components/CategoryChip";
import {
  MOCK_RESTAURANTS,
  MOCK_BUCKET_LISTS,
  MOCK_FOOD_POSTS,
} from "../mocks/restaurants";
import {
  getRankingsByCategory,
  getTopRestaurants,
  getAllCategories,
} from "../utils/restaurantRankings";
import {
  getBucketLists,
  createBucketList,
  updateBucketList,
  deleteBucketList,
  shareBucketList,
  addRestaurantToList,
} from "../utils/bucketLists";

type TabType = "rankings" | "categories" | "bucketLists" | "feed";

interface BestOfScreenProps {
  navigation: any;
}

const BestOfScreen: React.FC<BestOfScreenProps> = ({
  navigation,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("rankings");
  const [selectedCategory, setSelectedCategory] = useState<
    RestaurantCategory | "all"
  >("all");
  const [selectedRankingCategory, setSelectedRankingCategory] =
    useState<RestaurantCategory>("restaurants");
  const [bucketLists, setBucketLists] = useState<BucketList[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBucketList, setEditingBucketList] =
    useState<BucketList | null>(null);
  const [foodPosts] = useState<FoodPost[]>(MOCK_FOOD_POSTS);

  useEffect(() => {
    navigation.setOptions({
      title: "Best Of",
      headerStyle: {
        backgroundColor: theme.background,
      },
      headerTintColor: theme.text,
    });
  }, [navigation]);

  useEffect(() => {
    loadBucketLists();
  }, []);

  const loadBucketLists = async () => {
    const lists = await getBucketLists();
    if (lists.length === 0) {
      // Initialize with mock data
      setBucketLists(MOCK_BUCKET_LISTS);
    } else {
      setBucketLists(lists);
    }
  };

  const handleCreateBucketList = async (
    name: string,
    restaurantIds: string[]
  ) => {
    const newList = await createBucketList(name, "user1");
    if (restaurantIds.length > 0) {
      for (const restaurantId of restaurantIds) {
        await addRestaurantToList(newList.id, restaurantId);
      }
    }
    await loadBucketLists();
  };

  const handleUpdateBucketList = async (
    name: string,
    restaurantIds: string[]
  ) => {
    if (editingBucketList) {
      await updateBucketList(editingBucketList.id, {
        name,
        restaurants: restaurantIds,
      });
      await loadBucketLists();
    }
  };

  const handleSaveBucketList = async (
    name: string,
    restaurantIds: string[]
  ) => {
    if (editingBucketList) {
      await handleUpdateBucketList(name, restaurantIds);
    } else {
      await handleCreateBucketList(name, restaurantIds);
    }
    setIsModalVisible(false);
    setEditingBucketList(null);
  };

  const handleShareBucketList = async (listId: string) => {
    const shareCode = await shareBucketList(listId);
    if (shareCode) {
      // In a real app, show share dialog
      console.log("Share code:", shareCode);
    }
    await loadBucketLists();
  };

  const handleAddToBucketList = (restaurantId: string) => {
    // Show bucket list selector or create new
    setEditingBucketList(null);
    setIsModalVisible(true);
  };

  const filteredRestaurants = React.useMemo(() => {
    if (selectedCategory === "all") {
      return MOCK_RESTAURANTS;
    }
    return MOCK_RESTAURANTS.filter((r) =>
      r.categories.includes(selectedCategory)
    );
  }, [selectedCategory]);


  const renderRankingsTab = () => {
    const rankings = getRankingsByCategory(selectedRankingCategory);
    const topRestaurants = getTopRestaurants(selectedRankingCategory, 100); // Show all results
    const categories = getAllCategories();

    return (
      <View style={styles.tabContent}>
        <View style={styles.categorySelector}>
          <View style={styles.categoryContainer}>
            {categories.map((cat) => {
              const emoji = getCategoryEmoji(cat);
              return (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryChip,
                    selectedRankingCategory === cat && styles.categoryChipActive,
                  ]}
                  onPress={() => setSelectedRankingCategory(cat)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      selectedRankingCategory === cat &&
                        styles.categoryChipTextActive,
                    ]}
                  >
                    {emoji ? `${emoji} ` : ""}{cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
        <SectionTitle>
          TOP {selectedRankingCategory.toUpperCase()} RESTAURANTS
        </SectionTitle>
        {topRestaurants.length > 0 ? (
          topRestaurants.map((item, index) => {
            const ranking = rankings.find((r) => r.restaurantId === item.id);
            return (
              <RestaurantRankingCard
                key={item.id}
                ranking={
                  ranking || {
                    restaurantId: item.id,
                    category: selectedRankingCategory,
                    points: item.points || 0,
                    rank: index + 1,
                  }
                }
              />
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No rankings yet</Text>
          </View>
        )}
      </View>
    );
  };

  const renderCategoriesTab = () => {
    return (
      <View style={styles.tabContent}>
        <CategoryFilter
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
        <SectionTitle>
          {selectedCategory === "all"
            ? "ALL RESTAURANTS"
            : selectedCategory.toUpperCase()}
        </SectionTitle>
        {filteredRestaurants.length > 0 ? (
          filteredRestaurants.map((item) => (
            <RestaurantCard
              key={item.id}
              restaurant={item}
              onAddToBucketList={() => handleAddToBucketList(item.id)}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No restaurants found</Text>
          </View>
        )}
      </View>
    );
  };

  const renderBucketListsTab = () => {
    return (
      <View style={styles.tabContent}>
        <View style={styles.bucketListHeader}>
          <SectionTitle>MY BUCKET LISTS</SectionTitle>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              setEditingBucketList(null);
              setIsModalVisible(true);
            }}
          >
            <Ionicons name="add-circle" size={24} color={theme.primary} />
            <Text style={styles.addButtonText}>New List</Text>
          </TouchableOpacity>
        </View>
        {bucketLists.length > 0 ? (
          bucketLists.map((item) => (
            <BucketListCard
              key={item.id}
              bucketList={item}
              onEdit={() => {
                setEditingBucketList(item);
                setIsModalVisible(true);
              }}
              onShare={() => handleShareBucketList(item.id)}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              No bucket lists yet. Create one to get started!
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderFeedTab = () => {
    const sortedPosts = [...foodPosts].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return (
      <View style={styles.tabContent}>
        <SectionTitle>BEST FOOD FEED</SectionTitle>
        {sortedPosts.length > 0 ? (
          sortedPosts.map((item) => (
            <FoodPostCard
              key={item.id}
              post={item}
              onSubmitComment={(text) => {
                console.log("Comment submitted:", text);
              }}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No posts yet</Text>
          </View>
        )}
      </View>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "rankings":
        return renderRankingsTab();
      case "categories":
        return renderCategoriesTab();
      case "bucketLists":
        return renderBucketListsTab();
      case "feed":
        return renderFeedTab();
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "rankings" && styles.activeTab]}
          onPress={() => setActiveTab("rankings")}
        >
          <Ionicons
            name="trophy"
            size={20}
            color={activeTab === "rankings" ? theme.primary : theme.textTertiary}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "rankings" && styles.activeTabText,
            ]}
          >
            Rankings
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "categories" && styles.activeTab]}
          onPress={() => setActiveTab("categories")}
        >
          <Ionicons
            name="grid"
            size={20}
            color={activeTab === "categories" ? theme.primary : theme.textTertiary}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "categories" && styles.activeTabText,
            ]}
          >
            Categories
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "bucketLists" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("bucketLists")}
        >
          <Ionicons
            name="list"
            size={20}
            color={activeTab === "bucketLists" ? theme.primary : theme.textTertiary}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "bucketLists" && styles.activeTabText,
            ]}
          >
            Bucket Lists
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "feed" && styles.activeTab]}
          onPress={() => setActiveTab("feed")}
        >
          <Ionicons
            name="restaurant"
            size={20}
            color={activeTab === "feed" ? theme.primary : theme.textTertiary}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "feed" && styles.activeTabText,
            ]}
          >
            Feed
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {renderTabContent()}
      </ScrollView>

      <BucketListModal
        visible={isModalVisible}
        bucketList={editingBucketList}
        restaurants={MOCK_RESTAURANTS}
        onClose={() => {
          setIsModalVisible(false);
          setEditingBucketList(null);
        }}
        onSave={handleSaveBucketList}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    paddingVertical: 8,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    gap: 4,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: theme.primary,
  },
  tabText: {
    fontSize: 12,
    color: theme.textTertiary,
    fontWeight: "500",
  },
  activeTabText: {
    color: theme.primary,
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 120,
  },
  tabContent: {
    paddingBottom: 20,
  },
  categorySelector: {
    paddingVertical: 4,
  },
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  bucketListHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  addButtonText: {
    fontSize: 14,
    color: theme.primary,
    fontWeight: "600",
  },
  emptyState: {
    padding: 32,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: theme.textSecondary,
    textAlign: "center",
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: theme.inputBackground,
    marginRight: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryChipActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  categoryChipText: {
    fontSize: 11,
    color: theme.textSecondary,
    fontWeight: "500",
  },
  categoryChipTextActive: {
    color: theme.textOnPrimary,
    fontWeight: "600",
  },
});

export default BestOfScreen;
