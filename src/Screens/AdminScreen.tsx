import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { lightGreen } from "../colors";

interface AdminMenuItem {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  screen: string;
}

const adminMenuItems: AdminMenuItem[] = [
  {
    title: "Review Events",
    subtitle: "Review and approve submitted events",
    icon: "calendar-outline",
    screen: "ReviewEvents",
  },
  {
    title: "DPoP Authentication",
    subtitle: "Manage decentralized proof of possession",
    icon: "shield-checkmark-outline",
    screen: "DPoPAuth",
  },
  {
    title: "Files",
    subtitle: "Manage uploaded files and media",
    icon: "folder-outline",
    screen: "Files",
  },
  {
    title: "Audio Content",
    subtitle: "Manage audio recordings and podcasts",
    icon: "musical-notes-outline",
    screen: "AudioContent",
  },
  {
    title: "Content Upload",
    subtitle: "Upload new content to the platform",
    icon: "cloud-upload-outline",
    screen: "ContentUpload",
  },
  {
    title: "Get Connected",
    subtitle: "User registration and onboarding",
    icon: "people-outline",
    screen: "GetStarted",
  },
];

interface AdminScreenProps {
  navigation: any;
}

const AdminScreen: React.FC<AdminScreenProps> = ({ navigation }) => {
  React.useEffect(() => {
    navigation.setOptions({
      title: "Admin",
    });
  }, [navigation]);

  const handleMenuPress = (screen: string) => {
    navigation.navigate(screen);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Ionicons name="settings-outline" size={48} color="#333" />
          <Text style={styles.headerTitle}>Admin Panel</Text>
          <Text style={styles.headerSubtitle}>
            Manage your content and settings
          </Text>
        </View>

        <View style={styles.menuContainer}>
          {adminMenuItems.map((item, index) => (
            <TouchableOpacity
              key={item.screen}
              style={[
                styles.menuItem,
                index === adminMenuItems.length - 1 && styles.menuItemLast,
              ]}
              onPress={() => handleMenuPress(item.screen)}
              activeOpacity={0.7}
            >
              <View style={styles.menuIconContainer}>
                <Ionicons name={item.icon} size={24} color="#333" />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightGreen,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginTop: 12,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 4,
  },
  menuContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  menuSubtitle: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
});

export default AdminScreen;

