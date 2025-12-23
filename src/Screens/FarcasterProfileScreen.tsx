import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/Auth";
import { fetchUserProfile, fetchUserCasts, Cast } from "../utils/neynarAuth";
import { lightGreen } from "../colors";

interface FarcasterProfileScreenProps {
  navigation: any;
}

const FarcasterProfileScreen: React.FC<FarcasterProfileScreenProps> = ({
  navigation,
}) => {
  const { state: authState } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [casts, setCasts] = useState<Cast[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);

  useEffect(() => {
    navigation.setOptions({
      title: "Profile",
      headerStyle: {
        backgroundColor: lightGreen,
      },
      headerTintColor: "#000",
    });
  }, [navigation]);

  useEffect(() => {
    console.log("[FarcasterProfile] Screen mounted/updated", {
      isAuthenticated: authState.isAuthenticated,
      userType: authState.user?.type,
      fid: authState.user?.fid,
    });
    
    if (authState.isAuthenticated && authState.user?.type === "farcaster") {
      loadProfileAndCasts();
    } else {
      setLoading(false);
    }
  }, [authState.isAuthenticated, authState.user?.fid]);

  const loadProfileAndCasts = async () => {
    if (!authState.user?.fid || authState.user.fid <= 0) {
      console.log("[FarcasterProfile] No valid FID, skipping load");
      setLoading(false);
      return;
    }

    try {
      console.log("[FarcasterProfile] Loading profile and casts for FID:", authState.user.fid);
      setLoading(true);
      
      // Try to fetch profile first, then casts
      // If profile fails, we can still show casts
      let profileData = null;
      let castsData = { casts: [], next: undefined };
      
      try {
        profileData = await fetchUserProfile(authState.user.fid);
        console.log("[FarcasterProfile] Profile loaded:", profileData ? "yes" : "no");
      } catch (profileError) {
        console.error("[FarcasterProfile] Error loading profile:", profileError);
        // Continue even if profile fails
      }
      
      try {
        castsData = await fetchUserCasts(authState.user.fid, { limit: 25 });
        console.log("[FarcasterProfile] Casts loaded:", castsData.casts.length);
      } catch (castsError) {
        console.error("[FarcasterProfile] Error loading casts:", castsError);
        // Continue even if casts fail
      }

      setProfile(profileData);
      setCasts(castsData.casts);
      setNextCursor(castsData.next?.cursor);
    } catch (error) {
      console.error("[FarcasterProfile] Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfileAndCasts();
    setRefreshing(false);
  };

  const loadMoreCasts = async () => {
    if (!nextCursor || loadingMore || !authState.user?.fid) return;

    try {
      setLoadingMore(true);
      const castsData = await fetchUserCasts(authState.user.fid, {
        limit: 25,
        cursor: nextCursor,
      });

      setCasts((prev) => [...prev, ...castsData.casts]);
      setNextCursor(castsData.next?.cursor);
    } catch (error) {
      console.error("[FarcasterProfile] Error loading more casts:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleCastPress = (cast: Cast) => {
    const url = `https://warpcast.com/~/conversations/${cast.hash}`;
    Linking.openURL(url).catch((error) => {
      console.error("[FarcasterProfile] Error opening cast:", error);
    });
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (!authState.isAuthenticated || authState.user?.type !== "farcaster") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="person-circle-outline" size={64} color="#999" />
          <Text style={styles.emptyText}>Not signed in with Farcaster</Text>
          <Text style={styles.emptySubtext}>
            Sign in with Farcaster to view your profile and casts
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onScrollEndDrag={(e) => {
          const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
          const paddingToBottom = 20;
          if (
            layoutMeasurement.height + contentOffset.y >=
            contentSize.height - paddingToBottom
          ) {
            loadMoreCasts();
          }
        }}
        scrollEventThrottle={400}
      >
        {/* Profile Header */}
        {(profile || authState.user) && (
          <View style={styles.profileHeader}>
            {(profile?.pfpUrl || authState.user?.pfpUrl) ? (
              <Image
                source={{ uri: profile?.pfpUrl || authState.user?.pfpUrl }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Ionicons name="person" size={40} color="#999" />
              </View>
            )}
            <Text style={styles.displayName}>
              {profile?.displayName || authState.user?.displayName || profile?.username || authState.user?.username || "Anonymous"}
            </Text>
            {(profile?.username || authState.user?.username) && (
              <Text style={styles.username}>
                @{profile?.username || authState.user?.username}
              </Text>
            )}
            {profile?.bio && (
              <Text style={styles.bio}>{profile.bio}</Text>
            )}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {profile?.followerCount || 0}
                </Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {profile?.followingCount || 0}
                </Text>
                <Text style={styles.statLabel}>Following</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{casts.length}</Text>
                <Text style={styles.statLabel}>Casts</Text>
              </View>
            </View>
          </View>
        )}

        {/* Casts Section */}
        <View style={styles.castsSection}>
          <Text style={styles.sectionTitle}>Your Casts</Text>
          {casts.length === 0 ? (
            <View style={styles.emptyCastsContainer}>
              <Ionicons name="chatbubbles-outline" size={48} color="#999" />
              <Text style={styles.emptyCastsText}>No casts yet</Text>
              <Text style={styles.emptyCastsSubtext}>
                Start casting to see your posts here
              </Text>
            </View>
          ) : (
            <>
              {casts.map((cast) => (
                <TouchableOpacity
                  key={cast.hash}
                  style={styles.castCard}
                  onPress={() => handleCastPress(cast)}
                  activeOpacity={0.7}
                >
                  <View style={styles.castHeader}>
                    {cast.author.pfp_url ? (
                      <Image
                        source={{ uri: cast.author.pfp_url }}
                        style={styles.castAuthorImage}
                      />
                    ) : (
                      <View style={styles.castAuthorImagePlaceholder}>
                        <Ionicons name="person" size={16} color="#999" />
                      </View>
                    )}
                    <View style={styles.castAuthorInfo}>
                      <Text style={styles.castAuthorName}>
                        {cast.author.display_name || cast.author.username || "Anonymous"}
                      </Text>
                      {cast.author.username && (
                        <Text style={styles.castAuthorUsername}>
                          @{cast.author.username}
                        </Text>
                      )}
                    </View>
                    <Text style={styles.castTimestamp}>
                      {formatTimestamp(cast.timestamp)}
                    </Text>
                  </View>
                  <Text style={styles.castText}>{cast.text}</Text>
                  {cast.reactions && (
                    <View style={styles.castReactions}>
                      {cast.reactions.likes_count !== undefined && (
                        <View style={styles.reactionItem}>
                          <Ionicons name="heart-outline" size={16} color="#666" />
                          <Text style={styles.reactionCount}>
                            {cast.reactions.likes_count}
                          </Text>
                        </View>
                      )}
                      {cast.reactions.recasts_count !== undefined && (
                        <View style={styles.reactionItem}>
                          <Ionicons name="repeat-outline" size={16} color="#666" />
                          <Text style={styles.reactionCount}>
                            {cast.reactions.recasts_count}
                          </Text>
                        </View>
                      )}
                      {cast.reactions.replies_count !== undefined && (
                        <View style={styles.reactionItem}>
                          <Ionicons name="chatbubble-outline" size={16} color="#666" />
                          <Text style={styles.reactionCount}>
                            {cast.reactions.replies_count}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              ))}
              {loadingMore && (
                <View style={styles.loadingMoreContainer}>
                  <ActivityIndicator size="small" color="#6366F1" />
                </View>
              )}
            </>
          )}
        </View>
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
  contentContainer: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
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
  profileHeader: {
    backgroundColor: "#fff",
    padding: 20,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  displayName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: "#6366F1",
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  castsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 16,
  },
  emptyCastsContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyCastsText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginTop: 12,
  },
  emptyCastsSubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 4,
  },
  castCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  castHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  castAuthorImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  castAuthorImagePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  castAuthorInfo: {
    flex: 1,
  },
  castAuthorName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  castAuthorUsername: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  castTimestamp: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  castText: {
    fontSize: 15,
    color: "#1F2937",
    lineHeight: 22,
    marginBottom: 12,
  },
  castReactions: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  reactionItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  reactionCount: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  loadingMoreContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },
});

export default FarcasterProfileScreen;

