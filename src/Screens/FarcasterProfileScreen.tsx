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
        backgroundColor: "#fff",
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
    <SafeAreaView style={styles.container} edges={['bottom']}>
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
        {/* Profile Header - Instagram Style */}
        {(profile || authState.user) && (
          <View style={styles.profileHeader}>
            {/* Top Row: Profile Picture and Stats */}
            <View style={styles.profileTopRow}>
              {/* Profile Picture */}
              <View style={styles.profileImageContainer}>
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
              </View>
              
              {/* Stats */}
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{casts.length}</Text>
                  <Text style={styles.statLabel}>Casts</Text>
                </View>
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
              </View>
            </View>
            
            {/* User Info */}
            <View style={styles.userInfo}>
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
            </View>
          </View>
        )}

        {/* Casts Section */}
        <View style={styles.castsSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionDivider} />
          </View>
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
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
    paddingTop: 0,
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
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: 16,
    marginTop: 0,
  },
  profileTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  profileImageContainer: {
    marginRight: 28,
  },
  profileImage: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  profileImagePlaceholder: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  statsContainer: {
    flexDirection: "row",
    flex: 1,
    justifyContent: "space-around",
    alignItems: "center",
    paddingTop: 8,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: "#737373",
    fontWeight: "400",
  },
  userInfo: {
    paddingHorizontal: 0,
  },
  displayName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginBottom: 2,
  },
  username: {
    fontSize: 14,
    color: "#737373",
    marginBottom: 8,
    fontWeight: "400",
  },
  bio: {
    fontSize: 14,
    color: "#000",
    lineHeight: 20,
    marginBottom: 0,
  },
  castsSection: {
    paddingTop: 0,
    paddingHorizontal: 0,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: "#DBDBDB",
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#DBDBDB",
  },
  castHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  castAuthorImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
    borderWidth: 0.5,
    borderColor: "#DBDBDB",
  },
  castAuthorImagePlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  castAuthorInfo: {
    flex: 1,
  },
  castAuthorName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginBottom: 0,
  },
  castAuthorUsername: {
    fontSize: 14,
    color: "#737373",
    fontWeight: "400",
  },
  castTimestamp: {
    fontSize: 12,
    color: "#737373",
    fontWeight: "400",
  },
  castText: {
    fontSize: 14,
    color: "#000",
    lineHeight: 20,
    marginBottom: 8,
    marginLeft: 44,
  },
  castReactions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    marginLeft: 44,
  },
  reactionItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  reactionCount: {
    fontSize: 13,
    color: "#6B7280",
    marginLeft: 6,
    fontWeight: "500",
  },
  loadingMoreContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },
});

export default FarcasterProfileScreen;

