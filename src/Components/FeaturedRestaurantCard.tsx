import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
} from "react-native";
import { theme } from "../colors";

interface FeaturedRestaurantCardProps {
  title: string;
  tagline: string;
  description: string;
  image: ImageSourcePropType;
  backgroundColor: string;
  onPress: () => void;
}

export const FeaturedRestaurantCard: React.FC<FeaturedRestaurantCardProps> = ({
  title,
  tagline,
  description,
  image,
  backgroundColor,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor }]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        <Image source={image} style={styles.image} resizeMode="contain" />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.tagline}>{tagline}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    overflow: "hidden",
    flexDirection: "row",
    minHeight: 140,
  },
  imageContainer: {
    width: 100,
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
  },
  image: {
    width: 76,
    height: 76,
    borderRadius: 12,
  },
  content: {
    flex: 1,
    padding: 16,
    paddingLeft: 4,
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  tagline: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.95)",
    marginBottom: 8,
    fontStyle: "italic",
  },
  description: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.85)",
    lineHeight: 18,
  },
});
