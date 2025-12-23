import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FoodPost } from "../interfaces";
import { MOCK_RESTAURANTS } from "../mocks/restaurants";
import { ChatBox } from "./ChatBox";

interface FoodPostCardProps {
  post: FoodPost;
  onLike?: () => void;
  onSubmitComment?: (text: string) => void;
}

export const FoodPostCard: React.FC<FoodPostCardProps> = ({
  post,
  onLike,
  onSubmitComment,
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const restaurant = MOCK_RESTAURANTS.find((r) => r.id === post.restaurantId);

  const handleLike = () => {
    setIsLiked(!isLiked);
    if (onLike) onLike();
  };

  const handleSubmitComment = (text: string) => {
    if (onSubmitComment) {
      onSubmitComment(text);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          {post.userAvatar ? (
            <Image source={{ uri: post.userAvatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={20} color="#ccc" />
            </View>
          )}
          <View>
            <Text style={styles.userName}>{post.userName}</Text>
            {restaurant && (
              <Text style={styles.restaurantName}>{restaurant.name}</Text>
            )}
          </View>
        </View>
        <Text style={styles.timestamp}>
          {new Date(post.timestamp).toLocaleDateString()}
        </Text>
      </View>

      {post.image ? (
        <Image source={{ uri: post.image }} style={styles.image} />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Ionicons name="restaurant" size={40} color="#ccc" />
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.caption}>{post.caption}</Text>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleLike}
          >
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={24}
              color={isLiked ? "#F44336" : "#666"}
            />
            <Text style={styles.actionCount}>
              {(post.likes || 0) + (isLiked ? 1 : 0)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowComments(!showComments)}
          >
            <Ionicons name="chatbubble-outline" size={24} color="#666" />
            <Text style={styles.actionCount}>{post.comments.length}</Text>
          </TouchableOpacity>
        </View>

        {showComments && (
          <View style={styles.commentsSection}>
            <ChatBox
              comments={post.comments}
              handleSubmit={handleSubmitComment}
            />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  restaurantName: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  timestamp: {
    fontSize: 12,
    color: "#999",
  },
  image: {
    width: "100%",
    height: 300,
    resizeMode: "cover",
  },
  imagePlaceholder: {
    width: "100%",
    height: 300,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: 12,
  },
  caption: {
    fontSize: 14,
    color: "#333",
    marginBottom: 12,
    lineHeight: 20,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 24,
  },
  actionCount: {
    fontSize: 14,
    color: "#666",
    marginLeft: 6,
  },
  commentsSection: {
    marginTop: 12,
  },
});

