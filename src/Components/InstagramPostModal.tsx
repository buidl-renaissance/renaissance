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
import { InstagramEvent } from "../interfaces";
import Icon, { IconTypes } from "./Icon";
import { getBookmarkStatusForWebEvent, toggleBookmarkForWebEvent } from "../utils/bookmarks";
import { EventRegister } from "react-native-event-listeners";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface InstagramPostModalProps {
  isVisible: boolean;
  event: InstagramEvent | null;
  onClose: () => void;
}

const formatTime = (date: string) => {
  return moment(date).format("h:mm a");
};

const formatTimeRange = (event: InstagramEvent) => {
  const start = formatTime(event.startDatetime);
  if (event.endDatetime) {
    return `${start} - ${formatTime(event.endDatetime)}`;
  }
  return start;
};

const formatDate = (date: string) => {
  return moment(date).format("MMMM Do, YYYY");
};

export const InstagramPostModal: React.FC<InstagramPostModalProps> = ({
  isVisible,
  event,
  onClose,
}) => {
  const [isBookmarked, setIsBookmarked] = React.useState(false);
  const [isDismissing, setIsDismissing] = React.useState(false);
  const [isDraggingDown, setIsDraggingDown] = React.useState(false);
  const [imageHeight, setImageHeight] = React.useState(300);
  const [isAtTop, setIsAtTop] = React.useState(true);
  
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
          const bookmarked = await getBookmarkStatusForWebEvent(event, 'instagram');
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
      if (event.id === data.event?.id || (data.event?.eventType === 'instagram' && data.event?.id === event.id)) {
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
    
    const newBookmarkStatus = await toggleBookmarkForWebEvent(event, 'instagram');
    setIsBookmarked(newBookmarkStatus);
    
    // Emit event for other components to update
    EventRegister.emitEvent("BookmarkEvent", {
      event: { ...event, eventType: 'instagram' },
      isBookmarked: newBookmarkStatus,
    });
  }, [event]);

  const handleOpenInstagram = React.useCallback(async () => {
    if (!event) return;
    
    const url = event.instagramUrl || event.metadata?.ticketUrl || `https://www.instagram.com/p/${event.postCode}/`;
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error("Failed to open Instagram URL:", error);
    }
  }, [event]);

  // Handle scroll to track if we're at the top
  const handleScroll = React.useCallback((event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const wasAtTop = offsetY <= 0;
    setIsAtTop(wasAtTop);
    isAtTopRef.current = wasAtTop;
  }, []);

  React.useEffect(() => {
    if (isVisible) {
      setIsDismissing(false);
      setIsAtTop(true);
      isAtTopRef.current = true;
      translateY.setValue(0);
    }
  }, [isVisible, translateY]);

  const artistsText = event?.artistNames?.join(", ");

  if (!event) return null;

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
            {event.imageUrl && (
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: event.imageUrl }}
                  style={[styles.image, { height: imageHeight }]}
                  resizeMode="cover"
                  onLoad={handleImageLoad}
                />
              </View>
            )}

          {/* Content */}
          <View style={styles.content}>
            {/* Event Name */}
            <Text style={styles.eventName}>{event.name}</Text>

            {/* Timeframe */}
            <View style={styles.timeframeContainer}>
              <Icon
                type={IconTypes.Ionicons}
                name="time-outline"
                size={16}
                color="#666"
              />
              <Text style={styles.timeframe}>
                {formatDate(event.startDatetime)} • {formatTimeRange(event)}
              </Text>
            </View>

            {/* Venue */}
            {event.venue && (
              <View style={styles.detailRow}>
                <Icon
                  type={IconTypes.Ionicons}
                  name="location-outline"
                  size={16}
                  color="#666"
                />
                <Text style={styles.detailText}>{event.venue}</Text>
              </View>
            )}

            {/* Location */}
            {event.location && (
              <View style={styles.detailRow}>
                <Icon
                  type={IconTypes.Ionicons}
                  name="map-outline"
                  size={16}
                  color="#666"
                />
                <Text style={styles.detailText}>{event.location}</Text>
              </View>
            )}

            {/* Artists */}
            {artistsText && (
              <View style={styles.detailRow}>
                <Icon
                  type={IconTypes.Ionicons}
                  name="musical-notes-outline"
                  size={16}
                  color="#E4405F"
                />
                <Text style={[styles.detailText, styles.artistsText]}>
                  {artistsText}
                </Text>
              </View>
            )}

            {/* Price */}
            {event.metadata?.price && (
              <View style={styles.priceContainer}>
                <Text style={styles.priceBadge}>{event.metadata.price}</Text>
              </View>
            )}

            {/* Caption Section */}
            {(event.description || event.metadata?.additionalInfo) && (
              <View style={styles.captionSection}>
                {event.description && (
                  <Text style={styles.caption}>{event.description}</Text>
                )}
                {event.metadata?.additionalInfo && (
                  <Text style={styles.additionalInfo}>
                    {event.metadata.additionalInfo}
                  </Text>
                )}
              </View>
            )}

            {/* Open in Instagram Button */}
            <TouchableOpacity
              style={styles.instagramButton}
              onPress={handleOpenInstagram}
            >
              <Icon
                type={IconTypes.Ionicons}
                name="logo-instagram"
                size={20}
                color="#FFFFFF"
              />
              <Text style={styles.instagramButtonText}>Open in Instagram</Text>
            </TouchableOpacity>
          </View>
          </ScrollView>
        </View>

        {/* Floating action buttons at bottom */}
        <View style={styles.floatingButtons}>
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
    backgroundColor: "#B9C0FF",
    borderWidth: 2,
    borderColor: "#3449ff",
    alignItems: "center",
    justifyContent: "center",
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
    backgroundColor: "#6B7FFF",
    borderWidth: 2,
    borderColor: "#3449ff",
  },
  floatingCloseButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
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
    backgroundColor: "#f0f0f0",
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
    color: "#333",
    marginBottom: 12,
  },
  timeframeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  timeframe: {
    fontSize: 14,
    color: "#666",
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
    color: "#666",
    marginLeft: 6,
    flex: 1,
    fontWeight: "500",
  },
  artistsText: {
    color: "#E4405F",
  },
  priceContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  priceBadge: {
    fontSize: 14,
    backgroundColor: "#f59e0b",
    color: "white",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: "flex-start",
    fontWeight: "600",
    overflow: "hidden",
  },
  captionSection: {
    marginTop: 16,
    marginBottom: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  caption: {
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
    marginBottom: 12,
  },
  additionalInfo: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  instagramButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E4405F",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginTop: 8,
  },
  instagramButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});

