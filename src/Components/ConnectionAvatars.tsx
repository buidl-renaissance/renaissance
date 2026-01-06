import React from "react";
import { View, Image, Text, StyleSheet } from "react-native";
import { ConnectionBookmarkUser } from "../api/bookmarks";
import { theme } from "../colors";

interface ConnectionAvatarsProps {
  /** List of connections who have bookmarked this event */
  connections: ConnectionBookmarkUser[];
  /** Maximum number of avatars to show before "+X more" */
  maxDisplay?: number;
  /** Size of each avatar */
  size?: number;
  /** Whether to show the label "Friends going" */
  showLabel?: boolean;
}

/**
 * Displays a row of overlapping connection avatars with an optional count
 */
export const ConnectionAvatars: React.FC<ConnectionAvatarsProps> = ({
  connections,
  maxDisplay = 3,
  size = 20,
  showLabel = false,
}) => {
  if (!connections || connections.length === 0) {
    return null;
  }

  const displayConnections = connections.slice(0, maxDisplay);
  const remainingCount = Math.max(0, connections.length - maxDisplay);
  const overlapOffset = size * 0.6; // How much avatars overlap

  return (
    <View style={styles.container}>
      <View style={[styles.avatarsRow, { height: size }]}>
        {displayConnections.map((connection, index) => (
          <View
            key={connection.id}
            style={[
              styles.avatarWrapper,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                marginLeft: index === 0 ? 0 : -overlapOffset,
                zIndex: displayConnections.length - index, // Later avatars appear on top
              },
            ]}
          >
            {connection.profilePicture ? (
              <Image
                source={{ uri: connection.profilePicture }}
                style={[
                  styles.avatar,
                  {
                    width: size - 2,
                    height: size - 2,
                    borderRadius: (size - 2) / 2,
                  },
                ]}
              />
            ) : (
              <View
                style={[
                  styles.avatarPlaceholder,
                  {
                    width: size - 2,
                    height: size - 2,
                    borderRadius: (size - 2) / 2,
                  },
                ]}
              >
                <Text style={[styles.avatarInitial, { fontSize: size * 0.4 }]}>
                  {connection.username?.[0]?.toUpperCase() || connection.name?.[0]?.toUpperCase() || "?"}
                </Text>
              </View>
            )}
          </View>
        ))}
        {remainingCount > 0 && (
          <View
            style={[
              styles.avatarWrapper,
              styles.moreCount,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                marginLeft: -overlapOffset,
                zIndex: 0,
              },
            ]}
          >
            <Text style={[styles.moreCountText, { fontSize: size * 0.4 }]}>
              +{remainingCount}
            </Text>
          </View>
        )}
      </View>
      {showLabel && (
        <Text style={styles.label}>
          {connections.length === 1
            ? `${connections[0].username || connections[0].name || "1 friend"} is interested`
            : `${connections.length} friends are interested`}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarWrapper: {
    borderWidth: 1.5,
    borderColor: theme.background,
    backgroundColor: theme.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    resizeMode: "cover",
  },
  avatarPlaceholder: {
    backgroundColor: "#8B5CF6",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  moreCount: {
    backgroundColor: "#8B5CF6",
  },
  moreCountText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  label: {
    marginLeft: 6,
    fontSize: 10,
    color: "#8B5CF6",
    fontWeight: "500",
  },
});

export default ConnectionAvatars;
