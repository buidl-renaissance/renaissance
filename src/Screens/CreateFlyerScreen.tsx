import React from "react";
import { ScrollView, StyleSheet, Image, View, Dimensions, Text } from "react-native";

import { HeaderTitleImage } from "../Components/HeaderTitleImage";
import { Button } from "../Components/Button";
import { TextInputGroup } from "../Components/TextInputGroup";
import DateTimePicker from "../Components/DateTimePicker";
import { AutocompleteDropdown } from "react-native-autocomplete-dropdown";
import { AutocompleteDropdownContextProvider } from "react-native-autocomplete-dropdown";
import { createFlyer } from "../dpop";
import { useVenues } from "../hooks/useVenues";

import { lightGreen, darkGrey } from "../colors";
import { useImagePicker } from "../hooks/useImagePicker";
import { TouchableOpacity } from "react-native-gesture-handler";
import { DAVenue } from "../interfaces";
import moment from "moment";

const CreateFlyerScreen = ({ navigation, route }) => {
  navigation.setOptions({
    headerTitle: () => <HeaderTitleImage />,
  });

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

  const setSelectedItem = React.useCallback(
    (item) => {
      console.log("Selected Venue: ", item);
      if (venues?.length) onChangeVenue(item);
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

  const handleCreate = React.useCallback(() => {
    (async () => {
      // Create both flyer and event
      await createFlyer(
        uploadedImageUrl,
        title,
        desc,
        venue,
        startDate?.toISOString(),
        endDate?.toISOString()
      );
      navigation.goBack();
    })();
  }, [uploadedImageUrl, title, desc, venue, startDate, endDate]);

  if (image) console.log("image exif: ", image[0].exif);

  return (
    <AutocompleteDropdownContextProvider headerOffset={88}>
      <View style={styles.container}>
        <ScrollView style={{ padding: 16 }}>
          {!image && (
            <Button title="Upload Flyer Image" variant="hollow" onPress={pickImage} />
          )}
          {image && (
            <>
              <TouchableOpacity onPress={pickImage}>
                <Image
                  source={{ uri: image[0].uri }}
                  style={{
                    height:
                      image[0].height *
                      (Dimensions.get("window").width / image[0].width),
                    width: "100%",
                    marginBottom: 24,
                  }}
                />
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
                suggestionsListMaxHeight={Dimensions.get("window").height * 0.4}
                containerStyle={{ marginBottom: 8 }}
                dataSet={venues.map((venue) => {
                  return { id: `${venue.id}`, title: venue.title };
                })}
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
            </>
          )}
        </ScrollView>
        {image && (
          <View style={styles.buttonContainer}>
            <Button title="Create Event" variant="solid" onPress={handleCreate} />
          </View>
        )}
      </View>
    </AutocompleteDropdownContextProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    flexDirection: "column",
    borderColor: "#999",
    borderTopWidth: 1,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 32,
    borderColor: "#999",
    borderBottomWidth: 1,
    backgroundColor: darkGrey,
  },
  input: {
    backgroundColor: "#e5ecf3",
    borderRadius: 4,
    padding: 12,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
    marginTop: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
    marginBottom: 4,
  },
});

export default CreateFlyerScreen;
