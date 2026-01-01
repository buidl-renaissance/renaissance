import React from "react";
import { StyleSheet, TouchableOpacity, Image, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/Auth";
import Icon, { IconTypes } from "./Icon";

interface FloatingProfileButtonProps {
  onPress?: () => void;
  navigation?: any;
}

export const FloatingProfileButton = ({ onPress, navigation }: FloatingProfileButtonProps) => {
  const { state: authState } = useAuth();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (navigation) {
      // Navigate to AccountManagement (same as miniapp screen)
      navigation.navigate("AccountManagement");
    }
  };

  // Show login button when not authenticated
  if (!authState.isAuthenticated) {
    return (
      <View style={styles.loginButtonContainer}>
        <TouchableOpacity onPress={handlePress} style={styles.loginButton} activeOpacity={0.7}>
          <Text style={styles.loginText}>Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableOpacity onPress={handlePress} style={styles.button} activeOpacity={0.8}>
      {authState.user?.pfpUrl ? (
        <Image
          key={authState.user.pfpUrl}
          source={{ uri: authState.user.pfpUrl }}
          style={styles.profileImage}
        />
      ) : (
        <View style={styles.profileImagePlaceholder}>
          <Ionicons name="person" size={20} color="white" />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#6366F1",
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    top: 60, // Match the top position of action buttons
    right: 16, // Align with action buttons container
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 2.5,
    borderColor: "white",
  },
  loginButtonContainer: {
    position: "absolute",
    top: 60, // Match the top position of action buttons
    right: 16, // Align with action buttons container
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF", // Solid white for efficient shadow calculation
    borderRadius: 20,
    paddingHorizontal: 6,
    paddingVertical: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  loginButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loginText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  profileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  profileImagePlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
});

