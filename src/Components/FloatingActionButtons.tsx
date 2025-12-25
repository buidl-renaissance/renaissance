import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Icon, { IconTypes } from "./Icon";

interface FloatingActionButtonsProps {
  onMapPress?: () => void;
  onSearchPress?: () => void;
  onBookmarkPress?: () => void;
  onChatPress?: () => void;
  onQRCodePress?: () => void;
  onWalletPress?: () => void;
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
  onWalletPress,
  onAppsPress,
  onAdminPress,
  showAdmin = false,
}) => {
  // Filter to show main buttons: map, bookmark, chat, mini apps (search moved to far right)
  const mainButtons = [
    onMapPress && { onPress: onMapPress, icon: "map-outline", type: IconTypes.Ionicons },
    onBookmarkPress && { onPress: onBookmarkPress, icon: "bookmark-outline", type: IconTypes.Ionicons },
    onChatPress && { onPress: onChatPress, icon: "chat", type: IconTypes.MaterialIcons },
    onAppsPress && { onPress: onAppsPress, icon: "apps-outline", type: IconTypes.Ionicons },
  ].filter((button): button is { onPress: () => void; icon: string; type: IconTypes } => Boolean(button));

  return (
    <>
      {/* Top bar with wallet and QR code buttons */}
      {(onWalletPress || onQRCodePress) && (
        <View style={styles.topContainer}>
          <View style={styles.topButtonContainer}>
            {onWalletPress && (
              <TouchableOpacity
                onPress={onWalletPress}
                style={[styles.topButton, onQRCodePress && styles.topButtonWithDivider]}
                activeOpacity={0.7}
              >
                <Icon type={IconTypes.Ionicons} name="wallet-outline" size={18} color="#333" />
              </TouchableOpacity>
            )}
            {onQRCodePress && (
              <TouchableOpacity
                onPress={onQRCodePress}
                style={styles.topButton}
                activeOpacity={0.7}
              >
                <Icon type={IconTypes.Ionicons} name="qr-code-outline" size={18} color="#333" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
      
      {/* Bottom navigation bar */}
      <View style={styles.container}>
        <View style={styles.navigationBar}>
          {mainButtons.map((button, index) => (
            <TouchableOpacity
              key={index}
              onPress={button.onPress}
              style={[styles.navButton, index < mainButtons.length - 1 && styles.navButtonWithDivider]}
              activeOpacity={0.7}
            >
              <Icon type={button.type} name={button.icon} size={22} color="#333" />
            </TouchableOpacity>
          ))}
        </View>
        {onSearchPress && (
          <TouchableOpacity
            style={styles.searchButton}
            onPress={onSearchPress}
            activeOpacity={0.7}
          >
            <Icon type={IconTypes.Ionicons} name="search" size={22} color="#333" />
          </TouchableOpacity>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  topContainer: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 16,
    alignItems: "flex-end",
    justifyContent: "flex-start",
  },
  topButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 20,
    paddingHorizontal: 6,
    paddingVertical: 4,
    marginRight: 56, // Space for profile button (40px) + gap (16px)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
  },
  topButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  topButtonWithDivider: {
    borderRightWidth: 1,
    borderRightColor: "rgba(0, 0, 0, 0.1)",
  },
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingLeft: 16,
    paddingRight: 16,
    paddingBottom: 20,
    paddingTop: 12,
  },
  navigationBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 30,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.9)",
  },
  navButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  navButtonWithDivider: {
    borderRightWidth: 1,
    borderRightColor: "rgba(0, 0, 0, 0.1)",
  },
  searchButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.9)",
  },
});

