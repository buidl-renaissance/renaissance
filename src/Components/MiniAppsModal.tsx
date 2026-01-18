import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SectionList,
  Image,
  ImageSourcePropType,
} from "react-native";
import { DismissibleScrollModal } from "./DismissibleScrollModal";
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

interface MiniAppSection {
  title: string;
  data: MiniApp[];
}

const MINI_APP_SECTIONS: MiniAppSection[] = [
  {
    title: "Featured",
    data: [
      {
        id: "events",
        name: "Events",
        description: "Discover what's happening in Detroit. Browse upcoming events, concerts, and community gatherings.",
        url: "https://events.builddetroit.xyz/",
        color: "#6366F1",
        image: require("../../assets/renaissance-events.png"),
      },
      {
        id: "art",
        name: "Art",
        description: "Discover Detroit's vibrant art scene. Explore featured pieces and support local artists.",
        url: "native://Art",
        icon: "🎨",
        color: "#EC4899",
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
    ],
  },
  {
    title: "Community & Tech",
    data: [
      {
        id: "tech",
        name: "Tech",
        description: "Explore Detroit's tech community with Vibe Code, D-NewTech, and more. Build, learn, and collaborate.",
        url: "native://Tech",
        icon: "💻",
        color: "#7C3AED",
      },
      {
        id: "djq",
        name: "DJQ",
        description: "Your city's dopest open decks experience — tap in for a 20-minute set, link up for back-to-backs.",
        url: "https://djq.builddetroit.xyz/dashboard",
        color: "#0D0D12",
        image: require("../../assets/djq-icon-texture.png"),
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
        id: "gloabi",
        name: "Gloabi",
        description: "Connect and chat with the community. Join conversations and stay connected.",
        url: "https://gloabi-chat.vercel.app/",
        icon: "💬",
        color: "#6366F1",
      },
      {
        id: "linked",
        name: "Linked",
        description: "Connect with Detroit's professional network and build meaningful relationships.",
        url: "https://linked.builddetroit.xyz/",
        color: "#0A66C2",
        image: require("../../assets/linked.png"),
      },
    ],
  },
  {
    title: "Arts & Culture",
    data: [
      {
        id: "art-night-detroit",
        name: "Art Night",
        description: "Explore Detroit's vibrant art scene during Art Night Detroit, a celebration of galleries, studios, and creative spaces.",
        url: "https://artnightdetroit.com",
        color: "#4338CA",
        image: require("../../assets/art-night-detroit.png"),
      },
      {
        id: "art-detroit-now",
        name: "Art Detroit Now",
        description: "Discover contemporary art events and exhibitions happening across Detroit.",
        url: "https://www.artdetroitnow.com/",
        color: "#EC4899",
        image: require("../../assets/art-detroit-now.png"),
      },
      {
        id: "artclvb",
        name: "ArtClvb",
        description: "A creative community platform connecting artists and art lovers in Detroit.",
        url: "https://www.artclvb.xyz/",
        color: "#10B981",
        image: require("../../assets/artclvb.jpg"),
      },
      {
        id: "be-the-light",
        name: "Be The Light",
        description: "A transformative art experience bringing light installations to Detroit.",
        url: "https://bethelight222.com/",
        color: "#14B8A6",
        image: require("../../assets/be-the-light.webp"),
      },
      {
        id: "heidelberg",
        name: "Heidelberg Project",
        description: "An outdoor art environment in Detroit's east side, transforming a neighborhood through art.",
        url: "https://www.heidelberg.org/",
        color: "#10B981",
        image: require("../../assets/heidelberg.png"),
      },
      {
        id: "art-park",
        name: "Make Art Work",
        description: "Detroit's creative workspace and art park supporting local artists.",
        url: "https://www.makeartworkdetroit.com/",
        color: "#14B8A6",
        image: require("../../assets/make-art-work.png"),
      },
      {
        id: "dia",
        name: "Detroit Institute of Arts",
        description: "One of the largest and most significant art collections in the United States.",
        url: "https://dia.org/",
        icon: "🏛️",
        color: "#3B82F6",
      },
      {
        id: "dam",
        name: "Detroit Artists Market",
        description: "A nonprofit gallery supporting Michigan artists since 1932.",
        url: "https://detroitartistsmarket.org/",
        icon: "🎨",
        color: "#EC4899",
      },
      {
        id: "scarab-club",
        name: "Scarab Club",
        description: "A historic artists' club fostering creativity since 1907.",
        url: "https://scarabclub.org/",
        icon: "🦋",
        color: "#10B981",
      },
      {
        id: "cranbrook",
        name: "Cranbrook Art Museum",
        description: "A contemporary art museum showcasing innovative design and art.",
        url: "https://cranbrookartmuseum.org/",
        icon: "🏛️",
        color: "#14B8A6",
      },
      {
        id: "barbed-magazine",
        name: "Barbed Magazine",
        description: "An arts and culture publication covering Detroit's creative scene.",
        url: "https://barbedmagazine.com/",
        icon: "🖼️",
        color: "#8B5CF6",
      },
      {
        id: "runner-magazine",
        name: "Runner Magazine",
        description: "Detroit art and culture publication featuring local artists.",
        url: "https://www.runnerdetroit.run/runnerart.html",
        icon: "📰",
        color: "#F59E0B",
      },
      {
        id: "feedspot-blogs",
        name: "Detroit Art Blogs",
        description: "Curated collection of Detroit art blogs and creative writing.",
        url: "https://blog.feedspot.com/detroit_art_blogs/",
        icon: "📚",
        color: "#EF4444",
      },
      {
        id: "andrea-burg",
        name: "Andrea Burg",
        description: "Explore the portfolio of Andrea Burg, a Detroit-based visual artist.",
        url: "http://burg-ink.vercel.app/",
        color: "#7C3AED",
        image: require("../../assets/andrea-burg.jpg"),
      },
    ],
  },
  {
    title: "Gaming & Entertainment",
    data: [
      {
        id: "mystic-island",
        name: "Mystic Island",
        description: "Explore a virtual world adventure set in a mystical island environment.",
        url: "https://mystic-island.yourland.network/",
        icon: "🏝️",
        color: "#14B8A6",
      },
      {
        id: "beacon-hq",
        name: "Beacon HQ",
        description: "Detroit's premier gaming and esports venue.",
        url: "https://www.thebeaconhq.com/",
        icon: "🎮",
        color: "#059669",
      },
      {
        id: "collector-quest",
        name: "Collector Quest",
        description: "An AI-powered collectibles discovery and trading experience.",
        url: "https://collectorquest.ai",
        icon: "🏆",
        color: "#3B82F6",
      },
    ],
  },
  {
    title: "Fitness & Wellness",
    data: [
      {
        id: "citizen-yoga",
        name: "Citizen Yoga",
        description: "Alignment-based yoga classes including Vinyasa, Slow Burn, and Restore. Multiple Detroit-area locations.",
        url: "https://citizenyogastudio.com",
        icon: "🧘",
        color: "#7C3AED",
      },
      {
        id: "dyno-detroit",
        name: "Dyno Detroit",
        description: "Detroit's premier rock climbing gym for all skill levels.",
        url: "https://dynodetroit.com",
        icon: "🧗",
        color: "#DC2626",
      },
      {
        id: "hot-bones",
        name: "Hot Bones",
        description: "Hot yoga and wellness studio in Detroit.",
        url: "https://hotbones.com",
        icon: "🧘",
        color: "#F97316",
      },
      {
        id: "detroit-yoga-lab",
        name: "Detroit Yoga Lab",
        description: "Vinyasa, Yin, and Restorative yoga classes in Midtown Detroit for all skill levels.",
        url: "https://www.detroityogalab.com",
        icon: "🪷",
        color: "#14B8A6",
      },
      {
        id: "detroit-body-garage",
        name: "Detroit Body Garage",
        description: "Strength training, circuit workouts, and personal training in a community-focused environment.",
        url: "https://www.detroitbodygarage.com",
        icon: "💪",
        color: "#EF4444",
      },
      {
        id: "313-bjj",
        name: "313 Brazilian Jiu-Jitsu",
        description: "Brazilian Jiu-Jitsu training for all skill levels on Grand River Ave in Detroit.",
        url: "https://313bjj.com",
        icon: "🥋",
        color: "#1F2937",
      },
      {
        id: "hustle-flow-lab",
        name: "Hustle Flow Lab",
        description: "Dance cardio, HIIT, sculpt, and yoga in Midtown promoting body positivity and creative movement.",
        url: "https://www.hustleflowlab.com",
        icon: "💃",
        color: "#8B5CF6",
      },
      {
        id: "foundry-13",
        name: "Foundry 13 Detroit",
        description: "World-class strength and conditioning, personal training, and group fitness classes.",
        url: "https://foundry13detroit.com",
        icon: "🏋️",
        color: "#059669",
      },
    ],
  },
  {
    title: "Utilities",
    data: [
      {
        id: "parking",
        name: "Parking",
        description: "Find and reserve parking spots in Detroit. Quick and easy parking solutions for events and daily needs.",
        url: "https://buymyspot.com/detroit",
        icon: "🅿️",
        color: "#10B981",
      },
    ],
  },
];

interface MiniAppsModalProps {
  isVisible: boolean;
  onClose: () => void;
  onOpenApp: (app: MiniApp) => void;
}

export const MiniAppsModal: React.FC<MiniAppsModalProps> = ({
  isVisible,
  onClose,
  onOpenApp,
}) => {
  const renderSectionHeader = ({ section }: { section: MiniAppSection }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
    </View>
  );

  const renderItem = ({ item }: { item: MiniApp }) => (
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
  );

  return (
    <DismissibleScrollModal
      isVisible={isVisible}
      onClose={onClose}
      title="App Blocks"
    >
      {({ onScroll, scrollEnabled }) => (
        <SectionList
          sections={MINI_APP_SECTIONS}
          onScroll={onScroll}
          scrollEnabled={scrollEnabled}
          scrollEventThrottle={16}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={false}
          renderSectionHeader={renderSectionHeader}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
        />
      )}
    </DismissibleScrollModal>
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  sectionHeader: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
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

