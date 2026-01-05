import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
} from "react-native";
import { HeaderTitleImage } from "../Components/HeaderTitleImage";
import { theme } from "../colors";
import { useAuth } from "../context/Auth";
import {
  getConnections,
  getConnectionsForUser,
  removeConnection,
  getOtherUser,
  Connection,
} from "../utils/connections";
import Icon, { IconTypes } from "../Components/Icon";
import moment from "moment";

interface ConnectionsScreenProps {
  navigation: any;
}

const ConnectionsScreen: React.FC<ConnectionsScreenProps> = ({ navigation }) => {
  navigation.setOptions({
    headerTitle: () => <HeaderTitleImage />,
  });

  const { state: authState } = useAuth();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadConnections = async () => {
    if (!authState.isAuthenticated || !authState.user) {
      return;
    }

    try {
      const wallet = await import("../utils/wallet").then((m) => m.getWallet());
      const currentUserId = authState.user.fid?.toString() || wallet.address;
      const userConnections = await getConnectionsForUser(currentUserId);
      setConnections(userConnections);
    } catch (error) {
      console.error("Error loading connections:", error);
    }
  };

  useEffect(() => {
    loadConnections();
  }, [authState.isAuthenticated]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadConnections();
    setRefreshing(false);
  };

  const handleRemoveConnection = (connection: Connection) => {
    Alert.alert(
      "Remove Connection",
      "Are you sure you want to remove this connection?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            await removeConnection(connection.id);
            await loadConnections();
          },
        },
      ]
    );
  };

  const handleViewSharedEvents = (connection: Connection) => {
    const otherUser = getOtherUser(
      connection,
      authState.user?.fid?.toString() || ""
    );
    navigation.navigate("SharedEvents", { connection, otherUser });
  };

  const renderConnection = (connection: Connection) => {
    const otherUser = getOtherUser(
      connection,
      authState.user?.fid?.toString() || ""
    );

    return (
      <View key={connection.id} style={styles.connectionCard}>
        <TouchableOpacity
          style={styles.connectionContent}
          onPress={() => handleViewSharedEvents(connection)}
        >
          <View style={styles.avatarContainer}>
            {otherUser.pfpUrl ? (
              <Image
                source={{ uri: otherUser.pfpUrl }}
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
            )}
          </View>
          <View style={styles.connectionInfo}>
            <Text style={styles.connectionName}>
              {otherUser.displayName || otherUser.username || "Unknown User"}
            </Text>
            {otherUser.username && (
              <Text style={styles.connectionUsername}>@{otherUser.username}</Text>
            )}
            <Text style={styles.connectionDate}>
              Connected {moment(connection.timestamp).fromNow()}
            </Text>
            {connection.status === "pending" && (
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingText}>Pending</Text>
              </View>
            )}
          </View>
          <View style={styles.connectionActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleViewSharedEvents(connection)}
            >
              <Icon
                type={IconTypes.Ionicons}
                name="calendar-outline"
                size={20}
                color={theme.primary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleRemoveConnection(connection)}
            >
              <Icon
                type={IconTypes.Ionicons}
                name="trash-outline"
                size={20}
                color={theme.error}
              />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {connections.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.emptyContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <Icon
            type={IconTypes.Ionicons}
            name="people-outline"
            size={64}
            color={theme.textTertiary}
          />
          <Text style={styles.emptyTitle}>No Connections Yet</Text>
          <Text style={styles.emptyText}>
            Scan a connection QR code to connect with other users
          </Text>
          <TouchableOpacity
            style={styles.connectButton}
            onPress={() => {
              // Open QR code modal - you might want to add a prop or navigation to do this
              navigation.navigate("Calendar");
            }}
          >
            <Text style={styles.connectButtonText}>Open QR Scanner</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {connections.map(renderConnection)}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  list: {
    flex: 1,
  },
  connectionCard: {
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  connectionContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.inputBackground,
    justifyContent: "center",
    alignItems: "center",
  },
  connectionInfo: {
    flex: 1,
  },
  connectionName: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.text,
    marginBottom: 4,
  },
  connectionUsername: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 4,
  },
  connectionDate: {
    fontSize: 12,
    color: theme.textTertiary,
  },
  pendingBadge: {
    alignSelf: "flex-start",
    backgroundColor: theme.warningBackground,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  pendingText: {
    fontSize: 11,
    color: theme.warning,
    fontWeight: "600",
  },
  connectionActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: theme.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: "center",
    marginBottom: 24,
  },
  connectButton: {
    backgroundColor: theme.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  connectButtonText: {
    color: theme.textOnPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ConnectionsScreen;
