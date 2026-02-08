import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../colors";
import {
  BlockSubmission,
  fetchBlockSubmissions,
  getStatusColor,
  getStatusLabel,
} from "../api/block-submissions";

interface BlockSubmissionsScreenProps {
  navigation: any;
}

const BlockSubmissionsScreen: React.FC<BlockSubmissionsScreenProps> = ({
  navigation,
}) => {
  const [submissions, setSubmissions] = useState<BlockSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    navigation.setOptions({
      title: "Block Submissions",
    });
  }, [navigation]);

  const loadSubmissions = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const data = await fetchBlockSubmissions();
      setSubmissions(data);
    } catch (err) {
      setError("Failed to load submissions. Please try again.");
      console.error("Error loading submissions:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  const handleSubmissionPress = useCallback(
    (submission: BlockSubmission) => {
      navigation.push("MiniApp", {
        url: submission.projectUrl,
        title: submission.blockName,
      });
    },
    [navigation]
  );

  const renderSubmissionCard = (submission: BlockSubmission) => {
    const statusColor = getStatusColor(submission.status);
    const statusLabel = getStatusLabel(submission.status);

    return (
      <TouchableOpacity
        key={submission.id}
        style={styles.card}
        onPress={() => handleSubmissionPress(submission)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          {submission.iconUrl ? (
            <Image
              source={{ uri: submission.iconUrl }}
              style={styles.icon}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.iconPlaceholder, { backgroundColor: theme.primary }]}>
              <Text style={styles.iconPlaceholderText}>
                {submission.blockName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.cardHeaderText}>
            <Text style={styles.blockName} numberOfLines={1}>
              {submission.blockName}
            </Text>
            <Text style={styles.submitterName} numberOfLines={1}>
              by {submission.submitterName}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{statusLabel}</Text>
          </View>
        </View>

        <Text style={styles.description} numberOfLines={3}>
          {submission.projectDescription}
        </Text>

        <View style={styles.cardFooter}>
          <Text style={styles.projectUrl} numberOfLines={1}>
            {submission.projectUrl}
          </Text>
          <Text style={styles.date}>
            {new Date(submission.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>Loading submissions...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => loadSubmissions()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (submissions.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={styles.emptyTitle}>No Submissions Yet</Text>
          <Text style={styles.emptyText}>
            Be the first to submit your app block idea!
          </Text>
        </View>
      );
    }

    return (
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadSubmissions(true)}
            tintColor={theme.primary}
          />
        }
      >
        <View style={styles.header}>
          <View style={styles.headerOverlay}>
            <Text style={styles.headerEmoji}>📦</Text>
            <Text style={styles.headerTitle}>Community Blocks</Text>
            <Text style={styles.headerSubtitle}>
              App blocks submitted by the Detroit community
            </Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{submissions.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {submissions.filter((s) => s.status === "approved").length}
            </Text>
            <Text style={styles.statLabel}>Approved</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {submissions.filter((s) => s.status === "pending").length}
            </Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>

        <View style={styles.submissionsContainer}>
          {submissions.map(renderSubmissionCard)}
        </View>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      {renderContent()}
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
    height: 180,
    justifyContent: "center",
    alignItems: "center",
  },
  headerOverlay: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 16,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    backgroundColor: theme.accentPurple,
  },
  headerEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 24,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: theme.surfaceElevated,
    marginHorizontal: 16,
    marginTop: -20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.text,
  },
  statLabel: {
    fontSize: 12,
    color: theme.textSecondary,
    marginTop: 4,
  },
  submissionsContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  card: {
    backgroundColor: theme.surfaceElevated,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  iconPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  iconPlaceholderText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  cardHeaderText: {
    flex: 1,
    marginLeft: 12,
  },
  blockName: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.text,
  },
  submitterName: {
    fontSize: 14,
    color: theme.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  description: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: theme.border,
    paddingTop: 12,
  },
  projectUrl: {
    fontSize: 12,
    color: theme.primary,
    flex: 1,
    marginRight: 8,
  },
  date: {
    fontSize: 12,
    color: theme.textTertiary,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    fontSize: 16,
    color: theme.textSecondary,
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    color: theme.error,
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: theme.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: theme.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: theme.textSecondary,
    textAlign: "center",
  },
});

export default BlockSubmissionsScreen;
