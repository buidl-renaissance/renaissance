import React, { useRef } from "react";
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator, Linking, PanResponder, Animated } from "react-native";
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
  const [isDismissing, setIsDismissing] = React.useState(false);
  const [isAtTop, setIsAtTop] = React.useState(true);
  const [isDraggingDown, setIsDraggingDown] = React.useState(false);
  const isAtTopRef = useRef(true);
  const webViewRef = useRef<any>(null);
  
  const translateY = useRef(new Animated.Value(0)).current;
  
  // Pan responder for drag handle and title header only
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to downward swipes
        return gestureState.dy > 5;
      },
      onPanResponderGrant: () => {
        setIsDraggingDown(true);
        translateY.setOffset(0);
        translateY.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        // Only allow downward movement
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        setIsDraggingDown(false);
        translateY.flattenOffset();
        
        // If dragged down more than 100px, dismiss the modal
        if (gestureState.dy > 100) {
          setIsDismissing(true);
          onClose();
          Animated.timing(translateY, {
            toValue: 1000,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            translateY.setValue(0);
            setIsDismissing(false);
          });
        } else {
          // Spring back to original position
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 50,
            friction: 7,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        setIsDraggingDown(false);
        translateY.flattenOffset();
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }).start();
      },
    })
  ).current;


  // Handle scroll events from WebView via injected JavaScript
  const handleWebViewMessage = React.useCallback((event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'scroll') {
        const scrollY = data.scrollY || 0;
        const wasAtTop = scrollY <= 0;
        setIsAtTop(wasAtTop);
        isAtTopRef.current = wasAtTop;
      }
    } catch (e) {
      // Ignore non-JSON messages
    }
  }, []);

  React.useEffect(() => {
    if (isVisible) {
      setLoading(true);
      setIsDismissing(false);
      setIsAtTop(true);
      isAtTopRef.current = true;
      translateY.setValue(0);
      // Load bookmark status when modal opens
      if (eventData && eventType) {
        (async () => {
          const bookmarked = await getBookmarkStatusForWebEvent(eventData, eventType);
          setIsBookmarked(bookmarked);
        })();
      }
    }
  }, [isVisible, url, eventData, eventType, translateY]);

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

  const handleOpenInSafari = React.useCallback(async () => {
    if (url) {
      try {
        await Linking.openURL(url);
      } catch (error) {
        console.error("Failed to open URL in Safari:", error);
      }
    }
  }, [url]);

  return (
    <Modal
      isVisible={isVisible && !isDismissing}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      style={styles.modal}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      useNativeDriver
      hideModalContentWhileAnimating
      backdropOpacity={0.5}
    >
      <Animated.View 
        style={[
          styles.container,
          {
            transform: [{ translateY }],
          },
        ]}
      >
        {/* Drag handle */}
        <View style={styles.dragHandle} {...panResponder.panHandlers}>
          <View style={styles.dragHandleBar} />
        </View>
        
        {/* Title header at top */}
        <View style={styles.titleHeader} {...panResponder.panHandlers}>
          <View style={styles.titleHeaderContent}>
            <View style={styles.titleHeaderTextContainer}>
              <Text style={styles.titleHeaderText} numberOfLines={1}>
                {title || "Event Details"}
              </Text>
              {url && (
                <Text style={styles.titleHeaderUrl} numberOfLines={1}>
                  {url}
                </Text>
              )}
            </View>
            {eventType === 'ra' && url && (
              <TouchableOpacity
                onPress={handleOpenInSafari}
                style={styles.safariButton}
              >
                <Icon
                  type={IconTypes.Ionicons}
                  name="open-outline"
                  size={20}
                  color="#3449ff"
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* WebView */}
        <View style={styles.webViewContainer}>
          {url && (
            <WebView
              ref={webViewRef}
              source={{ uri: url }}
              style={styles.webView}
              onLoadStart={() => setLoading(true)}
              onLoadEnd={() => setLoading(false)}
              startInLoadingState={true}
              javaScriptEnabled
              domStorageEnabled
              allowsInlineMediaPlayback
              mediaPlaybackRequiresUserAction={false}
              allowsBackForwardNavigationGestures
              sharedCookiesEnabled
              thirdPartyCookiesEnabled
              originWhitelist={["*"]}
              // Safari-like scrolling
              scrollEnabled={true}
              bounces={true}
              showsVerticalScrollIndicator={true}
              showsHorizontalScrollIndicator={false}
              decelerationRate="normal"
              nestedScrollEnabled={true}
              overScrollMode="always"
              onMessage={handleWebViewMessage}
              injectedJavaScript={`
                (function() {
                  let lastScrollY = window.scrollY || window.pageYOffset || 0;
                  
                  function handleScroll() {
                    const scrollY = window.scrollY || window.pageYOffset || 0;
                    if (Math.abs(scrollY - lastScrollY) > 5) {
                      window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'scroll',
                        scrollY: scrollY
                      }));
                      lastScrollY = scrollY;
                    }
                  }
                  
                  window.addEventListener('scroll', handleScroll, { passive: true });
                  window.addEventListener('touchmove', handleScroll, { passive: true });
                  
                  // Initial check
                  handleScroll();
                  
                  // Also check on load
                  if (document.readyState === 'complete') {
                    handleScroll();
                  } else {
                    window.addEventListener('load', handleScroll);
                  }
                })();
                true;
              `}
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

        {/* Floating action buttons */}
        <View style={styles.floatingButtons}>
          {eventType && eventData && (
            <TouchableOpacity
              onPress={handleToggleBookmark}
              style={[
                styles.floatingBookmarkButton,
                isBookmarked && styles.floatingBookmarkButtonActive,
              ]}
            >
              <Icon
                type={IconTypes.Ionicons}
                name={isBookmarked ? "bookmark" : "bookmark-outline"}
                size={22}
                color="#3449ff"
              />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={onClose} style={styles.floatingCloseButton}>
            <Icon
              type={IconTypes.Ionicons}
              name="close"
              size={24}
              color="#333"
            />
          </TouchableOpacity>
        </View>
      </Animated.View>
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
  dragHandle: {
    paddingTop: 8,
    paddingBottom: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  dragHandleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#ccc",
  },
  titleHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  titleHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleHeaderTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  titleHeaderText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  titleHeaderUrl: {
    fontSize: 11,
    color: "#666",
  },
  safariButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(52, 73, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  floatingButtons: {
    position: "absolute",
    bottom: 20,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  floatingBookmarkButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(185, 192, 255, 0.8)",
    borderWidth: 2,
    borderColor: "#3449ff",
    alignItems: "center",
    justifyContent: "center",
    // Shadow
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  floatingBookmarkButtonActive: {
    backgroundColor: "rgba(52, 73, 255, 0.4)",
    borderWidth: 2,
    borderColor: "#3449ff",
  },
  floatingCloseButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    alignItems: "center",
    justifyContent: "center",
    // Shadow
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  webViewContainer: {
    flex: 1,
    position: "relative",
  },
  webView: {
    flex: 1,
    backgroundColor: "transparent",
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

