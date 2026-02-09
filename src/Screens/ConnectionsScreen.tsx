import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { HeaderTitleImage } from "../Components/HeaderTitleImage";
import { ConnectionsContent } from "../Components/ConnectionsContent";
import { QRCodeContent } from "../Components/QRCodeContent";
import Icon, { IconTypes } from "../Components/Icon";
import { theme } from "../colors";
import { Connection } from "../utils/connections";

interface ConnectionsScreenProps {
  navigation: any;
}

const ConnectionsScreen: React.FC<ConnectionsScreenProps> = ({ navigation }) => {
  const [isScreenFocused, setIsScreenFocused] = useState(false);
  const [activeView, setActiveView] = useState<"connections" | "qr">("connections");

  const handleToggleView = useCallback(() => {
    setActiveView((prev) => (prev === "connections" ? "qr" : "connections"));
  }, []);

  // Set header options based on active view
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: activeView === "connections" ? () => <HeaderTitleImage /> : "Connect",
      headerRight: () => (
        <TouchableOpacity
          onPress={handleToggleView}
          style={styles.headerButton}
        >
          <Icon
            type={IconTypes.Ionicons}
            name={activeView === "connections" ? "qr-code-outline" : "people-outline"}
            size={24}
            color={theme.primary}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation, activeView, handleToggleView]);

  // Track screen focus for polling
  useFocusEffect(
    useCallback(() => {
      setIsScreenFocused(true);
      return () => {
        setIsScreenFocused(false);
      };
    }, [])
  );

  const handleViewSharedEvents = useCallback((connection: Connection, otherUser: any) => {
    navigation.navigate("SharedEvents", { connection, otherUser });
  }, [navigation]);

  const handleConnectionCreated = useCallback(() => {
    // Switch back to connections view after creating a connection
    setActiveView("connections");
  }, []);

  return (
    <View style={styles.container}>
      {activeView === "connections" ? (
        <ConnectionsContent
          isVisible={isScreenFocused}
          onViewSharedEvents={handleViewSharedEvents}
          onOpenQRScanner={handleToggleView}
        />
      ) : (
        <QRCodeContent
          isVisible={isScreenFocused}
          onConnectionCreated={handleConnectionCreated}
          containerStyle={styles.qrContent}
          onAuthenticationScan={(token) => {
            navigation.navigate("Authenticate", { token });
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  headerButton: {
    padding: 8,
    marginRight: 8,
  },
  qrContent: {
    flex: 1,
    paddingTop: 16,
  },
});

export default ConnectionsScreen;
