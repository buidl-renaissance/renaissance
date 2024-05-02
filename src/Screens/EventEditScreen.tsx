import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Dimensions,
  Image,
  View,
} from "react-native";

import { HeaderTitleImage } from "../Components/HeaderTitleImage";
import { TextInputGroup } from "../Components/TextInputGroup";
// import DateTimePickerModal from "react-native-modal-datetime-picker";
import DateTimePicker from "../Components/DateTimePicker";
import { AutocompleteDropdown } from "react-native-autocomplete-dropdown";
import { AutocompleteDropdownContextProvider } from "react-native-autocomplete-dropdown";
import { Button } from "../Components/Button";

import { lightGreen, darkGrey } from "../colors";
import { DAEvent, DAVenue } from "../interfaces";
import moment from "moment";
import { saveEvent } from "../dpop";

const EventEditScreen = ({ navigation, route }) => {
  navigation.setOptions({
    headerTitle: () => <HeaderTitleImage />,
  });

  const [event, setEvent] = React.useState<DAEvent>(
    route?.params?.event ?? null
  );

  const [title, onChangeTitle] = React.useState<string>(event.title);
  const [desc, onChangeDesc] = React.useState<string>(event.description ?? "");

  const [venue, onChangeVenue] = React.useState<DAVenue>(event.venue);
  const [venues, setVenues] = React.useState<DAVenue[]>([]);
  const [startDate, setStartDate] = React.useState<Date>(
    moment(event.start_date).toDate()
  );
  const [endDate, setEndDate] = React.useState<Date>(
    moment(event.end_date).toDate()
  );

  const setSelectedItem = React.useCallback(
    (item) => {
      console.log("Selected Item: ", item);
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

  const handleSave = React.useCallback(() => {
    event.title = title;
    event.description = desc;
    event.venue = venue;
    event.start_date = startDate.toISOString();
    event.end_date = endDate.toISOString();
    console.log("venue: ", venue);
    (async () => {
      await saveEvent(event);
    })();
  }, [event]);

  const imageHeight = event.image_data?.width
    ? (event.image_data?.height / event.image_data?.width) *
        Dimensions.get("window").width -
      54
    : 420;

  React.useEffect(() => {
    if (!venues?.length) updateVenues();
  }, [venues]);

  const updateVenues = React.useCallback(() => {
    (async () => {
      console.log("UPDATE VENUES!!");
      const eventsRes = await fetch("https://api.dpop.tech/api/venues");
      const fetchedEvents = await eventsRes.json();
      setVenues(fetchedEvents.data);
    })();
  }, []);

  return (
    <AutocompleteDropdownContextProvider headerOffset={88}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.container}>
          <ScrollView
            style={{ padding: 16, zIndex: 1 }}
            contentContainerStyle={{ paddingBottom: 64 }}
          >
            <TextInputGroup
              label="Title"
              placeholder="Title (required)"
              onChangeText={onChangeTitle}
              style={styles.input}
              value={title}
            />
            <TextInputGroup
              label="Description"
              placeholder="Description"
              multiline={true}
              onChangeText={onChangeDesc}
              value={desc}
              style={[
                {
                  height: 80,
                },
                styles.input,
              ]}
            />
            <AutocompleteDropdown
              clearOnFocus={false}
              closeOnBlur={true}
              closeOnSubmit={false}
              initialValue={{ id: `${venue?.id}`, title: venue?.title }} // or just '2'
              onSelectItem={setSelectedItem}
              suggestionsListMaxHeight={Dimensions.get("window").height * 0.4}
              containerStyle={{ marginBottom: 8 }}
              dataSet={venues.map((venue) => {
                return { id: `${venue.id}`, title: venue.title };
              })}
            />
            {/* <TextInputGroup
              label="Venue"
              placeholder="Venue"
              onChangeText={onChangeVenue}
              value={venue}
            /> */}
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
            {event.image && (
              <Image
                source={{
                  uri: event.image,
                }}
                style={{
                  height: imageHeight,
                  width: "100%",
                  resizeMode: "contain",
                }}
              />
            )}
          </ScrollView>
        </View>
        <View style={styles.buttonContainer}>
          <Button title="Save" variant="solid" onPress={handleSave} />
        </View>
      </SafeAreaView>
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
    // backgroundColor: lightGreen,
    backgroundColor: darkGrey,
  },
  input: {
    backgroundColor: "#e5ecf3",
    borderRadius: 4,
    padding: 12,
    marginBottom: 8,
  },
});

export default EventEditScreen;
