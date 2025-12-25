import React from "react";
import { StyleSheet, TouchableOpacity, Image, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/Auth";

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
      if (authState.isAuthenticated && authState.user?.type === "farcaster") {
        navigation.navigate("FarcasterProfile");
      } else {
        navigation.navigate("AccountManagement");
      }
    }
  };

  if (!authState.isAuthenticated) {
    return null;
  }

  return (
    <TouchableOpacity onPress={handlePress} style={styles.button} activeOpacity={0.8}>
      {authState.user?.pfpUrl ? (
        <Image
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

