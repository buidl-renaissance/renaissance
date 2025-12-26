import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DismissibleScrollModal } from "./DismissibleScrollModal";
import { useAuth } from "../context/Auth";

interface MiniApp {
  id: string;
  name: string;
  description: string;
  url: string;
  icon: string;
  color: string;
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
    id: "quests",
    name: "Quests",
    description: "Collect NFTs, complete quests, and earn rewards. Explore the world of digital collectibles and blockchain gaming.",
    url: "https://collectorquest.ai",
    icon: "🏆",
    color: "#3B82F6",
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
    id: "mystic-island",
    name: "Mystic Island",
    description: "Build. Connect. Grow. Communities forge realms, realms forge totems, totems forge worlds.",
    url: "https://mystic-island.yourland.network/",
    icon: "🏝️",
    color: "#14B8A6",
  },
  {
    id: "dyno-detroit",
    name: "Dyno Detroit",
    description: "Explore climbing and fitness experiences in Detroit.",
    url: "https://dynodetroit.com",
    icon: "🧗",
    color: "#DC2626",
  },
  {
    id: "hot-bones",
    name: "Hot Bones",
    description: "Discover wellness and relaxation experiences.",
    url: "https://hotbones.com",
    icon: "🧘",
    color: "#F97316",
  },
  {
    id: "beacon-hq",
    name: "Beacon HQ",
    description: "Explore gaming and entertainment experiences.",
    url: "https://www.thebeaconhq.com/",
    icon: "🎮",
    color: "#059669",
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
          color={authState.isAuthenticated ? "#6366F1" : "#666"}
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
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.appCard}
              onPress={() => onOpenApp(item)}
              activeOpacity={0.7}
            >
              <View style={[styles.appIconContainer, { backgroundColor: item.color }]}>
                <Text style={styles.appIcon}>{item.icon}</Text>
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
    backgroundColor: "#FEF3C7",
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
  },
  authBannerAuthenticated: {
    backgroundColor: "#D1FAE5",
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
    color: "#333",
  },
  authBannerSubtitle: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  appCard: {
    backgroundColor: "#fff",
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
  },
  appIcon: {
    fontSize: 28,
  },
  appInfo: {
    flex: 1,
    marginLeft: 14,
  },
  appName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  appDescription: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
    lineHeight: 18,
  },
});

