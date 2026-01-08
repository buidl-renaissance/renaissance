import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
  ActivityIndicator,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import Icon, { IconTypes } from "./Icon";
import { theme } from "../colors";
import { useAuth } from "../context/Auth";
import {
  getConnectionsForUser,
  removeConnection,
  getOtherUser,
  confirmConnection,
  Connection,
} from "../utils/connections";
import moment from "moment";
import { getUserProfileImageUrl, getUserByWalletAddress, getUserByUsername } from "../api/user";

export interface ConnectionsContentProps {
  /** Called when user wants to view shared events with a connection */
  onViewSharedEvents?: (connection: Connection, otherUser: any) => void;
  /** Called when user wants to open QR scanner */
  onOpenQRScanner?: () => void;
  /** Optional scroll handler for modal dismiss integration */
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  /** Whether scrolling is enabled (for modal integration) */
  scrollEnabled?: boolean;
  /** Whether to use FlatList (for modals) or default ScrollView behavior */
  useFlatList?: boolean;
  /** Whether the content is currently visible (controls polling) */
  isVisible?: boolean;
  /** Style for the container */
  containerStyle?: object;
  /** Style for the list content */
  contentContainerStyle?: object;
}

export const ConnectionsContent: React.FC<ConnectionsContentProps> = ({
  onViewSharedEvents,
  onOpenQRScanner,
  onScroll,
  scrollEnabled = true,
  useFlatList = true,
  isVisible = true,
  containerStyle,
  contentContainerStyle,
}) => {
  const { state: authState } = useAuth();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmingConnectionId, setConfirmingConnectionId] = useState<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const POLLING_INTERVAL = 5000; // 5 seconds

  const loadConnections = useCallback(async () => {
    if (!authState.isAuthenticated || !authState.user || !authState.user.username) {
      return;
    }

    try {
      const wallet = await import("../utils/wallet").then((m) => m.getWallet());
      const currentUserId = authState.user.fid?.toString() || wallet.address;
      const userConnections = await getConnectionsForUser(
        currentUserId,
        true, // useServer
        authState.user.username,
        wallet.address
      );
      setConnections(userConnections);
    } catch (error) {
      console.error("Error loading connections:", error);
    }
  }, [authState.isAuthenticated, authState.user]);

  useEffect(() => {
    if (isVisible) {
      setIsLoading(true);
      loadConnections().finally(() => setIsLoading(false));

      // Start polling when visible
      pollingIntervalRef.current = setInterval(() => {
        loadConnections();
      }, POLLING_INTERVAL);
    } else {
      // Stop polling when not visible
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }

    // Cleanup on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [isVisible, loadConnections]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadConnections();
    setRefreshing(false);
  }, [loadConnections]);

  const handleDisconnectOrCancel = useCallback((connection: Connection) => {
    const actionText = connection.status === "confirmed" ? "Disconnect" : "Cancel Connection";
    const message = connection.status === "confirmed" 
      ? "Are you sure you want to disconnect from this user?"
      : "Are you sure you want to cancel this connection request?";
    
    Alert.alert(
      actionText,
      message,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: actionText,
          style: "destructive",
          onPress: async () => {
            // Remove from view immediately
            setConnections((prev) => prev.filter((c) => c.id !== connection.id));
            
            try {
              await removeConnection(connection.id);
              // Refresh to sync with server
              await loadConnections();
            } catch (error) {
              console.error("Error removing connection:", error);
              Alert.alert("Error", "Failed to remove connection from server");
            }
          },
        },
      ]
    );
  }, [loadConnections]);

  const handleViewSharedEvents = useCallback(async (connection: Connection) => {
    const currentUserId = authState.user?.fid?.toString() || "";
    const currentUsername = authState.user?.username || "";
    const otherUser = getOtherUser(
      connection,
      currentUserId,
      currentUsername
    );
    
    // Try to get the other user's backend ID from their wallet address or username
    let backendUserId: number | undefined;
    
    // First, try wallet address lookup
    if (otherUser.walletAddress) {
      try {
        console.log("[ConnectionsContent] Looking up backend user ID by wallet:", otherUser.walletAddress);
        const userData = await getUserByWalletAddress(otherUser.walletAddress);
        const user = Array.isArray(userData) ? userData[0] : userData;
        backendUserId = user?.id;
        console.log("[ConnectionsContent] Found backend user ID by wallet:", backendUserId);
      } catch (error) {
        console.log("[ConnectionsContent] Wallet lookup failed, trying username...");
      }
    }
    
    // If wallet lookup failed, try username lookup
    if (!backendUserId && otherUser.username) {
      try {
        console.log("[ConnectionsContent] Looking up backend user ID by username:", otherUser.username);
        const userData = await getUserByUsername(otherUser.username);
        const user = Array.isArray(userData) ? userData[0] : userData;
        backendUserId = user?.id;
        console.log("[ConnectionsContent] Found backend user ID by username:", backendUserId);
      } catch (error) {
        console.error("[ConnectionsContent] Username lookup also failed:", error);
      }
    }
    
    if (!backendUserId) {
      console.warn("[ConnectionsContent] Could not find backend user ID for connection");
    }
    
    if (onViewSharedEvents) {
      onViewSharedEvents(connection, { ...otherUser, backendUserId });
    }
  }, [authState.user, onViewSharedEvents]);

  const handleConfirmConnection = useCallback(async (connection: Connection) => {
    if (!authState.user?.username) {
      Alert.alert("Error", "Username is required to confirm connection");
      return;
    }

    setConfirmingConnectionId(connection.id);
    try {
      const wallet = await import("../utils/wallet").then((m) => m.getWallet());
      const currentUserId = authState.user.fid?.toString() || wallet.address;

      const username1 = connection.userA.username || "";
      const username2 = connection.userB.username || "";

      if (!username1 || !username2) {
        throw new Error("Connection usernames are missing");
      }

      await confirmConnection(
        connection.id,
        username1,
        username2,
        currentUserId,
        authState.user.username,
        wallet.address
      );

      Alert.alert("Success", "Connection confirmed successfully!");
      await loadConnections();
    } catch (error) {
      console.error("Error confirming connection:", error);
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to confirm connection"
      );
    } finally {
      setConfirmingConnectionId(null);
    }
  }, [authState.user, loadConnections]);

  const handleDenyConnection = useCallback(async (connection: Connection) => {
    setConnections((prev) => prev.filter((c) => c.id !== connection.id));
    
    try {
      await removeConnection(connection.id);
      await loadConnections();
    } catch (error) {
      console.error("Error denying connection:", error);
      Alert.alert("Error", "Failed to deny connection on server");
    }
  }, [loadConnections]);

  const renderConnection = useCallback(({ item: connection }: { item: Connection }) => {
    const currentUserId = authState.user?.fid?.toString() || "";
    const currentUsername = authState.user?.username || "";
    
    const isCurrentUserA = 
      connection.userA.userId === currentUserId || 
      connection.userA.username === currentUsername ||
      connection.userA.walletAddress === (authState.user?.local?.walletAddress || "");
    
    const otherUser = isCurrentUserA ? connection.userB : connection.userA;
    const currentUserSignature = isCurrentUserA ? connection.userA.signature : connection.userB.signature;
    const needsConfirmation = connection.status === "pending" && !currentUserSignature;
    const isConfirming = confirmingConnectionId === connection.id;

    let buttonText = "";
    let buttonStyle: any = {};
    let buttonTextStyle: any = {};
    let onButtonPress: () => void = () => {};
    let showTwoButtons = false;

    if (needsConfirmation) {
      showTwoButtons = true;
    } else if (connection.status === "pending") {
      buttonText = "Pending";
      buttonStyle = styles.statusButtonPending;
      buttonTextStyle = styles.statusButtonTextPending;
      onButtonPress = () => handleDisconnectOrCancel(connection);
    } else {
      buttonText = "Connected";
      buttonStyle = styles.statusButtonConnected;
      buttonTextStyle = styles.statusButtonTextConnected;
      onButtonPress = () => handleDisconnectOrCancel(connection);
    }

    return (
      <TouchableOpacity
        style={styles.connectionCard}
        onPress={() => {
          if (connection.status === "confirmed") {
            handleViewSharedEvents(connection);
          }
        }}
        activeOpacity={0.7}
      >
        <View style={styles.connectionContent}>
          <View style={styles.avatarContainer}>
            {(() => {
              const imageUrl = otherUser.username 
                ? getUserProfileImageUrl(otherUser.username)
                : otherUser.pfpUrl;
              
              return imageUrl ? (
                <Image
                  source={{ uri: imageUrl }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Icon
                    type={IconTypes.Ionicons}
                    name="person"
                    size={24}
                    color={theme.textSecondary}
                  />
                </View>
              );
            })()}
          </View>
          <View style={styles.connectionInfo}>
            <Text style={styles.connectionName} numberOfLines={1}>
              {otherUser.displayName || otherUser.username || "Unknown User"}
            </Text>
            {otherUser.username && (
              <Text style={styles.connectionUsername} numberOfLines={1}>
                @{otherUser.username}
              </Text>
            )}
            <Text style={styles.connectionDate}>
              {moment(connection.timestamp).fromNow()}
            </Text>
          </View>
          {showTwoButtons ? (
            <View style={styles.twoButtonContainer}>
              <TouchableOpacity
                style={[styles.statusButton, styles.statusButtonDeny]}
                onPress={(e) => {
                  e.stopPropagation();
                  handleDenyConnection(connection);
                }}
              >
                <Icon
                  type={IconTypes.Ionicons}
                  name="close"
                  size={20}
                  color={theme.error || "#DC2626"}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.statusButton, styles.statusButtonConfirm]}
                onPress={(e) => {
                  e.stopPropagation();
                  handleConfirmConnection(connection);
                }}
                disabled={isConfirming}
              >
                {isConfirming ? (
                  <ActivityIndicator size="small" color={theme.textOnPrimary} />
                ) : (
                  <Icon
                    type={IconTypes.Ionicons}
                    name="checkmark"
                    size={20}
                    color={theme.textOnPrimary}
                  />
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.statusButton, buttonStyle]}
              onPress={(e) => {
                e.stopPropagation();
                onButtonPress();
              }}
            >
              <Text style={[styles.statusButtonText, buttonTextStyle]}>
                {buttonText}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  }, [authState.user, handleViewSharedEvents, handleDisconnectOrCancel, handleConfirmConnection, handleDenyConnection, confirmingConnectionId]);

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Icon
          type={IconTypes.Ionicons}
          name="people-outline"
          size={72}
          color={theme.textTertiary}
        />
      </View>
      <Text style={styles.emptyTitle}>No Connections Yet</Text>
      <Text style={styles.emptyText}>
        Scan a connection QR code to connect with other users and see shared events
      </Text>
      {onOpenQRScanner && (
        <TouchableOpacity
          style={styles.connectButton}
          onPress={onOpenQRScanner}
          activeOpacity={0.8}
        >
          <Icon
            type={IconTypes.Ionicons}
            name="qr-code-outline"
            size={20}
            color={theme.textOnPrimary}
          />
          <Text style={styles.connectButtonText}>Open QR Scanner</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (isLoading && connections.length === 0) {
    return (
      <View style={[styles.loadingContainer, containerStyle]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <FlatList
      data={connections}
      renderItem={renderConnection}
      keyExtractor={(item) => item.id}
      style={containerStyle}
      contentContainerStyle={[
        connections.length === 0 ? styles.emptyListContent : styles.listContent,
        contentContainerStyle,
      ]}
      ListEmptyComponent={renderEmptyState()}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.primary}
        />
      }
      onScroll={onScroll}
      scrollEventThrottle={16}
      scrollEnabled={scrollEnabled}
      showsVerticalScrollIndicator={true}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 16,
  },
  emptyListContent: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  connectionCard: {
    backgroundColor: theme.surface,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  connectionContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarContainer: {
    marginRight: 10,
    flexShrink: 0,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.inputBackground,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.inputBackground,
    justifyContent: "center",
    alignItems: "center",
  },
  connectionInfo: {
    flex: 1,
    marginRight: 10,
    minWidth: 120,
    flexShrink: 1,
  },
  connectionName: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.text,
    marginBottom: 2,
  },
  connectionUsername: {
    fontSize: 13,
    color: theme.textSecondary,
    marginBottom: 3,
  },
  connectionDate: {
    fontSize: 11,
    color: theme.textTertiary,
  },
  statusButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 90,
    alignItems: "center",
    justifyContent: "center",
  },
  statusButtonConnected: {
    backgroundColor: theme.successBackground || "#10B981",
  },
  statusButtonTextConnected: {
    color: theme.success || "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  statusButtonPending: {
    backgroundColor: theme.warningBackground || "#FEF3C7",
  },
  statusButtonTextPending: {
    color: theme.warning || "#92400E",
    fontSize: 13,
    fontWeight: "600",
  },
  statusButtonConfirm: {
    backgroundColor: theme.primary,
    minWidth: 40,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  statusButtonDeny: {
    backgroundColor: "#FEE2E2",
    minWidth: 40,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  statusButtonText: {
    fontSize: 13,
    fontWeight: "600",
  },
  twoButtonContainer: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    flexShrink: 0,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingTop: 100,
  },
  emptyIconContainer: {
    marginBottom: 24,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: theme.text,
    marginBottom: 12,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 15,
    color: theme.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  connectButton: {
    backgroundColor: theme.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    shadowColor: theme.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  connectButtonText: {
    color: theme.textOnPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ConnectionsContent;
