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
          <Ionicons name="person" size={28} color="white" />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: "#6366F1",
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    bottom: 30,
    right: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 2,
    borderColor: "white",
  },
  profileImage: {
    width: 62,
    height: 62,
    borderRadius: 31,
  },
  profileImagePlaceholder: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
});

