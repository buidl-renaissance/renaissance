import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Linking,
  ScrollView,
  Share,
  FlatList,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../colors";
import { EventWebModal } from "../Components/EventWebModal";
import {
  detectURLType,
  fetchMetadataWithFallback,
  instagramScrapeToMetadata,
  extractEventFromInstagram,
  isEventURL,
  getWebModalEventType,
  URLInfo,
  OGMetadata,
  InstagramScrapeResult,
  ExtractedEventInfo,
} from "../utils/urlDetection";
import {
  addSharedUrl,
  SharedURLRecord,
} from "../utils/sharedUrls";

interface SharedURLScreenProps {
  navigation: any;
  route: {
    params?: {
      url?: string;
    };
  };
}

const SharedURLScreen: React.FC<SharedURLScreenProps> = ({ navigation, route }) => {
  const originalUrl = route.params?.url || "";
  
  const [loading, setLoading] = useState(true);
  const [urlInfo, setUrlInfo] = useState<URLInfo | null>(null);
  const [metadata, setMetadata] = useState<OGMetadata | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [instagramData, setInstagramData] = useState<InstagramScrapeResult | null>(null);
  
  // Get screen width for image carousel
  const screenWidth = Dimensions.get('window').width - 32; // Account for padding
  const [urlRecord, setUrlRecord] = useState<SharedURLRecord | null>(null);
  const [extractedEvent, setExtractedEvent] = useState<ExtractedEventInfo | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [meetupEvent, setMeetupEvent] = useState<any>(null);
  
  // Event modal state
  const [webModalVisible, setWebModalVisible] = useState(false);

  // Use cleaned URL from urlInfo when available, otherwise fall back to original
  const cleanedUrl = urlInfo?.url || originalUrl;

  // Get all images from the Instagram post
  const allImages = instagramData?.featuredPost?.images || (metadata?.image ? [metadata.image] : []);
  const currentImage = allImages[currentImageIndex] || metadata?.image;
  
  // Get image dimensions when current image changes
  useEffect(() => {
    if (currentImage) {
      Image.getSize(
        currentImage,
        (width, height) => {
          setImageDimensions({ width, height });
        },
        (error) => {
          console.log("[SharedURLScreen] Failed to get image size:", error);
          setImageDimensions(null);
        }
      );
    }
  }, [currentImage]);

  // Handle image scroll
  const handleImageScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / screenWidth);
    setCurrentImageIndex(index);
  }, [screenWidth]);

  // Set up navigation header
  useEffect(() => {
    navigation.setOptions({
      title: "Shared Link",
      headerLeft: () => (
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={24} color={theme.text} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  // Fetch URL info and metadata
  useEffect(() => {
    const processUrl = async () => {
      if (!originalUrl) {
        setError("No URL provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Add URL to storage and auto-trigger processing
        console.log("[SharedURLScreen] Adding URL to storage:", originalUrl);
        const record = await addSharedUrl(originalUrl);
        setUrlRecord(record);
        console.log("[SharedURLScreen] URL record:", JSON.stringify(record, null, 2));

        // Set URL info from record
        const info = detectURLType(originalUrl);
        setUrlInfo(info);

        // For Instagram URLs, use the scraped data from the record
        if (info.type === 'instagram') {
          if (record.scrapeResult) {
            console.log("[SharedURLScreen] Using scraped Instagram data from storage");
            setInstagramData(record.scrapeResult);
            
            // Convert scrape result to metadata format
            const meta = instagramScrapeToMetadata(record.scrapeResult, info.url);
            console.log("[SharedURLScreen] Converted metadata:", JSON.stringify(meta, null, 2));
            setMetadata(meta);
            
            // If event data is available (from cache or previous extraction), use it
            if (record.extractedEvent?.success && record.extractedEvent.event) {
              console.log("[SharedURLScreen] Using cached/stored event data");
              setExtractedEvent(record.extractedEvent);
              
              // Update metadata with event info
              setMetadata(prev => ({
                ...prev!,
                title: record.extractedEvent?.event?.name || prev?.title || 'Instagram Post',
                description: record.extractedEvent?.event?.description || prev?.description || null,
              }));
            }
          } else if (record.metadata) {
            // Use stored metadata if scrape result not available
            setMetadata({
              title: record.metadata.title || 'Instagram Post',
              description: record.metadata.description || null,
              image: record.metadata.image || null,
              siteName: 'Instagram',
              url: info.url,
            });
          } else {
            // Fallback metadata
            setMetadata({
              title: 'Instagram Post',
              description: null,
              image: null,
              siteName: 'Instagram',
              url: info.url,
            });
          }
        } else if (info.type === 'meetup' && record.meetupEvent) {
          // Use cached Meetup event data
          console.log("[SharedURLScreen] Using cached Meetup event data");
          setMeetupEvent(record.meetupEvent);
          setMetadata({
            title: record.meetupEvent.title || 'Meetup Event',
            description: record.meetupEvent.description || null,
            image: record.meetupEvent.featuredPhoto?.highResUrl || record.meetupEvent.featuredPhoto?.baseUrl || null,
            siteName: 'Meetup',
            url: info.url,
          });
        } else {
          // Fetch Open Graph metadata using the cleaned URL
          const meta = await fetchMetadataWithFallback(info.url);
          setMetadata(meta);
        }
      } catch (err) {
        console.error("[SharedURLScreen] Error processing URL:", err);
        setError("Failed to load link preview");
        // Still set basic URL info
        setUrlInfo(detectURLType(originalUrl));
      } finally {
        setLoading(false);
      }
    };

    processUrl();
  }, [originalUrl]);

  // Handle share
  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        url: cleanedUrl,
        message: metadata?.title ? `${metadata.title}\n${cleanedUrl}` : cleanedUrl,
      });
    } catch (err) {
      console.error("[SharedURLScreen] Failed to share:", err);
    }
  }, [cleanedUrl, metadata]);

  // Handle open in browser
  const handleOpenInBrowser = useCallback(async () => {
    try {
      const canOpen = await Linking.canOpenURL(cleanedUrl);
      if (canOpen) {
        await Linking.openURL(cleanedUrl);
      }
    } catch (err) {
      console.error("[SharedURLScreen] Failed to open in browser:", err);
    }
  }, [cleanedUrl]);

  // Extract postCode from Instagram URL
  const extractPostCodeFromUrl = useCallback((url: string): string | null => {
    try {
      const urlObj = new URL(url);
      // Match /p/{postCode}/ or /reel/{postCode}/
      const match = urlObj.pathname.match(/\/(?:p|reel)\/([^\/\?]+)/);
      return match?.[1] || null;
    } catch {
      return null;
    }
  }, []);

  // Handle extract event from Instagram post
  const handleExtractEvent = useCallback(async () => {
    console.log("[SharedURLScreen] handleExtractEvent called, instagramData:", JSON.stringify(instagramData, null, 2));
    
    if (!instagramData?.featuredPost && !currentImage) {
      console.log("[SharedURLScreen] No Instagram post data available for extraction");
      return;
    }

    const post = instagramData?.featuredPost;
    // Use the currently displayed image for extraction
    const imageUrl = currentImage;
    
    // Get postCode from post data or extract from URL
    const postCode = post?.postCode || extractPostCodeFromUrl(cleanedUrl);
    
    console.log("[SharedURLScreen] Post data for extraction:", {
      postCode,
      postCodeFromPost: post?.postCode,
      postCodeFromUrl: extractPostCodeFromUrl(cleanedUrl),
      imageUrl,
      currentImageIndex,
      totalImages: allImages.length,
      hasCaption: !!post?.caption,
    });
    
    if (!imageUrl) {
      console.log("[SharedURLScreen] No image available for event extraction");
      return;
    }
    
    if (!postCode) {
      console.log("[SharedURLScreen] No postCode available for event extraction");
      return;
    }

    try {
      setIsExtracting(true);
      console.log("[SharedURLScreen] Extracting event from Instagram post:", postCode, "using image index:", currentImageIndex);
      
      const result = await extractEventFromInstagram(
        postCode,
        imageUrl,
        post.caption
      );
      
      console.log("[SharedURLScreen] Event extraction result:", JSON.stringify(result, null, 2));
      
      // Handle nested event.data structure from API
      const eventData = result.event?.data || result.event;
      const normalizedResult: ExtractedEventInfo = {
        success: result.success && (result.event?.success !== false),
        event: eventData,
      };
      
      console.log("[SharedURLScreen] Normalized event data:", JSON.stringify(normalizedResult, null, 2));
      setExtractedEvent(normalizedResult);
      
      // Update metadata with extracted event info
      if (normalizedResult.success && normalizedResult.event) {
        setMetadata(prev => ({
          ...prev!,
          title: normalizedResult.event?.name || prev?.title || 'Instagram Post',
          description: normalizedResult.event?.description || prev?.description || null,
        }));
      }
    } catch (err) {
      console.error("[SharedURLScreen] Failed to extract event:", err);
    } finally {
      setIsExtracting(false);
    }
  }, [instagramData, cleanedUrl, extractPostCodeFromUrl, currentImage, currentImageIndex, allImages.length]);

  // Handle view event (opens EventWebModal)
  const handleViewEvent = useCallback(() => {
    setWebModalVisible(true);
  }, []);

  // Close event modal
  const handleCloseModal = useCallback(() => {
    setWebModalVisible(false);
  }, []);

  // Render loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.accentPurple} />
          <Text style={styles.loadingText}>Loading preview...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render error state
  if (error && !urlInfo) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={theme.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isEvent = urlInfo && isEventURL(urlInfo);
  const hasImage = metadata?.image && !imageError;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Preview Card */}
        <View style={styles.previewCard}>
          {/* Platform Badge */}
          {urlInfo && (
            <View style={[styles.platformBadge, { backgroundColor: urlInfo.platformColor }]}>
              <Text style={styles.platformBadgeText}>
                {isEvent ? `${urlInfo.platformName} Event` : urlInfo.platformName}
              </Text>
            </View>
          )}

          {/* Preview Image(s) */}
          {allImages.length > 1 ? (
            <View>
              <FlatList
                data={allImages}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleImageScroll}
                scrollEventThrottle={16}
                keyExtractor={(item, index) => `image-${index}`}
                renderItem={({ item, index }) => (
                  <Image
                    source={{ uri: item }}
                    style={[
                      styles.carouselImage,
                      { width: screenWidth },
                      imageDimensions && index === currentImageIndex && {
                        aspectRatio: imageDimensions.width / imageDimensions.height,
                      },
                      !imageDimensions && { aspectRatio: 1 },
                    ]}
                    resizeMode="cover"
                    onError={() => setImageError(true)}
                  />
                )}
              />
              {/* Pagination dots */}
              <View style={styles.paginationContainer}>
                {allImages.map((_, index) => (
                  <View
                    key={`dot-${index}`}
                    style={[
                      styles.paginationDot,
                      index === currentImageIndex && styles.paginationDotActive,
                    ]}
                  />
                ))}
              </View>
              {/* Image counter */}
              <View style={styles.imageCounter}>
                <Text style={styles.imageCounterText}>
                  {currentImageIndex + 1} / {allImages.length}
                </Text>
              </View>
            </View>
          ) : hasImage ? (
            <Image
              source={{ uri: metadata.image! }}
              style={[
                styles.previewImage,
                imageDimensions && {
                  aspectRatio: imageDimensions.width / imageDimensions.height,
                },
              ]}
              resizeMode="cover"
              onError={() => setImageError(true)}
            />
          ) : null}

          {/* Placeholder when no image */}
          {!hasImage && (
            <View style={styles.placeholderContainer}>
              <Ionicons 
                name={isEvent ? "calendar" : "link"} 
                size={48} 
                color={urlInfo?.platformColor || theme.textSecondary} 
              />
            </View>
          )}

          {/* Content */}
          <View style={styles.contentContainer}>
            {/* Title */}
            <Text style={styles.title} numberOfLines={3}>
              {metadata?.title || "Shared Link"}
            </Text>

            {/* Description */}
            {metadata?.description && (
              <Text style={styles.description} numberOfLines={4}>
                {metadata.description}
              </Text>
            )}

            {/* URL */}
            <View style={styles.urlContainer}>
              <Ionicons name="link" size={14} color={theme.textTertiary} />
              <Text style={styles.urlText} numberOfLines={1}>
                {cleanedUrl}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {/* Primary Action - Extract Event for Instagram, View Event for event platforms */}
          {urlInfo?.type === 'instagram' && instagramData?.featuredPost?.images?.[0] ? (
            <TouchableOpacity 
              style={[styles.actionButton, styles.primaryButton, isExtracting && styles.buttonDisabled]}
              onPress={handleExtractEvent}
              disabled={isExtracting}
            >
              {isExtracting ? (
                <ActivityIndicator size="small" color={theme.textOnPrimary} />
              ) : (
                <Ionicons name="scan" size={20} color={theme.textOnPrimary} />
              )}
              <Text style={[styles.actionButtonText, styles.primaryButtonText]}>
                {isExtracting ? 'Extracting...' : 'Extract Event'}
              </Text>
            </TouchableOpacity>
          ) : isEvent ? (
            <TouchableOpacity 
              style={[styles.actionButton, styles.primaryButton]}
              onPress={handleViewEvent}
            >
              <Ionicons name="calendar" size={20} color={theme.textOnPrimary} />
              <Text style={[styles.actionButtonText, styles.primaryButtonText]}>
                View Event
              </Text>
            </TouchableOpacity>
          ) : null}

          {/* Meetup Event Info */}
          {meetupEvent && (
            <View style={styles.extractedEventCard}>
              <View style={styles.extractedEventHeader}>
                <Ionicons name="people" size={20} color={theme.eventMeetup} />
                <Text style={[styles.extractedEventTitle, { color: theme.eventMeetup }]}>Meetup Event</Text>
              </View>
              
              {meetupEvent.title && (
                <Text style={styles.extractedEventName}>{meetupEvent.title}</Text>
              )}
              
              {meetupEvent.group?.name && (
                <View style={styles.extractedEventRow}>
                  <Ionicons name="people-outline" size={16} color={theme.textSecondary} />
                  <Text style={styles.extractedEventText}>{meetupEvent.group.name}</Text>
                </View>
              )}
              
              {meetupEvent.dateTime && (
                <View style={styles.extractedEventRow}>
                  <Ionicons name="calendar-outline" size={16} color={theme.textSecondary} />
                  <View style={styles.dateTimeContainer}>
                    <Text style={styles.extractedEventText}>
                      {new Date(meetupEvent.dateTime).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </Text>
                    <Text style={styles.extractedEventTime}>
                      {new Date(meetupEvent.dateTime).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </Text>
                  </View>
                </View>
              )}
              
              {meetupEvent.venue && (
                <View style={styles.extractedEventRow}>
                  <Ionicons name="location-outline" size={16} color={theme.textSecondary} />
                  <Text style={styles.extractedEventText}>
                    {meetupEvent.venue.name}
                    {meetupEvent.venue.city ? ` • ${meetupEvent.venue.city}, ${meetupEvent.venue.state}` : ''}
                  </Text>
                </View>
              )}
              
              {meetupEvent.rsvpCount !== undefined && (
                <View style={styles.extractedEventRow}>
                  <Ionicons name="checkmark-circle-outline" size={16} color={theme.textSecondary} />
                  <Text style={styles.extractedEventText}>
                    {meetupEvent.rsvpCount} attending
                  </Text>
                </View>
              )}
              
              {meetupEvent.eventUrl && (
                <TouchableOpacity 
                  style={[styles.ticketButton, { backgroundColor: theme.eventMeetup }]}
                  onPress={() => Linking.openURL(meetupEvent.eventUrl)}
                >
                  <Ionicons name="open-outline" size={18} color={theme.textOnPrimary} />
                  <Text style={styles.ticketButtonText}>View on Meetup</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Extracted Event Info */}
          {extractedEvent?.success && extractedEvent.event && (
            <View style={styles.extractedEventCard}>
              <View style={styles.extractedEventHeader}>
                <Ionicons name="checkmark-circle" size={20} color={theme.success} />
                <Text style={styles.extractedEventTitle}>Event Extracted</Text>
                {extractedEvent.event.type && (
                  <View style={styles.eventTypeBadge}>
                    <Text style={styles.eventTypeBadgeText}>{extractedEvent.event.type}</Text>
                  </View>
                )}
              </View>
              
              {extractedEvent.event.name && (
                <Text style={styles.extractedEventName}>{extractedEvent.event.name}</Text>
              )}
              
              {extractedEvent.event.description && (
                <Text style={styles.extractedEventDescription} numberOfLines={3}>
                  {extractedEvent.event.description}
                </Text>
              )}
              
              {extractedEvent.event.startDatetime && (
                <View style={styles.extractedEventRow}>
                  <Ionicons name="calendar-outline" size={16} color={theme.textSecondary} />
                  <View style={styles.dateTimeContainer}>
                    <Text style={styles.extractedEventText}>
                      {new Date(extractedEvent.event.startDatetime).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </Text>
                    <Text style={styles.extractedEventTime}>
                      {new Date(extractedEvent.event.startDatetime).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      })}
                      {extractedEvent.event.endDatetime && (
                        ` - ${new Date(extractedEvent.event.endDatetime).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true,
                        })}`
                      )}
                    </Text>
                  </View>
                </View>
              )}
              
              {extractedEvent.event.venue && (
                <View style={styles.extractedEventRow}>
                  <Ionicons name="location-outline" size={16} color={theme.textSecondary} />
                  <Text style={styles.extractedEventText}>
                    {extractedEvent.event.venue}
                    {extractedEvent.event.location ? ` • ${extractedEvent.event.location}` : ''}
                  </Text>
                </View>
              )}
              
              {extractedEvent.event.artistNames && extractedEvent.event.artistNames.length > 0 && (
                <View style={styles.extractedEventRow}>
                  <Ionicons name="musical-notes-outline" size={16} color={theme.textSecondary} />
                  <Text style={styles.extractedEventText}>
                    {extractedEvent.event.artistNames.join(', ')}
                  </Text>
                </View>
              )}
              
              {(extractedEvent.event.price || (extractedEvent.event as any).metadata?.price) && (
                <View style={styles.extractedEventRow}>
                  <Ionicons name="pricetag-outline" size={16} color={theme.textSecondary} />
                  <Text style={styles.extractedEventText}>
                    {extractedEvent.event.price || (extractedEvent.event as any).metadata?.price}
                  </Text>
                </View>
              )}
              
              {((extractedEvent.event as any).metadata?.ticketUrl || extractedEvent.event.ticketUrl) && (
                <TouchableOpacity 
                  style={styles.ticketButton}
                  onPress={() => {
                    const ticketUrl = (extractedEvent.event as any).metadata?.ticketUrl || extractedEvent.event?.ticketUrl;
                    if (ticketUrl) {
                      Linking.openURL(ticketUrl);
                    }
                  }}
                >
                  <Ionicons name="ticket-outline" size={18} color={theme.textOnPrimary} />
                  <Text style={styles.ticketButtonText}>Get Tickets</Text>
                </TouchableOpacity>
              )}
              
              {(extractedEvent.event as any).metadata?.additionalInfo && (
                <Text style={styles.additionalInfo}>
                  {(extractedEvent.event as any).metadata.additionalInfo}
                </Text>
              )}
            </View>
          )}

          {/* Secondary Actions Row */}
          <View style={styles.secondaryActionsRow}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={handleOpenInBrowser}
            >
              <Ionicons name="open-outline" size={20} color={theme.text} />
              <Text style={styles.actionButtonText}>Browser</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={handleShare}
            >
              <Ionicons name="share-outline" size={20} color={theme.text} />
              <Text style={styles.actionButtonText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Event Web Modal */}
      {urlInfo && (
        <EventWebModal
          isVisible={webModalVisible}
          url={cleanedUrl}
          title={metadata?.title || urlInfo.platformName}
          onClose={handleCloseModal}
          eventType={getWebModalEventType(urlInfo.type)}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: theme.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    gap: 16,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.text,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: theme.accentPurple,
    borderRadius: 8,
  },
  retryButtonText: {
    color: theme.textOnPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  headerButton: {
    padding: 8,
    marginHorizontal: 8,
  },
  previewCard: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.border,
  },
  platformBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    zIndex: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  platformBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  previewImage: {
    width: "100%",
    backgroundColor: theme.surfaceElevated,
  },
  carouselImage: {
    backgroundColor: theme.surfaceElevated,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.borderLight,
  },
  paginationDotActive: {
    backgroundColor: theme.accentPurple,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  imageCounter: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  imageCounterText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  placeholderContainer: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: theme.surfaceElevated,
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    padding: 16,
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.text,
    lineHeight: 26,
  },
  description: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 20,
  },
  urlContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  urlText: {
    fontSize: 12,
    color: theme.textTertiary,
    flex: 1,
  },
  actionsContainer: {
    gap: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  primaryButton: {
    backgroundColor: theme.accentPurple,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
  },
  tertiaryButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: theme.accentPurple,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.text,
  },
  primaryButtonText: {
    color: theme.textOnPrimary,
  },
  tertiaryButtonText: {
    color: theme.accentPurple,
  },
  secondaryActionsRow: {
    flexDirection: "row",
    gap: 12,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  extractedEventCard: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.success,
    gap: 8,
  },
  extractedEventHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  extractedEventTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.success,
  },
  extractedEventName: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.text,
    marginTop: 4,
  },
  extractedEventRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  extractedEventText: {
    fontSize: 14,
    color: theme.textSecondary,
    flex: 1,
  },
  dateTimeContainer: {
    flex: 1,
  },
  extractedEventTime: {
    fontSize: 14,
    color: theme.text,
    fontWeight: "600",
    marginTop: 2,
  },
  extractedEventDescription: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 20,
    marginTop: 4,
  },
  eventTypeBadge: {
    backgroundColor: theme.accentPurple,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: "auto",
  },
  eventTypeBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: theme.textOnPrimary,
    textTransform: "capitalize",
  },
  ticketButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: theme.success,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  ticketButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.textOnPrimary,
  },
  additionalInfo: {
    fontSize: 13,
    color: theme.textTertiary,
    fontStyle: "italic",
    marginTop: 8,
  },
});

export default SharedURLScreen;
