import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { DismissibleScrollModal } from "./DismissibleScrollModal";
import { ConnectionsContent } from "./ConnectionsContent";
import { QRCodeContent } from "./QRCodeContent";
import Icon, { IconTypes } from "./Icon";
import { theme } from "../colors";
import { Connection } from "../utils/connections";

interface ConnectionsModalProps {
  isVisible: boolean;
  onClose: () => void;
  onViewSharedEvents?: (connection: Connection, otherUser: any) => void;
  onAuthenticationScan?: (token: string) => void;
}

export const ConnectionsModal: React.FC<ConnectionsModalProps> = ({
  isVisible,
  onClose,
  onViewSharedEvents,
  onAuthenticationScan,
}) => {
  const [activeView, setActiveView] = useState<"connections" | "qr">("connections");

  const handleViewSharedEvents = useCallback((connection: Connection, otherUser: any) => {
    if (onViewSharedEvents) {
      onViewSharedEvents(connection, otherUser);
      onClose();
    }
  }, [onViewSharedEvents, onClose]);

  const handleToggleView = useCallback(() => {
    setActiveView((prev) => (prev === "connections" ? "qr" : "connections"));
  }, []);

  const handleConnectionCreated = useCallback(() => {
    // Switch back to connections view after creating a connection
    setActiveView("connections");
  }, []);

  // Reset to connections view when modal closes
  React.useEffect(() => {
    if (!isVisible) {
      setActiveView("connections");
    }
  }, [isVisible]);

  return (
    <DismissibleScrollModal
      isVisible={isVisible}
      onClose={onClose}
      title={activeView === "connections" ? "Connections" : "Connect"}
      backgroundColor={theme.background}
      headerRight={
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
      }
    >
      {({ onScroll, scrollEnabled }) => (
        <View style={styles.contentContainer}>
          {activeView === "connections" ? (
            <ConnectionsContent
              isVisible={isVisible}
              onViewSharedEvents={handleViewSharedEvents}
              onOpenQRScanner={handleToggleView}
              onScroll={onScroll}
              scrollEnabled={scrollEnabled}
            />
          ) : (
            <QRCodeContent
              isVisible={isVisible}
              onConnectionCreated={handleConnectionCreated}
              onAuthenticationScan={onAuthenticationScan}
            />
          )}
        </View>
      )}
    </DismissibleScrollModal>
  );
};

const styles = StyleSheet.create({
  headerButton: {
    padding: 4,
    marginRight: 8,
  },
  contentContainer: {
    flex: 1,
  },
});
