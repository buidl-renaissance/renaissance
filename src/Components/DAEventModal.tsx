import React, { useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Image,
  ScrollView,
  Dimensions,
  PanResponder,
  Animated,
  Linking,
} from "react-native";
import Modal from "react-native-modal";
import moment from "moment";
import { decode } from "html-entities";
import { DAEvent } from "../interfaces";
import Icon, { IconTypes } from "./Icon";
import { getBookmarkStatusForWebEvent, toggleBookmarkForWebEvent } from "../utils/bookmarks";
import { EventRegister } from "react-native-event-listeners";
import { theme } from "../colors";
import RenderHtml from "react-native-render-html";
import { RenderHTML } from "./RenderHTML";
import HTML from "react-native-render-html";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Custom renderer for links to ensure color is always applied and links are clickable
const createLinkRenderer = () => ({
  a: (props: any) => {
    const { TDefaultRenderer, tnode, ...otherProps } = props;
    const href = tnode?.attributes?.href;
    
    return (
      <TDefaultRenderer
        {...otherProps}
        tnode={tnode}
        textProps={{
          style: { color: theme.primary, textDecorationLine: 'underline' },
        }}
        onPress={() => {
          if (href) {
            Linking.openURL(href);
          }
        }}
      />
    );
  },
});

interface DAEventModalProps {
  isVisible: boolean;
  event: DAEvent | null;
  onClose: () => void;
  onOpenWebView?: (url: string, title: string, event: DAEvent) => void;
}

const formatTime = (date: string | null) => {
  if (!date) return "";
  return moment(date).format("h:mm a");
};

const formatTimeRange = (event: DAEvent) => {
  const start = formatTime(event.start_date);
  const end = formatTime(event.end_date);
  if (start && end) {
    return `${start} - ${end}`;
  }
  return start || "";
};

const formatDate = (date: string | null) => {
  if (!date) return "";
  return moment(date).format("MMMM Do, YYYY");
};

const organizedByText = (event: DAEvent) => {
  const organizers = event.organizer
    ?.map((organizer: any) => decode(organizer.organizer))
    .join(", ");
  return organizers ? `Organized by: ${organizers}` : "";
};

export const DAEventModal: React.FC<DAEventModalProps> = ({
  isVisible,
  event,
  onClose,
  onOpenWebView,
}) => {
  const [isBookmarked, setIsBookmarked] = React.useState(false);
  const [isDismissing, setIsDismissing] = React.useState(false);
  const [isDraggingDown, setIsDraggingDown] = React.useState(false);
  const [imageHeight, setImageHeight] = React.useState(300);
  const [isAtTop, setIsAtTop] = React.useState(true);
  const [fullEvent, setFullEvent] = React.useState<DAEvent | null>(event);
  
  const translateY = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const isAtTopRef = useRef(true);

  // Pan responder for drag handle
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

  // Pan responder for content area when at top
  const contentPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to clear downward drags when at top
        return isAtTopRef.current && gestureState.dy > 10 && Math.abs(gestureState.dx) < Math.abs(gestureState.dy);
      },
      onPanResponderGrant: () => {
        setIsDraggingDown(true);
        translateY.setOffset(0);
        translateY.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        // Only allow downward movement when at top
        if (isAtTopRef.current && gestureState.dy > 0) {
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

  // Load bookmark status
  React.useEffect(() => {
    if (isVisible && event) {
      (async () => {
        try {
          const bookmarked = await getBookmarkStatusForWebEvent(event, 'da');
          setIsBookmarked(bookmarked);
        } catch (error) {
          console.error("Error loading bookmark status:", error);
        }
      })();
    } else {
      setIsBookmarked(false);
    }
  }, [isVisible, event]);

  // Listen for bookmark changes
  React.useEffect(() => {
    if (!event) return;
    
    const listener = EventRegister.addEventListener("BookmarkEvent", (data) => {
      if (event.id === data.event?.id || (data.event?.eventType === 'da' && data.event?.id === event.id)) {
        setIsBookmarked(data.isBookmarked);
      }
    });
    
    return () => {
      if (typeof listener === "string") {
        EventRegister.removeEventListener(listener);
      }
    };
  }, [event]);

  // Calculate image height when image loads
  const handleImageLoad = (event: any) => {
    const { width, height } = event.nativeEvent.source;
    if (width && height) {
      const aspectRatio = height / width;
      const imageWidth = SCREEN_WIDTH - 32; // Account for padding
      const calculatedHeight = Math.min(imageWidth * aspectRatio, imageWidth * 1.2);
      setImageHeight(calculatedHeight);
    }
  };

  const handleToggleBookmark = React.useCallback(async () => {
    if (!event) return;
    
    const newBookmarkStatus = await toggleBookmarkForWebEvent(event, 'da');
    setIsBookmarked(newBookmarkStatus);
    
    // Emit event for other components to update
    EventRegister.emitEvent("BookmarkEvent", {
      event: { ...event, eventType: 'da' },
      isBookmarked: newBookmarkStatus,
    });
  }, [event]);

  const handleViewDetails = React.useCallback(async () => {
    if (!event) return;
    
    // Use URL from event data if available, otherwise fall back to constructed URL
    const eventUrl = (fullEvent?.url || event.url) || `https://dpop.tech/event/${event.slug}`;
    
    if (onOpenWebView) {
      onOpenWebView(eventUrl, event.title, event);
    } else {
      try {
        await Linking.openURL(eventUrl);
      } catch (error) {
        console.error("Failed to open event URL:", error);
      }
    }
  }, [event, fullEvent, onOpenWebView]);

  // Handle scroll to track if we're at the top
  const handleScroll = React.useCallback((event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const wasAtTop = offsetY <= 0;
    setIsAtTop(wasAtTop);
    isAtTopRef.current = wasAtTop;
  }, []);

  // Fetch full event data with content when modal opens
  React.useEffect(() => {
    if (isVisible && event) {
      setIsDismissing(false);
      setIsAtTop(true);
      isAtTopRef.current = true;
      translateY.setValue(0);
      
      // Fetch full event data if we don't have content
      if (!event.content && event.slug) {
        (async () => {
          try {
            const eventRes = await fetch(
              `https://api.detroiter.network/api/event/${event.slug}`
            );
            if (eventRes.ok) {
              const fetchedEvent = await eventRes.json();
              if (fetchedEvent.data) {
                setFullEvent(fetchedEvent.data);
              }
            }
          } catch (error) {
            console.error("Error fetching full event data:", error);
          }
        })();
      } else {
        setFullEvent(event);
      }
    }
  }, [isVisible, event, translateY]);

  if (!event) return null;

  const displayEvent = fullEvent || event;
  const organizerText = organizedByText(displayEvent);

  return (
    <Modal
      isVisible={isVisible && !isDismissing}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      style={styles.modal}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      animationInTiming={250}
      animationOutTiming={200}
      useNativeDriver
      hideModalContentWhileAnimating={false}
      backdropOpacity={0.5}
      propagateSwipe
      avoidKeyboard={false}
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

        {/* Scrollable content */}
        <View 
          style={styles.scrollContainer}
          {...(isAtTop ? contentPanResponder.panHandlers : {})}
          collapsable={false}
        >
          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            scrollEnabled={!isDraggingDown}
            showsVerticalScrollIndicator={true}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            bounces={true}
          >
            {/* Image */}
            {displayEvent.image && (
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: displayEvent.image }}
                  style={[styles.image, { height: imageHeight }]}
                  resizeMode="cover"
                  onLoad={handleImageLoad}
                />
              </View>
            )}

            {/* Content */}
            <View style={styles.content}>
              {/* Event Name */}
              <Text style={styles.eventName}>{decode(displayEvent.title)}</Text>

              {/* Timeframe */}
              {(displayEvent.start_date || displayEvent.end_date) && (
                <View style={styles.timeframeContainer}>
                  <Icon
                    type={IconTypes.Ionicons}
                    name="time-outline"
                    size={16}
                    color={theme.textSecondary}
                  />
                  <Text style={styles.timeframe}>
                    {displayEvent.start_date && formatDate(displayEvent.start_date)}
                    {formatTimeRange(displayEvent) && ` • ${formatTimeRange(displayEvent)}`}
                  </Text>
                </View>
              )}

              {/* Venue */}
              {displayEvent.venue && (
                <View style={styles.detailRow}>
                  <Icon
                    type={IconTypes.Ionicons}
                    name="location-outline"
                    size={16}
                    color={theme.textSecondary}
                  />
                  <Text style={styles.detailText}>{decode(displayEvent.venue.title)}</Text>
                </View>
              )}

              {/* Organizer */}
              {organizerText && (
                <View style={styles.detailRow}>
                  <Icon
                    type={IconTypes.Ionicons}
                    name="people-outline"
                    size={16}
                    color={theme.textSecondary}
                  />
                  <Text style={styles.detailText}>{organizerText}</Text>
                </View>
              )}

              {/* Categories */}
              {displayEvent.categories && displayEvent.categories.length > 0 && (
                <View style={styles.categoriesContainer}>
                  {displayEvent.categories.map((category, index) => (
                    <View key={index} style={styles.categoryBadge}>
                      <Text style={styles.categoryText}>{category}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Description/Excerpt */}
              {displayEvent.excerpt && (
                <View style={styles.descriptionSection}>
                  <RenderHtml
                    contentWidth={SCREEN_WIDTH - 64}
                    source={{ html: displayEvent.excerpt }}
                    renderers={createLinkRenderer()}
                    tagsStyles={{
                      a: { color: theme.primary, textDecorationLine: 'underline' },
                      html: { color: theme.text },
                      div: { color: theme.text },
                      p: { margin: 0, padding: 0, color: theme.text },
                      i: { fontStyle: 'italic', color: theme.text },
                      h1: { color: theme.text },
                      h2: { color: theme.text },
                      h3: { color: theme.text },
                      h4: { color: theme.text },
                      strong: { color: theme.text },
                      b: { color: theme.text },
                      li: { color: theme.text },
                    }}
                  />
                </View>
              )}

              {displayEvent.description && (
                <View style={styles.descriptionSection}>
                  <RenderHtml
                    contentWidth={SCREEN_WIDTH - 64}
                    source={{ html: displayEvent.description }}
                    renderers={createLinkRenderer()}
                    tagsStyles={{
                      a: { color: theme.primary, textDecorationLine: 'underline' },
                      html: { color: theme.text },
                      div: { color: theme.text },
                      p: { margin: 0, padding: 0, color: theme.text },
                      h1: { color: theme.text },
                      h2: { color: theme.text },
                      h3: { color: theme.text },
                      h4: { color: theme.text },
                      strong: { color: theme.text },
                      b: { color: theme.text },
                      li: { color: theme.text },
                    }}
                  />
                </View>
              )}

              {/* Full Event Content */}
              {displayEvent.content && (
                <View style={styles.contentSection}>
                  <HTML
                    baseStyle={styles.htmlContent}
                    source={{ html: `<div>${displayEvent.content}</div>` }}
                    contentWidth={SCREEN_WIDTH - 64}
                    ignoredStyles={['height', 'width']}
                    renderers={createLinkRenderer()}
                    tagsStyles={{
                      a: { color: theme.primary, textDecorationLine: 'underline' },
                      html: { color: theme.text },
                      div: { margin: 0, padding: 0, color: theme.text },
                      p: { margin: 0, padding: 0, marginBottom: 8, color: theme.text },
                      br: { margin: 0, padding: 0 },
                      h1: { margin: 0, padding: 0, marginTop: 16, marginBottom: 8, fontSize: 24, fontWeight: '700', color: theme.text },
                      h2: { margin: 0, padding: 0, marginTop: 16, marginBottom: 8, fontSize: 20, fontWeight: '700', color: theme.text },
                      h3: { margin: 0, padding: 0, marginTop: 12, marginBottom: 6, fontSize: 18, fontWeight: '600', color: theme.text },
                      h4: { margin: 0, padding: 0, marginTop: 12, marginBottom: 6, fontSize: 16, fontWeight: '600', color: theme.text },
                      ul: { margin: 0, padding: 0, paddingLeft: 20, marginBottom: 8 },
                      ol: { margin: 0, padding: 0, paddingLeft: 20, marginBottom: 8 },
                      li: { margin: 0, padding: 0, marginBottom: 4, color: theme.text },
                      blockquote: { margin: 0, padding: 0, paddingLeft: 16, borderLeftWidth: 3, borderLeftColor: theme.border, marginBottom: 8, color: theme.text },
                      pre: { margin: 0, padding: 0, marginBottom: 8, color: theme.text },
                      code: { margin: 0, padding: 0, color: theme.text },
                      strong: { fontWeight: '700', color: theme.text },
                      em: { fontStyle: 'italic', color: theme.text },
                      b: { color: theme.text },
                    }}
                  />
                </View>
              )}
            </View>
          </ScrollView>
        </View>

        {/* Floating action buttons at bottom - right aligned */}
        <View style={styles.floatingButtons}>
          <TouchableOpacity
            style={styles.viewDetailsButton}
            onPress={handleViewDetails}
          >
            <Icon
              type={IconTypes.Ionicons}
              name="open-outline"
              size={20}
              color={theme.textOnPrimary}
            />
          </TouchableOpacity>
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
              color={theme.primary}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={styles.floatingCloseButton}>
            <Icon
              type={IconTypes.Ionicons}
              name="close"
              size={24}
              color={theme.text}
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
    backgroundColor: theme.surface,
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
    backgroundColor: theme.borderLight,
  },
  floatingButtons: {
    position: "absolute",
    bottom: 20,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    zIndex: 10,
  },
  floatingBookmarkButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.primaryBackground,
    borderWidth: 2,
    borderColor: theme.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: theme.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  floatingBookmarkButtonActive: {
    backgroundColor: theme.primaryLight,
    borderWidth: 2,
    borderColor: theme.primary,
  },
  floatingCloseButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.surface,
    borderWidth: 2,
    borderColor: theme.border,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: theme.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Extra padding to account for floating buttons
  },
  imageContainer: {
    padding: 16,
  },
  image: {
    width: SCREEN_WIDTH - 32,
    backgroundColor: theme.inputBackground,
    borderRadius: 12,
    overflow: "hidden",
  },
  content: {
    padding: 16,
    paddingTop: 8,
  },
  eventName: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.text,
    marginBottom: 12,
  },
  timeframeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  timeframe: {
    fontSize: 14,
    color: theme.textSecondary,
    marginLeft: 6,
    fontWeight: "500",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: theme.textSecondary,
    marginLeft: 6,
    flex: 1,
    fontWeight: "500",
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    marginBottom: 16,
    gap: 8,
  },
  categoryBadge: {
    backgroundColor: theme.primary,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  categoryText: {
    fontSize: 12,
    color: theme.textOnPrimary,
    fontWeight: "600",
  },
  descriptionSection: {
    marginTop: 16,
    marginBottom: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  viewDetailsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: theme.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  contentSection: {
    marginTop: 16,
    marginBottom: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  htmlContent: {
    paddingHorizontal: 0,
  },
});

