import React, { useRef } from "react";
import { View, StyleSheet, TouchableOpacity, Text, ScrollView, Image, Dimensions, PanResponder, Animated, ActivityIndicator, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, SafeAreaView, StatusBar } from "react-native";
import Modal from "react-native-modal";
import Icon, { IconTypes } from "./Icon";
import { TextInputGroup } from "./TextInputGroup";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { AutocompleteDropdownContextProvider } from "react-native-autocomplete-dropdown";
import { createFlyer, uploadImage, extractFlyerData } from "../dpop";
import { useVenues } from "../hooks/useVenues";
import { useImagePicker } from "../hooks/useImagePicker";
import { DAVenue } from "../interfaces";
import moment from "moment";
import momentTz from "moment-timezone";
import { Button } from "./Button";
import * as FileSystem from "expo-file-system";
import { DismissibleScrollModal } from "./DismissibleScrollModal";
import { FlatList } from "react-native";
import { Searchbar } from "react-native-paper";
import { darkGrey } from "../colors";
import Svg, { Defs, LinearGradient, Stop, Rect, Line } from "react-native-svg";

interface CreateFlyerModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export const CreateFlyerModal: React.FC<CreateFlyerModalProps> = ({
  isVisible,
  onClose,
}) => {
  const { pickImage, image } = useImagePicker({
    allowsEditing: false,
  });

  const [title, onChangeTitle] = React.useState<string>("");
  const [desc, onChangeDesc] = React.useState<string>("");
  const [uploadedImageUrl, setUploadedImageUrl] = React.useState<string | null>(null);
  const [isExtracting, setIsExtracting] = React.useState<boolean>(false);
  const [extractedData, setExtractedData] = React.useState<any>(null);
  const extractionAttemptedRef = React.useRef<string | null>(null);
  const [extractedLocationName, setExtractedLocationName] = React.useState<string | null>(null);
  const [venue, onChangeVenue] = React.useState<DAVenue>();
  const [venues] = useVenues();
  const [keyboardHeight, setKeyboardHeight] = React.useState(0);

  const [startDate, setStartDate] = React.useState<Date>(
    moment().add("hour", 1).startOf("hour").toDate()
  );
  const [endDate, setEndDate] = React.useState<Date>(
    moment().add("hour", 4).startOf("hour").toDate()
  );

  const [isDismissing, setIsDismissing] = React.useState(false);
  const [isImagePressed, setIsImagePressed] = React.useState(false);
  const [isAtTop, setIsAtTop] = React.useState(true);
  const [isDraggingDown, setIsDraggingDown] = React.useState(false);
  const [isVenueModalVisible, setIsVenueModalVisible] = React.useState(false);
  const [venueSearchQuery, setVenueSearchQuery] = React.useState("");
  const [isStartDatePickerVisible, setIsStartDatePickerVisible] = React.useState(false);
  const [isEndDatePickerVisible, setIsEndDatePickerVisible] = React.useState(false);
  const venueSearchbarRef = React.useRef<any>(null);
  const isAtTopRef = useRef(true);
  const translateY = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const titleInputRef = useRef<View>(null);
  const descInputRef = useRef<View>(null);
  const venueContainerRef = useRef<TouchableOpacity>(null);
  const focusedInputRef = useRef<'title' | 'desc' | 'venue' | null>(null);

  // Pan responder for drag handle
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 5;
      },
      onPanResponderGrant: () => {
        setIsDraggingDown(true);
        translateY.setOffset(0);
        translateY.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        setIsDraggingDown(false);
        translateY.flattenOffset();

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
      onStartShouldSetPanResponder: () => isAtTopRef.current,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return isAtTopRef.current && gestureState.dy > 5;
      },
      onPanResponderGrant: () => {
        setIsDraggingDown(true);
        translateY.setOffset(0);
        translateY.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        if (isAtTopRef.current && gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        setIsDraggingDown(false);
        translateY.flattenOffset();

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

  const handleScroll = React.useCallback((event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const wasAtTop = offsetY <= 0;
    setIsAtTop(wasAtTop);
    isAtTopRef.current = wasAtTop;
  }, []);

  React.useEffect(() => {
    if (isVisible) {
      setIsDismissing(false);
      translateY.setValue(0);
      setIsAtTop(true);
      isAtTopRef.current = true;
      // Reset form when modal opens
      onChangeTitle("");
      onChangeDesc("");
      onChangeVenue(undefined);
      setUploadedImageUrl(null);
      setIsExtracting(false);
      setExtractedData(null);
      setExtractedLocationName(null);
      extractionAttemptedRef.current = null;
    }
  }, [isVisible, translateY]);

  // Upload image and extract data when image is selected
  React.useEffect(() => {
    (async () => {
      if (!image || !image[0]) return;
      
      const imageUri = image[0].uri;
      if (!imageUri || uploadedImageUrl || isExtracting || extractionAttemptedRef.current === imageUri || extractedData) {
        return;
      }
      
      extractionAttemptedRef.current = imageUri;
      try {
        setIsExtracting(true);

        // Convert image to base64 for extraction
        const imageUriForExtraction = image[0].uri;
        // Use FileSystem to read as base64
        let base64Image: string;
        try {
          // Try reading as base64 directly
          base64Image = await (FileSystem as any).readAsStringAsync(imageUriForExtraction, {
            encoding: (FileSystem as any).EncodingType?.Base64 || 'base64',
          });
        } catch (e) {
          // Fallback: read file and convert
          const response = await fetch(imageUriForExtraction);
          const blob = await response.blob();
          const reader = new FileReader();
          base64Image = await new Promise<string>((resolve, reject) => {
            reader.onloadend = () => {
              const result = reader.result as string;
              // Remove data URL prefix if present
              const base64 = result.includes(',') ? result.split(',')[1] : result;
              resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        }

        // Extract data from the flyer using base64
        try {
          const extracted = await extractFlyerData(base64Image);
          setExtractedData(extracted);

          // Populate form fields with extracted data
          if (extracted) {
            // Map API response fields to form fields
            // API uses: name, description, location, startTime, endTime
            if (extracted.name || extracted.title) {
              onChangeTitle(extracted.name || extracted.title);
            }
            if (extracted.description) {
              onChangeDesc(extracted.description);
            }
            // Try location or venue field
            const venueName = extracted.location || extracted.venue;
            if (venueName) {
              setExtractedLocationName(venueName);
              if (venues?.length) {
                // Try to find matching venue by name (fuzzy matching)
                const extractedVenueLower = venueName.toLowerCase();
                const matchedVenue = venues.find(
                  (v) => {
                    const venueTitleLower = v.title.toLowerCase();
                    return venueTitleLower.includes(extractedVenueLower) ||
                      extractedVenueLower.includes(venueTitleLower) ||
                      venueTitleLower === extractedVenueLower;
                  }
                );
                if (matchedVenue) {
                  onChangeVenue(matchedVenue);
                  setExtractedLocationName(null); // Clear extracted name if we found a match
                }
              }
            }
            // Map startTime or start_date
            const startTime = extracted.startTime || extracted.start_date;
            if (startTime) {
              // Parse date - API returns times in EST but marked as UTC (with Z)
              // Remove Z and parse as EST/EDT (America/New_York)
              const timeString = startTime.toString().replace('Z', '');
              const parsedStartDate = momentTz.tz(timeString, 'America/New_York').toDate();
              if (!isNaN(parsedStartDate.getTime())) {
                setStartDate(parsedStartDate);
                // Set end date 4 hours after start if not provided
                const endTime = extracted.endTime || extracted.end_date;
                if (!endTime) {
                  setEndDate(moment(parsedStartDate).add(4, "hour").toDate());
                }
              }
            }
            // Map endTime or end_date
            const endTime = extracted.endTime || extracted.end_date;
            if (endTime) {
              // Parse date - API returns times in EST but marked as UTC (with Z)
              // Remove Z and parse as EST/EDT (America/New_York)
              const timeString = endTime.toString().replace('Z', '');
              const parsedEndDate = momentTz.tz(timeString, 'America/New_York').toDate();
              if (!isNaN(parsedEndDate.getTime())) {
                setEndDate(parsedEndDate);
              }
            }
          }
        } catch (extractError) {
          console.error("Error extracting flyer data:", extractError);
          // Continue without extracted data - user can fill manually
        }

        // Upload the image for storage (even if extraction failed)
        try {
          const uploadResult = await uploadImage(image[0]);
          const imageUrl = uploadResult?.url;
          if (imageUrl) {
            setUploadedImageUrl(imageUrl);
          }
        } catch (uploadError) {
          console.error("Error uploading image:", uploadError);
        }
      } catch (error) {
        console.error("Error processing image:", error);
      } finally {
        setIsExtracting(false);
      }
    })();
  }, [image, uploadedImageUrl, isExtracting, extractedData, venues, onChangeTitle, onChangeDesc, onChangeVenue]);

  const handleSelectVenue = React.useCallback((selectedVenue: DAVenue) => {
    onChangeVenue(selectedVenue);
    setExtractedLocationName(null); // Clear extracted name when a venue is selected
    setIsVenueModalVisible(false);
  }, [onChangeVenue]);

  const handleClearVenue = React.useCallback(() => {
    onChangeVenue(undefined);
    if (extractedLocationName) {
      // If we have an extracted location name, keep it when clearing venue
    } else {
      setExtractedLocationName(null);
    }
  }, [onChangeVenue, extractedLocationName]);

  // Auto-focus search bar when venue modal opens
  React.useEffect(() => {
    if (isVenueModalVisible && venueSearchbarRef.current) {
      setTimeout(() => {
        venueSearchbarRef.current?.focus();
      }, 100);
    } else {
      // Clear search when modal closes
      setVenueSearchQuery("");
    }
  }, [isVenueModalVisible]);

  const onChangeStartDate = React.useCallback((date) => {
    setStartDate(date);
    setEndDate(moment(date).add(4, "hour").toDate());
  }, []);

  const onChangeEndDate = React.useCallback((date) => {
    setEndDate(date);
  }, []);

  // Handle keyboard height tracking and scroll to focused input
  React.useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        const keyboardHeight = e.endCoordinates.height;
        setKeyboardHeight(keyboardHeight);

        // Scroll to focused input after keyboard animation
        setTimeout(() => {
          if (!scrollViewRef.current) return;

          const focused = focusedInputRef.current;
          let refToScroll: React.RefObject<View> | null = null;

          if (focused === 'title') refToScroll = titleInputRef;
          else if (focused === 'desc') refToScroll = descInputRef;
          else if (focused === 'venue') refToScroll = venueContainerRef;

          if (!refToScroll || !refToScroll.current) return;

          refToScroll.current.measureLayout(
            scrollViewRef.current as any,
            (x, y, width, height) => {
              // Scroll to show input with padding above
              scrollViewRef.current?.scrollTo({
                y: Math.max(0, y - 100),
                animated: true,
              });
            },
            () => {
              // Fallback: use measure if measureLayout fails
              refToScroll?.current?.measure((fx, fy, fw, fh, fpx, fpy) => {
                const estimatedY = Math.max(0, fpy - 100);
                scrollViewRef.current?.scrollTo({
                  y: estimatedY,
                  animated: true,
                });
              });
            }
          );
        }, Platform.OS === 'ios' ? 300 : 150);
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  // Check if form is valid (all required fields filled)
  const isFormValid = React.useMemo(() => {
    return !!(
      uploadedImageUrl &&
      title?.trim() &&
      startDate &&
      endDate
    );
  }, [uploadedImageUrl, title, startDate, endDate]);

  const handleCreate = React.useCallback(async () => {
    if (!isFormValid) return;

    try {
      await createFlyer(
        uploadedImageUrl,
        title,
        desc,
        venue,
        startDate?.toISOString(),
        endDate?.toISOString()
      );
      onClose();
    } catch (error) {
      console.error("Error creating flyer/event:", error);
      // You might want to show an error message to the user here
    }
  }, [uploadedImageUrl, title, desc, venue, startDate, endDate, isFormValid, onClose]);

  const screenHeight = Dimensions.get("window").height;
  const screenWidth = Dimensions.get("window").width;
  const initialHeight = screenHeight / 3;
  const fullHeight = screenHeight * 0.9;
  const containerHeight = (image && !isExtracting) ? fullHeight : initialHeight;

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
            height: containerHeight,
          },
        ]}
      >
        {/* Gradient Background */}
        <View style={styles.gradientContainer}>
          <Svg height={containerHeight} width={screenWidth} style={StyleSheet.absoluteFill}>
            <Defs>
              <LinearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor="#1E40AF" stopOpacity="1" />
                <Stop offset="100%" stopColor="#1E3A8A" stopOpacity="1" />
              </LinearGradient>
            </Defs>
            <Rect width={screenWidth} height={containerHeight} fill="url(#gradient)" />
          </Svg>
        </View>

        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Create Event</Text>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleCreate}
              disabled={!isFormValid}
            >
              <Icon
                type={IconTypes.Ionicons}
                name="checkmark"
                size={24}
                color={isFormValid ? "#fff" : "rgba(255, 255, 255, 0.5)"}
              />
            </TouchableOpacity>
          </View>

          {!image || (isExtracting && !extractedData) ? (
            // Upload UI or Extracting UI
            <View style={styles.uploadContainer}>
              <View style={styles.uploadButton}>
                {isExtracting ? (
                  <>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={styles.uploadTitle}>Extracting flyer details</Text>
                    <Text style={styles.uploadSubtitle}>Please wait...</Text>
                  </>
                ) : (
                  <>
                    <TouchableOpacity
                      onPress={pickImage}
                      activeOpacity={0.8}
                      style={styles.uploadIconContainer}
                    >
                      <Icon
                        type={IconTypes.Ionicons}
                        name="cloud-upload-outline"
                        size={48}
                        color="#fff"
                      />
                    </TouchableOpacity>
                    <Text style={styles.uploadTitle}>Upload Flyer</Text>
                    <Text style={styles.uploadSubtitle}>Tap to select an image</Text>
                  </>
                )}
              </View>
            </View>
          ) : (
            // Form UI
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={{ flex: 1 }}
              keyboardVerticalOffset={0}
            >
              <View
                style={{ flex: 1 }}
                {...(isAtTop ? contentPanResponder.panHandlers : {})}
                collapsable={false}
              >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                  <ScrollView
                    ref={scrollViewRef}
                    style={styles.scrollView}
                    contentContainerStyle={[
                      styles.scrollContent,
                      { paddingBottom: keyboardHeight > 0 ? keyboardHeight + 50 : 80 }
                    ]}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    keyboardDismissMode="interactive"
                    scrollEnabled={!isDraggingDown}
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                  >
                    {/* Image Card - only show when not extracting */}
                    {!isExtracting && image && image[0] && (
                      <View style={styles.imageCardWrapper}>
                        <TouchableOpacity
                          onPress={pickImage}
                          style={styles.imageCard}
                          onPressIn={() => setIsImagePressed(true)}
                          onPressOut={() => setIsImagePressed(false)}
                          activeOpacity={0.9}
                        >
                          <Image
                            source={{ uri: image[0].uri }}
                            style={[
                              styles.imageCardImage,
                              image[0].width && image[0].height ? {
                                height: (Dimensions.get("window").width * 0.75) * (image[0].height / image[0].width) - 36
                              } : undefined
                            ]}
                            resizeMode="cover"
                          />
                          <View style={styles.imageChangeButton}>
                            <Icon
                              type={IconTypes.Ionicons}
                              name="image-outline"
                              size={20}
                              color="#fff"
                            />
                          </View>
                        </TouchableOpacity>
                      </View>
                    )}
                    {!isExtracting && (
                      <>
                        {/* Event Name */}
                        <View ref={titleInputRef} style={styles.formSection}>
                          <TextInputGroup
                            label=""
                            placeholder="Enter event name"
                            onChangeText={onChangeTitle}
                            style={styles.eventNameInput}
                            value={title}
                            onFocus={() => {
                              focusedInputRef.current = 'title';
                            }}
                          />
                        </View>

                        {/* Start/End Time */}
                        <View style={styles.formSection}>
                          <View style={styles.timeCard}>
                            <View style={styles.timeRow}>
                              <View style={styles.timeLeftContainer}>
                                <View style={styles.timeDotSolid} />
                                <Text style={styles.timeLabel}>Start</Text>
                              </View>
                              <TouchableOpacity
                                onPress={() => setIsStartDatePickerVisible(true)}
                                style={styles.timeValueTouchable}
                              >
                                <Text style={styles.timeValueText}>
                                  {moment(startDate).format("ddd, MMM D [at] h:mm A")}
                                </Text>
                              </TouchableOpacity>
                            </View>
                            <View style={styles.timeDivider} />
                            <View style={styles.timeRow}>
                              <View style={styles.timeLeftContainer}>
                                <View style={styles.timeDotHollow} />
                                <Text style={styles.timeLabel}>End</Text>
                              </View>
                              <TouchableOpacity
                                onPress={() => setIsEndDatePickerVisible(true)}
                                style={styles.timeValueTouchable}
                              >
                                <Text style={styles.timeValueText}>
                                  {moment(startDate).isSame(moment(endDate), 'day')
                                    ? moment(endDate).format("h:mm A")
                                    : moment(endDate).format("ddd, MMM D [at] h:mm A")}
                                </Text>
                              </TouchableOpacity>
                            </View>
                            <View style={styles.timeLineVertical}>
                              <Svg height={30} width={2}>
                                <Line
                                  x1="1"
                                  y1="4"
                                  x2="1"
                                  y2={60}
                                  stroke="rgba(255, 255, 255, 0.5)"
                                  strokeWidth={2}
                                  strokeDasharray="4,4"
                                />
                              </Svg>
                            </View>
                          </View>
                        </View>

                        {/* Location Button */}
                        <View ref={venueContainerRef} style={styles.formSection}>
                          <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => {
                              focusedInputRef.current = 'venue';
                              setIsVenueModalVisible(true);
                            }}
                          >
                            <Icon
                              type={IconTypes.Ionicons}
                              name="location-outline"
                              size={20}
                              color="#fff"
                            />
                            <Text style={[
                              styles.actionButtonText,
                              !venue && !extractedLocationName && styles.actionButtonPlaceholder
                            ]}>
                              {venue ? venue.title : extractedLocationName || "Choose Location"}
                            </Text>
                            {(venue || extractedLocationName) && (
                              <TouchableOpacity
                                onPress={(e) => {
                                  e.stopPropagation();
                                  handleClearVenue();
                                }}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                              >
                                <Icon type={IconTypes.Ionicons} name="close-circle" size={20} color="#999" />
                              </TouchableOpacity>
                            )}
                          </TouchableOpacity>
                        </View>

                        {/* Description Input */}
                        <View ref={descInputRef} style={styles.formSection}>
                          <TextInputGroup
                            placeholder="Add Description"
                            placeholderTextColor="rgba(255, 255, 255, 0.6)"
                            multiline={true}
                            onChangeText={onChangeDesc}
                            value={desc}
                            style={styles.descriptionInput}
                            label=""
                            onFocus={() => {
                              focusedInputRef.current = 'desc';
                            }}
                          />
                        </View>
                      </>
                    )}
                  </ScrollView>
                </TouchableWithoutFeedback>
              </View>
            </KeyboardAvoidingView>
          )}
        </SafeAreaView>
      </Animated.View>

      {/* DateTime Pickers */}
      <DateTimePickerModal
        isVisible={isStartDatePickerVisible}
        mode="datetime"
        date={startDate}
        isDarkModeEnabled={false}
        onConfirm={(date) => {
          onChangeStartDate(date);
          setIsStartDatePickerVisible(false);
        }}
        onCancel={() => setIsStartDatePickerVisible(false)}
      />
      <DateTimePickerModal
        isVisible={isEndDatePickerVisible}
        mode="datetime"
        date={endDate}
        isDarkModeEnabled={false}
        onConfirm={(date) => {
          onChangeEndDate(date);
          setIsEndDatePickerVisible(false);
        }}
        onCancel={() => setIsEndDatePickerVisible(false)}
      />

      {/* Venue Selection Modal */}
      <DismissibleScrollModal
        isVisible={isVenueModalVisible}
        onClose={() => setIsVenueModalVisible(false)}
        title="Select Venue"
      >
        {({ onScroll, scrollEnabled }) => {
          // Filter venues based on search query
          const query = venueSearchQuery.trim().toLowerCase();
          const filteredVenues = venues.filter((v) => {
            if (!query) return true;
            return (
              v.title?.toLowerCase().includes(query) ||
              v.venue?.toLowerCase().includes(query) ||
              v.address?.toLowerCase().includes(query)
            );
          });

          const filteredExtractedLocation = extractedLocationName && !venue
            ? (query ? extractedLocationName.toLowerCase().includes(query) : true)
            : false;

          const venueListData = [
            // Add extracted location if it doesn't match any venue and matches search
            ...(filteredExtractedLocation
              ? [{ id: 'extracted-location', title: extractedLocationName, isExtracted: true }]
              : []),
            // Add all filtered venues
            ...filteredVenues.map((v) => ({
              id: v.id,
              title: v.title,
              venue: v,
              isExtracted: false,
            })),
          ];

          return (
            <View style={styles.venueModalContent}>
              <View style={styles.searchContainer}>
                <Searchbar
                  ref={venueSearchbarRef}
                  placeholder="Search venues..."
                  onChangeText={setVenueSearchQuery}
                  value={venueSearchQuery}
                  style={styles.searchbar}
                />
              </View>
              <FlatList
                data={venueListData}
                keyExtractor={(item, index) => item.id?.toString() || item.title || `venue-${index}`}
                onScroll={onScroll}
                scrollEnabled={scrollEnabled}
                scrollEventThrottle={16}
                renderItem={({ item }) => {
                  const isExtracted = item.isExtracted;
                  const itemVenue = 'venue' in item ? item.venue : null;
                  const isSelected = !isExtracted && itemVenue && venue?.id === itemVenue.id;
                  return (
                    <TouchableOpacity
                      style={[
                        styles.venueListItem,
                        isSelected && styles.venueListItemSelected,
                      ]}
                      onPress={() => {
                        if (isExtracted) {
                          onChangeVenue(undefined);
                          setExtractedLocationName(item.title);
                        } else if (itemVenue) {
                          handleSelectVenue(itemVenue);
                        }
                        setIsVenueModalVisible(false);
                      }}
                    >
                      <Text style={[
                        styles.venueListItemText,
                        isSelected && styles.venueListItemTextSelected,
                      ]}>
                        {item.title}
                      </Text>
                      {isSelected && (
                        <Icon type={IconTypes.Ionicons} name="checkmark" size={24} color="#3449ff" />
                      )}
                    </TouchableOpacity>
                  );
                }}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                      {venueSearchQuery ? "No venues found" : "No venues available"}
                    </Text>
                  </View>
                }
              />
            </View>
          );
        }}
      </DismissibleScrollModal>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: "flex-end",
  },
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
    position: "relative",
  },
  gradientContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  safeArea: {
    flex: 1,
    zIndex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  uploadContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  uploadButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "rgba(255, 255, 255, 0.5)",
    padding: 48,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    maxWidth: 300,
    minHeight: 200,
  },
  uploadIconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginTop: 16,
    marginBottom: 8,
  },
  uploadSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 80,
  },
  imageCardWrapper: {
    marginBottom: 24,
    alignItems: "center",
  },
  imageCard: {
    width: "75%",
    backgroundColor: "#E0F2FE",
    borderRadius: 24,
    overflow: "hidden",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  imageCardImage: {
    width: "100%",
  },
  imageChangeButton: {
    position: "absolute",
    bottom: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  formSection: {
    marginBottom: 24,
  },
  eventNameInput: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 32,
    padding: 16,
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 0,
    borderWidth: 1.5,
    borderColor: "rgba(200, 220, 240, 0.6)",
    color: "#fff",
  },
  timeCard: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 24,
    padding: 16,
    paddingVertical: 4,
    position: "relative",
    borderWidth: 1.5,
    borderColor: "rgba(200, 220, 240, 0.4)",
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  timeLeftContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minWidth: 60,
  },
  timeDotSolid: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  timeDotHollow: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.8)",
    backgroundColor: "transparent",
  },
  timeLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: "#fff",
  },
  timeValueTouchable: {
    flex: 1,
    alignItems: "flex-end",
  },
  timeValueText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "500",
  },
  timeDivider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    marginLeft: 20,
    marginVertical: 0,
    marginRight: 0,
  },
  timeLineVertical: {
    position: "absolute",
    left: 20,
    top: 24,
    width: 2,
    height: 10,
    zIndex: 0,
    pointerEvents: "none",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 24,
    padding: 16,
    gap: 12,
    borderWidth: 1.5,
    borderColor: "rgba(200, 220, 240, 0.6)",
  },
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    color: "#fff",
    fontWeight: "500",
  },
  actionButtonPlaceholder: {
    color: "rgba(255, 255, 255, 0.6)",
  },
  descriptionInput: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 24,
    padding: 16,
    minHeight: 120,
    marginBottom: 0,
    borderWidth: 1.5,
    borderColor: "rgba(200, 220, 240, 0.6)",
    color: "#fff",
  },
  venueListItem: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  venueListItemSelected: {
    backgroundColor: "#f5f5ff",
  },
  venueListItemText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  venueListItemTextSelected: {
    color: "#3449ff",
    fontWeight: "600",
  },
  emptyContainer: {
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
  },
  venueModalContent: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  searchbar: {
    backgroundColor: "#f5f5f5",
    elevation: 0,
  },
  extractingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    marginTop: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 16,
  },
  extractingText: {
    marginLeft: 12,
    fontSize: 16,
    color: "#fff",
    fontWeight: "500",
  },
});

