import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTenant } from "../context/TenantContext";
import { theme } from "../colors";

export function TenantBadge() {
  const { displayName, image } = useTenant();
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      style={styles.badge}
      onPress={() => navigation.navigate("TenantSelect")}
      activeOpacity={0.7}
    >
      <Image source={image} style={styles.badgeImage} />
      <Text style={styles.text} numberOfLines={1}>
        {displayName}
      </Text>
    </TouchableOpacity>
  );
}

const BADGE_HEIGHT = 40; // Match FloatingProfileButton height

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    height: BADGE_HEIGHT,
    paddingLeft: 4,
    paddingRight: 14,
    backgroundColor: theme.surface,
    borderRadius: BADGE_HEIGHT / 2,
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  badgeImage: {
    width: 32,
    height: 32,
    borderRadius: 24,
    marginRight: 8,
  },
  text: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.text,
    maxWidth: 120,
  },
});
