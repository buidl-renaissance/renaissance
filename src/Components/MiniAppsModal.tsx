import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ImageSourcePropType,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DismissibleScrollModal } from "./DismissibleScrollModal";
import { useAuth } from "../context/Auth";
import { theme } from "../colors";

interface MiniApp {
  id: string;
  name: string;
  description: string;
  url: string;
  icon?: string;
  color: string;
  image?: ImageSourcePropType;
}

const MINI_APPS: MiniApp[] = [
  {
    id: "art",
    name: "Art",
    description: "Discover Detroit's vibrant art scene. Explore featured pieces and support local artists.",
    url: "native://Art",
    icon: "🎨",
    color: "#EC4899",
  },
  {
    id: "parking",
    name: "Parking",
    description: "Find and reserve parking spots in Detroit. Quick and easy parking solutions for events and daily needs.",
    url: "https://buymyspot.com/detroit",
    icon: "🅿️",
    color: "#10B981",
  },
  {
    id: "colab",
    name: "Co.Lab",
    description: "Turn conversations into collaborations with voice-first project planning for creative teams.",
    url: "https://co.lab.builddetroit.xyz/",
    icon: "🤝",
    color: "#8B5CF6",
  },
  {
    id: "restaurants",
    name: "Restaurants",
    description: "Discover and explore Detroit's dining scene. Find great restaurants and read reviews.",
    url: "native://Restaurants",
    icon: "🍽️",
    color: "#F59E0B",
  },
  {
    id: "gloabi",
    name: "Gloabi",
    description: "Connect and chat with the community. Join conversations and stay connected.",
    url: "https://gloabi-chat.vercel.app/",
    icon: "💬",
    color: "#6366F1",
  },
  {
    id: "games",
    name: "Games",
    description: "Explore gaming and entertainment experiences in Detroit, from virtual worlds to arcade bars.",
    url: "native://Games",
    icon: "🎮",
    color: "#059669",
  },
  {
    id: "fitness",
    name: "Fitness",
    description: "Discover climbing, yoga, and wellness experiences to stay active and healthy.",
    url: "native://Fitness",
    icon: "💪",
    color: "#DC2626",
  },
  {
    id: "vibe-code-detroit",
    name: "Vibe Code",
    description: "Join the Vibe Code Detroit community of tech enthusiasts building meaningful solutions through collaborative coding.",
    url: "https://vibe.builddetroit.xyz/",
    color: "#7C3AED",
    image: require("../../assets/vibe-code-detroit.png"),
  },
  {
    id: "d-newtech",
    name: "D-NewTech",
    description: "Connecting Detroit's startup community since 2010. Monthly meetups, powerful connections, and real stories from entrepreneurs.",
    url: "https://dnewtech.builddetroit.xyz/",
    color: "#0EA5E9",
    image: require("../../assets/d-new-tech.png"),
  },
  {
    id: "art-night-detroit",
    name: "Art Night",
    description: "Explore Detroit's vibrant art scene during Art Night Detroit, a celebration of galleries, studios, and creative spaces.",
    url: "https://artnightdetroit.com",
    color: "#4338CA",
    image: require("../../assets/art-night-detroit.png"),
  },
];

interface MiniAppsModalProps {
  isVisible: boolean;
  onClose: () => void;
  onOpenApp: (app: MiniApp) => void;
  onNavigateToAccount?: () => void;
}

export const MiniAppsModal: React.FC<MiniAppsModalProps> = ({
  isVisible,
  onClose,
  onOpenApp,
  onNavigateToAccount,
}) => {
  const { state: authState } = useAuth();

  const getAuthStatusLabel = () => {
    if (!authState.isAuthenticated) return "Not signed in";
    if (authState.user?.type === "farcaster") return `@${authState.user.username || "user"}`;
    if (authState.user?.type === "local_email") return authState.user.local?.email || "Email user";
    return "Guest";
  };

  const renderHeaderRight = () => {
    if (!onNavigateToAccount) return null;
    return (
      <TouchableOpacity
        style={styles.headerAccountButton}
        onPress={onNavigateToAccount}
      >
        <Ionicons
          name={authState.isAuthenticated ? "person-circle" : "person-circle-outline"}
          size={24}
          color={authState.isAuthenticated ? "#6366F1" : theme.textSecondary}
        />
      </TouchableOpacity>
    );
  };

  return (
    <DismissibleScrollModal
      isVisible={isVisible}
      onClose={onClose}
      title="Mini Apps"
      headerRight={renderHeaderRight()}
    >
      {({ onScroll, scrollEnabled }) => (
        <FlatList
          data={MINI_APPS}
          onScroll={onScroll}
          scrollEnabled={scrollEnabled}
          scrollEventThrottle={16}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <TouchableOpacity
              style={[
                styles.authBanner,
                authState.isAuthenticated && styles.authBannerAuthenticated,
              ]}
              onPress={onNavigateToAccount}
            >
              <View style={styles.authBannerContent}>
                <Ionicons
                  name={authState.isAuthenticated ? "checkmark-circle" : "alert-circle-outline"}
                  size={20}
                  color={authState.isAuthenticated ? "#10B981" : "#F59E0B"}
                />
                <View style={styles.authBannerText}>
                  <Text style={styles.authBannerTitle}>
                    {authState.isAuthenticated ? "Signed In" : "Sign in for full access"}
                  </Text>
                  <Text style={styles.authBannerSubtitle}>{getAuthStatusLabel()}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.appCard}
              onPress={() => onOpenApp(item)}
              activeOpacity={0.7}
            >
              <View style={[styles.appIconContainer, { backgroundColor: item.color }]}>
                {item.image ? (
                  <Image source={item.image} style={styles.appImage} />
                ) : (
                  <Text style={styles.appIcon}>{item.icon}</Text>
                )}
              </View>
              <View style={styles.appInfo}>
                <Text style={styles.appName}>{item.name}</Text>
                <Text style={styles.appDescription} numberOfLines={2}>
                  {item.description}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
        />
      )}
    </DismissibleScrollModal>
  );
};

const styles = StyleSheet.create({
  headerAccountButton: {
    padding: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  authBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.warningBackground || theme.surfaceElevated,
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
  },
  authBannerAuthenticated: {
    backgroundColor: theme.successBackground || theme.surface,
  },
  authBannerContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  authBannerText: {
    marginLeft: 10,
    flex: 1,
  },
  authBannerTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.text,
  },
  authBannerSubtitle: {
    fontSize: 12,
    color: theme.textSecondary,
    marginTop: 2,
  },
  appCard: {
    backgroundColor: theme.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  appIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  appIcon: {
    fontSize: 28,
  },
  appImage: {
    width: 56,
    height: 56,
    borderRadius: 14,
    resizeMode: "cover",
  },
  appInfo: {
    flex: 1,
    marginLeft: 14,
  },
  appName: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.text,
  },
  appDescription: {
    fontSize: 13,
    color: theme.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
});

