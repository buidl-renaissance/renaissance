import React, { useRef } from "react";
import { View, StyleSheet, TouchableOpacity, Text, ScrollView, Image, Dimensions, PanResponder, Animated } from "react-native";
import Modal from "react-native-modal";
import Icon, { IconTypes } from "./Icon";
import { TextInputGroup } from "./TextInputGroup";
import DateTimePicker from "./DateTimePicker";
import { AutocompleteDropdown } from "react-native-autocomplete-dropdown";
import { AutocompleteDropdownContextProvider } from "react-native-autocomplete-dropdown";
import { createFlyer } from "../dpop";
import { useVenues } from "../hooks/useVenues";
import { useImagePicker } from "../hooks/useImagePicker";
import { DAVenue } from "../interfaces";
import moment from "moment";
import { Button } from "./Button";

interface CreateFlyerModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export const CreateFlyerModal: React.FC<CreateFlyerModalProps> = ({
  isVisible,
  onClose,
}) => {
  const { pickImage, image, uploadedImageUrl } = useImagePicker({
    allowsEditing: false,
  });

  const [title, onChangeTitle] = React.useState<string>("");
  const [desc, onChangeDesc] = React.useState<string>("");
  const [venue, onChangeVenue] = React.useState<DAVenue>();
  const [venues] = useVenues();

  const [startDate, setStartDate] = React.useState<Date>(
    moment().add("hour", 1).startOf("hour").toDate()
  );
  const [endDate, setEndDate] = React.useState<Date>(
    moment().add("hour", 4).startOf("hour").toDate()
  );

  const [isDismissing, setIsDismissing] = React.useState(false);
  const [isImagePressed, setIsImagePressed] = React.useState(false);
  const translateY = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 0;
      },
      onPanResponderGrant: () => {
        translateY.setOffset(0);
        translateY.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
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
    })
  ).current;

  React.useEffect(() => {
    if (isVisible) {
      setIsDismissing(false);
      translateY.setValue(0);
      // Reset form when modal opens
      onChangeTitle("");
      onChangeDesc("");
      onChangeVenue(undefined);
    }
  }, [isVisible, translateY]);

  const setSelectedItem = React.useCallback(
    (item) => {
      if (venues?.length && item) {
        const selectedVenue = venues.find((v) => `${v.id}` === item.id);
        if (selectedVenue) onChangeVenue(selectedVenue);
      }
    },
    [venues]
  );

  const onChangeStartDate = React.useCallback((date) => {
    setStartDate(date);
    setEndDate(moment(date).add(4, "hour").toDate());
  }, []);

  const onChangeEndDate = React.useCallback((date) => {
    setEndDate(date);
  }, []);

  const handleCreate = React.useCallback(async () => {
    await createFlyer(
      uploadedImageUrl,
      title,
      desc,
      venue,
      startDate?.toISOString(),
      endDate?.toISOString()
    );
    onClose();
  }, [uploadedImageUrl, title, desc, venue, startDate, endDate, onClose]);

  const screenHeight = Dimensions.get("window").height;
  const initialHeight = screenHeight / 3;
  const fullHeight = screenHeight * 0.9;

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
            height: image ? fullHeight : initialHeight,
          },
        ]}
      >
        {/* Drag handle */}
        <View style={styles.dragHandle} {...panResponder.panHandlers}>
          <View style={styles.dragHandleBar} />
        </View>

        {!image ? (
          // Upload UI - centered and enticing
          <View style={styles.uploadContainer}>
            <TouchableOpacity 
              style={styles.uploadButton}
              onPress={pickImage}
              activeOpacity={0.8}
            >
              <View style={styles.uploadIconContainer}>
                <Icon 
                  type={IconTypes.Ionicons} 
                  name="cloud-upload-outline" 
                  size={48} 
                  color="#3449ff" 
                />
              </View>
              <Text style={styles.uploadTitle}>Upload Flyer</Text>
              <Text style={styles.uploadSubtitle}>Tap to select an image</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Form UI
          <AutocompleteDropdownContextProvider headerOffset={0}>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
              <TouchableOpacity 
                onPress={pickImage} 
                style={styles.imageContainer}
                onPressIn={() => setIsImagePressed(true)}
                onPressOut={() => setIsImagePressed(false)}
                activeOpacity={1}
              >
                <Image
                  source={{ uri: image[0].uri }}
                  style={styles.image}
                />
                {isImagePressed && (
                  <View style={styles.imageOverlay}>
                    <Icon 
                      type={IconTypes.Ionicons} 
                      name="camera-outline" 
                      size={24} 
                      color="white" 
                    />
                    <Text style={styles.imageOverlayText}>Change Image</Text>
                  </View>
                )}
              </TouchableOpacity>
              
              <Text style={styles.sectionTitle}>Event Details</Text>
              
              <TextInputGroup
                label="Title"
                placeholder="Event Title (required)"
                onChangeText={onChangeTitle}
                style={styles.input}
                value={title}
              />
              
              <TextInputGroup
                label="Description"
                placeholder="Event Description"
                multiline={true}
                onChangeText={onChangeDesc}
                value={desc}
                style={[styles.input, { height: 80 }]}
              />
              
              <Text style={styles.label}>Venue</Text>
              <AutocompleteDropdown
                clearOnFocus={false}
                closeOnBlur={true}
                closeOnSubmit={false}
                onSelectItem={setSelectedItem}
                suggestionsListMaxHeight={screenHeight * 0.4}
                containerStyle={styles.dropdown}
                dataSet={venues.map((venue) => ({
                  id: `${venue.id}`,
                  title: venue.title,
                }))}
              />
              
              <DateTimePicker
                date={startDate}
                label="Start Date / Time"
                onDateChange={onChangeStartDate}
                style={styles.input}
              />
              
              <DateTimePicker
                date={endDate}
                label="End Date / Time"
                onDateChange={onChangeEndDate}
                style={styles.input}
              />

              <View style={styles.buttonContainer}>
                <Button 
                  title="Create Event" 
                  variant="solid" 
                  onPress={handleCreate}
                />
              </View>
            </ScrollView>
          </AutocompleteDropdownContextProvider>
        )}
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
  uploadContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  uploadButton: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    maxWidth: 300,
  },
  uploadIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f0f4ff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 3,
    borderStyle: "dashed",
    borderColor: "#999",
  },
  uploadTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  uploadSubtitle: {
    fontSize: 16,
    color: "#666",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  imageContainer: {
    position: "relative",
    marginBottom: 24,
    borderRadius: 12,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: Dimensions.get("window").width * 0.8,
    resizeMode: "cover",
  },
  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  imageOverlayText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
    marginBottom: 8,
  },
  dropdown: {
    marginBottom: 16,
  },
  buttonContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
});

