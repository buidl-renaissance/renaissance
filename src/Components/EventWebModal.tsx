import React from "react";
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator } from "react-native";
import Modal from "react-native-modal";
import { WebView } from "react-native-webview";
import Icon, { IconTypes } from "./Icon";
import { getBookmarkStatusForWebEvent, toggleBookmarkForWebEvent } from "../utils/bookmarks";
import { EventRegister } from "react-native-event-listeners";

interface EventWebModalProps {
  isVisible: boolean;
  url: string | null;
  title?: string;
  onClose: () => void;
  eventType?: 'ra' | 'luma' | 'da';
  eventData?: any;
}

export const EventWebModal: React.FC<EventWebModalProps> = ({
  isVisible,
  url,
  title,
  onClose,
  eventType,
  eventData,
}) => {
  const [loading, setLoading] = React.useState(true);
  const [isBookmarked, setIsBookmarked] = React.useState(false);

  React.useEffect(() => {
    if (isVisible) {
      setLoading(true);
      // Load bookmark status when modal opens
      if (eventData && eventType) {
        (async () => {
          const bookmarked = await getBookmarkStatusForWebEvent(eventData, eventType);
          setIsBookmarked(bookmarked);
        })();
      }
    }
  }, [isVisible, url, eventData, eventType]);

  React.useEffect(() => {
    if (!eventData || !eventType) return;
    
    const listener = EventRegister.addEventListener("BookmarkEvent", (data) => {
      if (eventType === 'da' && eventData.id === data.event?.id) {
        setIsBookmarked(data.isBookmarked);
      } else if (eventType === 'luma' && eventData.apiId === data.event?.apiId) {
        setIsBookmarked(data.isBookmarked);
      } else if (eventType === 'ra' && eventData.id === data.event?.id) {
        setIsBookmarked(data.isBookmarked);
      }
    });
    
    return () => {
      if (typeof listener === "string") {
        EventRegister.removeEventListener(listener);
      }
    };
  }, [eventData, eventType]);

  const handleToggleBookmark = React.useCallback(async () => {
    if (!eventData || !eventType) return;
    
    const newBookmarkStatus = await toggleBookmarkForWebEvent(eventData, eventType);
    setIsBookmarked(newBookmarkStatus);
    
    // Emit event for other components to update
    EventRegister.emitEvent("BookmarkEvent", {
      event: eventData,
      isBookmarked: newBookmarkStatus,
    });
  }, [eventData, eventType]);

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
            {eventType && eventData && (
              <TouchableOpacity
                onPress={handleToggleBookmark}
                style={styles.bookmarkButton}
              >
                <Icon
                  type={IconTypes.Ionicons}
                  name={isBookmarked ? "bookmark" : "bookmark-outline"}
                  size={24}
                  color={isBookmarked ? "#3449ff" : "#666"}
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
  bookmarkButton: {
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

