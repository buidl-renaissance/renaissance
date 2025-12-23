import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BucketList } from "../interfaces";

interface BucketListCardProps {
  bucketList: BucketList;
  onPress?: () => void;
  onEdit?: () => void;
  onShare?: () => void;
}

export const BucketListCard: React.FC<BucketListCardProps> = ({
  bucketList,
  onPress,
  onEdit,
  onShare,
}) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="list" size={24} color="#3449ff" />
        </View>
        <View style={styles.content}>
          <Text style={styles.name}>{bucketList.name}</Text>
          <Text style={styles.count}>
            {bucketList.restaurants.length} restaurant
            {bucketList.restaurants.length !== 1 ? "s" : ""}
          </Text>
        </View>
        {bucketList.isShared && (
          <View style={styles.sharedBadge}>
            <Ionicons name="people" size={14} color="#4CAF50" />
            <Text style={styles.sharedText}>
              {bucketList.collaborators.length + 1}
            </Text>
          </View>
        )}
      </View>
      {bucketList.collaborators.length > 0 && (
        <View style={styles.collaboratorsContainer}>
          <Text style={styles.collaboratorsLabel}>Collaborators:</Text>
          <Text style={styles.collaboratorsText}>
            {bucketList.collaborators.length} friend
            {bucketList.collaborators.length !== 1 ? "s" : ""}
          </Text>
        </View>
      )}
      <View style={styles.actions}>
        {onEdit && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          >
            <Ionicons name="create-outline" size={18} color="#666" />
            <Text style={styles.actionText}>Edit</Text>
          </TouchableOpacity>
        )}
        {onShare && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={(e) => {
              e.stopPropagation();
              onShare();
            }}
          >
            <Ionicons name="share-outline" size={18} color="#666" />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  count: {
    fontSize: 14,
    color: "#666",
  },
  sharedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e8f5e9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sharedText: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "600",
    marginLeft: 4,
  },
  collaboratorsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  collaboratorsLabel: {
    fontSize: 12,
    color: "#999",
    marginRight: 4,
  },
  collaboratorsText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  actionText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
});

