import React from "react";
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator } from "react-native";
import Modal from "react-native-modal";
import { WebView } from "react-native-webview";
import Icon, { IconTypes } from "./Icon";

interface EventWebModalProps {
  isVisible: boolean;
  url: string | null;
  title?: string;
  onClose: () => void;
  eventType?: 'ra' | 'luma' | 'da';
  eventData?: any;
  isFeatured?: boolean;
  onToggleFeatured?: (eventData: any) => void;
}

export const EventWebModal: React.FC<EventWebModalProps> = ({
  isVisible,
  url,
  title,
  onClose,
  eventType,
  eventData,
  isFeatured = false,
  onToggleFeatured,
}) => {
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (isVisible) {
      setLoading(true);
    }
  }, [isVisible, url]);

  const handleToggleFeatured = React.useCallback(() => {
    if (onToggleFeatured && eventData) {
      onToggleFeatured(eventData);
    }
  }, [onToggleFeatured, eventData]);

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      style={styles.modal}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      useNativeDriver
      hideModalContentWhileAnimating
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {title || "Event Details"}
          </Text>
          <View style={styles.headerActions}>
            {eventType === 'ra' && (
              <TouchableOpacity
                onPress={handleToggleFeatured}
                style={styles.featureButton}
              >
                <Icon
                  type={IconTypes.Ionicons}
                  name={isFeatured ? "star" : "star-outline"}
                  size={24}
                  color={isFeatured ? "#3449ff" : "#666"}
                />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon
                type={IconTypes.Ionicons}
                name="close"
                size={24}
                color="#333"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* WebView */}
        <View style={styles.webViewContainer}>
          {url && (
            <WebView
              source={{ uri: url }}
              style={styles.webView}
              onLoadStart={() => setLoading(true)}
              onLoadEnd={() => setLoading(false)}
              startInLoadingState={true}
              renderLoading={() => (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#3449ff" />
                  <Text style={styles.loadingText}>Loading event...</Text>
                </View>
              )}
            />
          )}
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#3449ff" />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "white",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: "90%",
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "white",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    marginRight: 8,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  featureButton: {
    padding: 4,
    marginRight: 8,
  },
  closeButton: {
    padding: 4,
  },
  webViewContainer: {
    flex: 1,
    position: "relative",
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  loadingText: {
    marginTop: 8,
    color: "#666",
    fontSize: 14,
  },
});

