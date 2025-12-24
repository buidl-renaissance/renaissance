import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Icon, { IconTypes } from "./Icon";
import { useAuth } from "../context/Auth";

interface FloatingActionButtonsProps {
  onMapPress?: () => void;
  onSearchPress?: () => void;
  onBookmarkPress?: () => void;
  onChatPress?: () => void;
  onQRCodePress?: () => void;
  onAppsPress?: () => void;
  onAdminPress?: () => void;
  showAdmin?: boolean;
}

export const FloatingActionButtons: React.FC<FloatingActionButtonsProps> = ({
  onMapPress,
  onSearchPress,
  onBookmarkPress,
  onChatPress,
  onQRCodePress,
  onAppsPress,
  onAdminPress,
  showAdmin = false,
}) => {
  const { state: authState } = useAuth();
  const buttons = [
    onMapPress && { onPress: onMapPress, icon: "map-outline", type: IconTypes.Ionicons },
    onSearchPress && { onPress: onSearchPress, icon: "search", type: IconTypes.Ionicons },
    onBookmarkPress && { onPress: onBookmarkPress, icon: "bookmark-outline", type: IconTypes.Ionicons },
    onChatPress && { onPress: onChatPress, icon: "chat", type: IconTypes.MaterialIcons },
    onQRCodePress && { onPress: onQRCodePress, icon: "qr-code-outline", type: IconTypes.Ionicons },
    onAppsPress && { onPress: onAppsPress, icon: "apps-outline", type: IconTypes.Ionicons },
    showAdmin && onAdminPress && { onPress: onAdminPress, icon: "settings-outline", type: IconTypes.Ionicons },
  ].filter((button): button is { onPress: () => void; icon: string; type: IconTypes } => Boolean(button));

  return (
    <View style={styles.container}>
      <View style={[
        styles.buttonContainer,
        { marginRight: authState.isAuthenticated ? 50 : 12 }
      ]}>
        {buttons.map((button, index) => (
          <TouchableOpacity
            key={index}
            onPress={button.onPress}
            style={[
              styles.button,
              index < buttons.length - 1 && styles.buttonWithDivider,
            ]}
            activeOpacity={0.7}
          >
            <Icon type={button.type} name={button.icon} size={18} color="#333" />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 60, // Position at top with safe area padding
    left: 0,
    right: 16, // Align with profile button (right: 16)
    alignItems: "flex-end",
    justifyContent: "flex-start",
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 20,
    paddingHorizontal: 6,
    paddingVertical: 4,
    // marginRight is set dynamically based on auth state
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
  },
  button: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonWithDivider: {
    borderRightWidth: 1,
    borderRightColor: "rgba(0, 0, 0, 0.1)",
  },
});

